from typing import Dict, Optional, Any
from uuid import UUID

from registration.models import BusinessRole, Contact
from django.db.models import QuerySet
from registration.models.user import User
from service.user_operator_service import UserOperatorService


class ContactDataAccessServiceV2:
    @classmethod
    def get_by_id(cls, contact_id: int) -> Contact:
        return Contact.objects.get(id=contact_id)

    @classmethod
    def update_or_create_v2(
        cls, existing_contact_id: Optional[int], updated_data: Dict[str, Optional[str]], user_guid: UUID
    ) -> Contact:
        data: Dict[str, Any] = {
            "pk": existing_contact_id,
            "first_name": updated_data["first_name"],
            "last_name": updated_data["last_name"],
            "position_title": updated_data["position_title"],
            "email": updated_data["email"],
            "phone_number": updated_data["phone_number"],
            "business_role": updated_data.get(
                "business_role", BusinessRole.objects.get(role_name="Operation Representative")
            ),
            "operator": updated_data["operator"],
        }
        contact: Contact
        contact, _ = Contact.custom_update_or_create(
            self=Contact,
            user_guid=user_guid,
            **data,
        )
        return contact

    @classmethod
    def get_all_contacts_for_user_v2(cls, user: User) -> QuerySet[Contact]:
        if user.is_irc_user():
            return Contact.objects.all()
        else:
            # fetching all contacts associated with the user's operator
            user_operator = UserOperatorService.get_current_user_approved_user_operator_or_raise(user)
            return Contact.objects.filter(operator=user_operator.operator)
