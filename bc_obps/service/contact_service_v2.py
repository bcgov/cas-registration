from typing import Optional, cast
from django.db.models import QuerySet
from uuid import UUID


from registration.models.contact import Contact
from registration.schema.v2.contact import ContactFilterSchemaV2, ContactWithPlacesAssigned, PlacesAssigned
from service.data_access_service.contact_service import ContactDataAccessService
from service.data_access_service.user_service import UserDataAccessService
from ninja import Query


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
        base_qs = ContactDataAccessService.get_all_contacts_for_user(user)
        # we have filter before .values or else we'll get duplicate rows from the m2m relationship between operations_contacts and operators
        queryset = (
            filters.filter(base_qs)
            .order_by(sort_by)
            .values('id', 'first_name', 'last_name', 'email', 'operators__legal_name')
            .distinct()
        )
        return cast(QuerySet[Contact], queryset)

    @classmethod
    def get_by_id(cls, contact_id: int) -> Contact:
        return Contact.objects.get(id=contact_id)

    @classmethod
    def get_with_places_assigned_v2(cls, contact_id: int) -> Optional[ContactWithPlacesAssigned]:
        contact = cls.get_by_id(contact_id)
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
        contact = cls.get_by_id(contact_id)
        address = contact.address
        if not address or any(
            not getattr(address, field, None) for field in ['street_address', 'municipality', 'province', 'postal_code']
        ):
            raise Exception(
                f'The contact {contact.first_name} {contact.last_name} is missing address information. Please return to Contacts and fill in their address information before assigning them as an Operation Representative here.'
            )
