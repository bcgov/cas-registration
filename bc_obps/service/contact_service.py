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
