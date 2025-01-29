from django.db import transaction
from typing import Optional, cast, Union, Dict
from django.db.models import QuerySet
from uuid import UUID


from registration.constants import UNAUTHORIZED_MESSAGE
from registration.models.business_role import BusinessRole
from registration.models.contact import Contact
from registration.models.operator import Operator
from registration.schema.v1.contact import ContactFilterSchema, ContactIn, ContactOut
from registration.schema.v2.operation import OperationRepresentativeIn
from service.data_access_service.address_service import AddressDataAccessService
from service.data_access_service.contact_service import ContactDataAccessService
from service.data_access_service.user_service import UserDataAccessService
from ninja import Query
from service.operation_service import OperationService


class ContactWithPlacesAssigned(ContactOut):
    places_assigned: Optional[list[str]]


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
    def list_operation_representatives(
        cls,
        operation_id: UUID,
        user_guid: UUID,
    ) -> QuerySet[Contact]:
        operation = OperationService.get_if_authorized(user_guid, operation_id)
        return operation.contacts.order_by('-created_at')

    @classmethod
    def get_if_authorized(cls, user_guid: UUID, contact_id: int) -> Optional[Contact]:
        user = UserDataAccessService.get_by_guid(user_guid)
        user_contacts = ContactDataAccessService.get_all_contacts_for_user(user)
        contact = user_contacts.filter(id=contact_id).first()
        if user.is_industry_user() and not contact:
            raise Exception(UNAUTHORIZED_MESSAGE)
        return contact

    @classmethod
    def get_with_places_assigned(cls, user_guid: UUID, contact_id: int) -> Optional[ContactWithPlacesAssigned]:
        contact = cls.get_if_authorized(user_guid, contact_id)
        places_assigned = []
        if contact:
            role_name = contact.business_role.role_name
            for operation in contact.operations_contacts.all():
                places_assigned.append(f"{role_name} - {operation.name}")
            # Return the Contact plus places_assigned
            result = cast(ContactWithPlacesAssigned, contact)
            if places_assigned:
                result.places_assigned = places_assigned
            return result
        return None

    @classmethod
    @transaction.atomic()
    def create_contact(cls, user_guid: UUID, payload: Union[ContactIn, OperationRepresentativeIn]) -> Contact:
        contact_data: dict = payload.dict(include={*ContactIn.Meta.fields})
        # `business_role` is a mandatory field in the DB but we don't collect it from the user
        # so we set it to a default value here and we can change it later if needed
        contact_data['business_role'] = BusinessRole.objects.get(role_name="Operation Representative")
        contact: Contact
        contact = ContactDataAccessService.update_or_create(None, contact_data, user_guid)

        # Create address
        address_data = payload.dict(
            include={'street_address', 'municipality', 'province', 'postal_code'}, exclude_none=True
        )
        if address_data:
            address = AddressDataAccessService.create_address(address_data)
            contact.address = address
            contact.save(update_fields=['address_id'])
        operator: Operator = UserDataAccessService.get_user_operator_by_user(user_guid).operator
        operator.contacts.add(contact)
        return contact

    @classmethod
    @transaction.atomic()
    def update_contact(
        cls, user_guid: UUID, contact_id: int, payload: Union[ContactIn, OperationRepresentativeIn]
    ) -> Contact:
        # Make sure user has access to the contact
        if not ContactDataAccessService.user_has_access(user_guid, contact_id):
            raise Exception(UNAUTHORIZED_MESSAGE)

        # UPDATE CONTACT
        contact_data: Dict = payload.dict(include={*ContactIn.Meta.fields})
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
        return contact
