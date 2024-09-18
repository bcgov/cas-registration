from django.db import transaction
from typing import Optional
from django.db.models import QuerySet
from uuid import UUID
from registration.constants import UNAUTHORIZED_MESSAGE
from registration.models.business_role import BusinessRole
from registration.models.contact import Contact
from registration.models.operator import Operator
from registration.schema.v1.contact import ContactFilterSchema, ContactIn
from service.data_access_service.address_service import AddressDataAccessService
from service.data_access_service.contact_service import ContactDataAccessService
from service.data_access_service.user_service import UserDataAccessService
from ninja import Query
from registration.models.operation import Operation

from django.db.models import ManyToManyRel, ManyToOneRel


class ContactService:
    @classmethod
    def list_contacts(
        cls,
        user_guid: UUID,
        sort_field: Optional[str],
        sort_order: Optional[str],
        filters: ContactFilterSchema = Query(...),
    ) -> QuerySet[Contact]:
        user = UserDataAccessService.get_by_guid(user_guid)
        sort_direction = "-" if sort_order == "desc" else ""
        sort_by = f"{sort_direction}{sort_field}"
        base_qs = ContactDataAccessService.get_all_contacts_for_user(user)
        return filters.filter(base_qs).order_by(sort_by)

    @classmethod
    def get_if_authorized(cls, user_guid: UUID, contact_id: int) -> Optional[Contact]:
        user = UserDataAccessService.get_by_guid(user_guid)
        user_contacts = ContactDataAccessService.get_all_contacts_for_user(user)
        contact = user_contacts.filter(id=contact_id).first()
        if user.is_industry_user() and not contact:
            raise Exception(UNAUTHORIZED_MESSAGE)
        return contact

    @classmethod
    def get_with_places_assigned(cls, user_guid: UUID, contact_id: int) -> Optional[Contact]:
        contact = cls.get_if_authorized(user_guid, contact_id)

        places_assigned = []
        if contact:
            for contact_field in contact._meta.get_fields():
                if isinstance(contact_field, (ManyToOneRel, ManyToManyRel)):
                    related_objects = getattr(contact, contact_field.name).all()

                    for object in related_objects:
                        role_name = contact.business_role.role_name
                        if isinstance(object, Operator):
                            place = f"{role_name} - {object.legal_name}"
                        elif isinstance(object, Operation):
                            place = f"{role_name} - {object.name}"
                        else:
                            # If the relation doesn't have a custom format (e.g. for operator we want to show the legal name), then we just show the contact role and the related model name
                            place = f"{role_name} - {related_objects.model.__name__}"

                        places_assigned.append(place)

            # Return the Contact plus places_assigned
            result = contact
            result.places_assigned = places_assigned
            return result
        return None

    @classmethod
    @transaction.atomic()
    def create_contact(cls, user_guid: UUID, payload: ContactIn) -> Contact:
        contact_data: dict = payload.dict(include={*ContactIn.Meta.fields})
        # `business_role` is a mandatory field in the DB but we don't collect it from the user
        # so we set it to a default value here and we can change it later if needed
        contact_data['business_role'] = BusinessRole.objects.get(role_name="Operation Representative")
        contact = ContactDataAccessService.update_or_create(None, contact_data, user_guid)

        # Create address
        address_data = payload.dict(
            include={'street_address', 'municipality', 'province', 'postal_code'}, exclude_none=True
        )
        if address_data:
            address = AddressDataAccessService.create_address(address_data)
            contact.address = address
            # not calling `set_create_or_update` because we are updating the contact in the same transaction
            contact.save(update_fields=['address_id'])
        operator: Operator = UserDataAccessService.get_user_operator_by_user(user_guid).operator
        operator.contacts.add(contact)
        operator.set_create_or_update(user_guid)
        return contact

    @classmethod
    @transaction.atomic()
    def update_contact(cls, user_guid: UUID, contact_id: int, payload: ContactIn) -> Contact:
        # Make sure user has access to the contact
        if not ContactDataAccessService.user_has_access(user_guid, contact_id):
            raise Exception(UNAUTHORIZED_MESSAGE)

        # UPDATE CONTACT
        contact_data: dict = payload.dict(include={*ContactIn.Meta.fields})
        contact = ContactDataAccessService.update_or_create(contact_id, contact_data, user_guid)
        # UPDATE ADDRESS
        address_data = payload.dict(include={'street_address', 'municipality', 'province', 'postal_code'})
        if any(address_data.values()):  # if any address data is provided
            address = AddressDataAccessService.upsert_address_from_data(address_data, contact.address_id)
            contact.address = address
            contact.save(update_fields=['address_id'])
        else:
            existing_contact_address = contact.address
            if existing_contact_address:
                contact.address = None
                contact.save(update_fields=['address'])
                # contact has an address and the payload has no address data, remove the address
                existing_contact_address.delete()
        contact.set_create_or_update(user_guid)
        return contact
