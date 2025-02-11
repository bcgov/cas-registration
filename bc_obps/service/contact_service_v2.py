from typing import Optional
from django.db.models import QuerySet
from uuid import UUID


from registration.models.contact import Contact
from registration.schema.v2.contact import ContactFilterSchemaV2, ContactWithPlacesAssigned, PlacesAssigned
from service.data_access_service.contact_service import ContactDataAccessService
from service.data_access_service.contact_service_v2 import ContactDataAccessServiceV2
from service.data_access_service.user_service import UserDataAccessService
from ninja import Query
from django.db import transaction
from typing import cast, Union, Dict


from registration.models.business_role import BusinessRole
from registration.schema.v1.contact import ContactIn
from registration.schema.v2.operation import OperationRepresentativeIn
from service.data_access_service.address_service import AddressDataAccessService


class ContactServiceV2:
    @classmethod
    def list_contacts_v2(
        cls,
        user_guid: UUID,
        sort_field: Optional[str],
        sort_order: Optional[str],
        filters: ContactFilterSchemaV2 = Query(...),
    ) -> QuerySet[Contact]:
        user = UserDataAccessService.get_by_guid(user_guid)
        sort_direction = "-" if sort_order == "desc" else ""
        sort_by = f"{sort_direction}{sort_field}"
        base_qs = ContactDataAccessServiceV2.get_all_contacts_for_user_v2(user)

        return filters.filter(base_qs).order_by(sort_by)

    @classmethod
    @transaction.atomic()
    def create_contact(cls, user_guid: UUID, payload: Union[ContactIn, OperationRepresentativeIn]) -> Contact:
        contact_data: dict = payload.dict(include={*ContactIn.Meta.fields})
        # `business_role` is a mandatory field in the DB but we don't collect it from the user
        # so we set it to a default value here and we can change it later if needed
        contact_data['business_role'] = BusinessRole.objects.get(role_name="Operation Representative")

        contact_data['operator'] = UserDataAccessService.get_operator_by_user(user_guid)

        contact: Contact
        contact = ContactDataAccessServiceV2.update_or_create_v2(None, contact_data, user_guid)

        # Create address
        address_data = payload.dict(
            include={'street_address', 'municipality', 'province', 'postal_code'}, exclude_none=True
        )

        if address_data:
            address = AddressDataAccessService.create_address(address_data)
            contact.address = address
            # not calling `set_create_or_update` because we are updating the contact in the same transaction
            contact.save(update_fields=['address_id'])
        return contact

    @classmethod
    @transaction.atomic()
    def update_contact(
        cls, user_guid: UUID, contact_id: int, payload: Union[ContactIn, OperationRepresentativeIn]
    ) -> Contact:

        # UPDATE CONTACT
        contact_data: Dict = payload.dict(include={*ContactIn.Meta.fields})

        contact_data['operator'] = UserDataAccessService.get_operator_by_user(user_guid)

        contact = ContactDataAccessServiceV2.update_or_create_v2(contact_id, contact_data, user_guid)
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

    @classmethod
    def get_with_places_assigned_v2(cls, contact_id: int) -> Optional[ContactWithPlacesAssigned]:
        contact = ContactDataAccessService.get_by_id(contact_id)
        places_assigned = []
        if contact:
            role_name = contact.business_role.role_name
            for operation in contact.operations_contacts.all():
                place = PlacesAssigned(
                    role_name=role_name,
                    operation_name=operation.name,
                    operation_id=operation.id,
                )
                places_assigned.append(place)
            result = cast(ContactWithPlacesAssigned, contact)
            if places_assigned:
                result.places_assigned = places_assigned
            return result
        return None

    @classmethod
    def raise_exception_if_contact_missing_address_information(cls, contact_id: int) -> None:
        """This function checks that a contact has a complete address record (contact.address exists and all fields in the address model have a value). In general in the app, address is not mandatory, but in certain cases (e.g., when a contact is assigned to an operation as the Operation Representative), the business area requires the contact to have an address."""
        contact = ContactDataAccessService.get_by_id(contact_id)
        address = contact.address
        if not address or any(
            not getattr(address, field, None) for field in ['street_address', 'municipality', 'province', 'postal_code']
        ):
            raise Exception(
                f'The contact {contact.first_name} {contact.last_name} is missing address information. Please return to Contacts and fill in their address information before assigning them as an Operation Representative here.'
            )
