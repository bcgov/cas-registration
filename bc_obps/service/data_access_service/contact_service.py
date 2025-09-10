from uuid import UUID
from typing import Dict, Optional, Any
from registration.models import BusinessRole, Contact
from django.db.models import QuerySet
from registration.models.user import User
from service.user_operator_service import UserOperatorService
from service.data_access_service.user_service import UserDataAccessService


class ContactDataAccessService:
    @classmethod
    def get_by_id(cls, contact_id: int) -> Contact:
        return Contact.objects.get(id=contact_id)

    @classmethod
    def user_has_access(cls, user_guid: UUID, contact_id: int) -> bool:
        user = UserDataAccessService.get_by_guid(user_guid)
        user_operator = UserOperatorService.get_current_user_approved_user_operator_or_raise(user)
        return user_operator.operator.contacts.filter(id=contact_id).exists()

    @classmethod
    def update_or_create(cls, existing_contact_id: Optional[int], updated_data: Dict[str, Optional[str]]) -> Contact:
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
        }
        if updated_data.get("operator_id"):
            data["operator_id"] = updated_data["operator_id"]
        contact: Contact
        contact, _ = Contact.custom_update_or_create(
            self=Contact,
            **data,
        )
        return contact

    @classmethod
    def get_all_contacts_for_user(cls, user: User) -> QuerySet[Contact]:
        if user.is_irc_user():
            return Contact.objects.all()
        else:
            # fetching all contacts associated with the user's operator
            user_operator = UserOperatorService.get_current_user_approved_user_operator_or_raise(user)
            return Contact.objects.filter(operator=user_operator.operator)
        
    @classmethod
    def get_contact_for_user(cls, user: User) -> QuerySet[Contact]:
        if user.is_industry_user():
            user_operator = UserOperatorService.get_current_user_approved_user_operator_or_raise(user)
            breakpoint()
            # first try querying by email address - return result if there is one
            query_by_email = Contact.objects.filter(operator=user_operator.operator, email=user.email)
            if query_by_email.count() == 1:
                return query_by_email
            # if we can't get the contact by the user's email, query by name
            query_by_name = Contact.objects.filter(operator=user_operator.operator, first_name=user.first_name, last_name=user.last_name)
            if query_by_name.count() == 1:
                return query_by_name
            # if neither of these are successful, return an empty queryset
            return Contact.objects.none()
