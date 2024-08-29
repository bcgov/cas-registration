from typing import Dict, Optional
from uuid import UUID

from registration.models import BusinessRole, Contact
from django.db.models import QuerySet
from registration.models.user import User
from service.data_access_service.user_service import UserDataAccessService
from service.user_operator_service import UserOperatorService


class ContactDataAccessService:
    @classmethod
    def get_by_id(cls, contact_id: int) -> Contact:
        return Contact.objects.get(id=contact_id)

    @classmethod
    def update_or_create(
        cls, existing_contact_id: Optional[int], updated_data: Dict[str, Optional[str]], user_guid: UUID
    ) -> Contact:
        contact, _ = Contact.objects.update_or_create(
            id=existing_contact_id,
            defaults={
                "first_name": updated_data["first_name"],
                "last_name": updated_data["last_name"],
                "position_title": updated_data["position_title"],
                "email": updated_data["email"],
                "phone_number": updated_data["phone_number"],
                "business_role": updated_data.get(
                    "business_role", BusinessRole.objects.get(role_name="Operation Representative")
                ),
            },
        )
        contact.set_create_or_update(user_guid)
        return contact

    @classmethod
    def get_all_contacts_for_user(cls, user: User) -> QuerySet[Contact]:
        if user.is_irc_user():
            return Contact.objects.all()
        else:
            # fetching all contacts associated with the user's operator
            user_operator = UserOperatorService.get_current_user_approved_user_operator_or_raise(user)
            return user_operator.operator.contacts.all()

    @classmethod
    def user_has_access(cls, user_guid: UUID, contact_id: int) -> bool:
        user = UserDataAccessService.get_by_guid(user_guid)
        user_operator = UserOperatorService.get_current_user_approved_user_operator_or_raise(user)
        return user_operator.operator.contacts.filter(id=contact_id).exists()
