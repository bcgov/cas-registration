from typing import Optional
from django.db.models import QuerySet
from uuid import UUID
from common.exceptions import UserError
from registration.constants import UNAUTHORIZED_MESSAGE
from registration.models.contact import Contact
from registration.schema import (
    ContactFilterSchema,
    ContactWithPlacesAssigned,
    PlacesAssigned,
    ContactIn,
    OperationRepresentativeIn,
)
from service.data_access_service.contact_service import ContactDataAccessService
from service.data_access_service.user_service import UserDataAccessService
from ninja import Query
from ninja.types import DictStrAny
from django.db import transaction
from typing import cast, Union, Dict
from registration.models.business_role import BusinessRole
from service.data_access_service.address_service import AddressDataAccessService


class ContactService:
    @classmethod
    def get_if_authorized(cls, user_guid: UUID, contact_id: int) -> Optional[Contact]:
        user = UserDataAccessService.get_by_guid(user_guid)
        user_contacts = ContactDataAccessService.get_all_contacts_for_user(user)
        contact = user_contacts.filter(id=contact_id).first()
        if user.is_industry_user() and not contact:
            raise Exception(UNAUTHORIZED_MESSAGE)
        return contact

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
        from service.operation_service import OperationService  # to avoid circular imports

        operation = OperationService.get_if_authorized(user_guid, operation_id, ['id', 'operator_id'])
        return operation.contacts.order_by('-created_at')

    @classmethod
    @transaction.atomic()
    def create_contact(cls, user_guid: UUID, payload: Union[ContactIn, OperationRepresentativeIn]) -> Contact:
        contact_data: dict = payload.dict(include={*ContactIn.Meta.fields})
        # `business_role` is a mandatory field in the DB but we don't collect it from the user
        # so we set it to a default value here and we can change it later if needed
        contact_data['business_role'] = BusinessRole.objects.get(role_name="Operation Representative")
        operator_id = UserDataAccessService.get_user_operator_by_user(user_guid).operator.id
        contact_data['operator_id'] = operator_id
        cls._validate_contact_email(None, operator_id, contact_data['email'])
        contact: Contact
        contact = ContactDataAccessService.update_or_create(None, contact_data)

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
        # Make sure user has access to the contact
        if not ContactDataAccessService.user_has_access(user_guid, contact_id):
            raise Exception(UNAUTHORIZED_MESSAGE)

        address_data = payload.dict(include={'street_address', 'municipality', 'province', 'postal_code'})
        contact_data: Dict = payload.dict(
            include=['first_name', 'last_name', 'email', 'phone_number', 'position_title']
        )
        # Prevent updating contact if the contact is an 'Operation Representative' and required address fields are missing
        cls._validate_operation_representative_address(contact_id, address_data)

        # Prevent updating contact if the email is already in use by another contact associated with the same operator
        operator_id = UserDataAccessService.get_user_operator_by_user(user_guid).operator.id
        email: str = contact_data['email']
        cls._validate_contact_email(contact_id, operator_id, email)
        # UPDATE CONTACT

        contact = ContactDataAccessService.update_or_create(contact_id, contact_data)

        # UPDATE ADDRESS
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
    def get_with_places_assigned(cls, user_guid: UUID, contact_id: int) -> Optional[ContactWithPlacesAssigned]:
        contact = cls.get_if_authorized(user_guid, contact_id)
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
            raise UserError(
                f'The contact {contact.first_name} {contact.last_name} is missing address information. Please return to Contacts and fill in their address information before assigning them as an Operation Representative here.'
            )

    @classmethod
    def _validate_operation_representative_address(cls, contact_id: int, address_data: DictStrAny) -> None:
        """Raises an exception if the contact is an 'Operation Representative' and required address fields are missing."""
        contact = ContactDataAccessService.get_by_id(contact_id)
        if contact.business_role.role_name == "Operation Representative" and any(
            not address_data.get(field) for field in ['street_address', 'municipality', 'province', 'postal_code']
        ):
            raise UserError("This contact is an 'Operation Representative' and must have all address-related fields.")

    @classmethod
    def _validate_contact_email(cls, contact_id: Optional[int], operator_id: UUID, email: str) -> None:
        """Raises an exception if the contact email is already in use by another contact associated with the same operator.
        Slightly different error messages are raised depending on whether this is from an update or create.
        (contact_id is not None for update)
        """

        contacts = Contact.objects.filter(email__iexact=email, operator_id=operator_id)
        if contact_id is not None:
            contacts = contacts.exclude(id=contact_id)
        if contacts.exists():
            message = (
                f"A contact with the email '{email}' already exists. Please add a different contact or edit the existing contact."
                if contact_id is None
                else f"The email '{email}' is in use by another contact. Please use a different email address."
            )
            raise UserError(message)

    @classmethod
    def archive_contact(cls, user_guid: UUID, contact_id: int) -> None:
        """Archives a contact if the user has appropriate permissions."""
        contact = cls.get_if_authorized(user_guid, contact_id)
        if contact is not None:
            contact.set_archive(user_guid)
