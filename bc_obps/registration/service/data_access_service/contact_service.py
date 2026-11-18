from uuid import UUID
from typing import Dict, Optional, Any
from registration.models import BusinessRole, Contact, UserOperator
from django.db.models import QuerySet
from registration.models.user import User
from registration.service.user_operator_service import UserOperatorService
from registration.service.data_access_service.user_service import UserDataAccessService
from registration.service.data_access_service.user_operator_service import UserOperatorDataAccessService


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
    def update_user_contact_email(cls, user: User, old_email: str, new_email: str) -> None:
        """
        Carries a change of the user's login email over to their Contact record in their operator,
        but only when the Contact still uses the old login email (i.e. the user never set a separate
        contact email). Contacts with a customized email are left untouched.
        Active contacts have a unique email per operator (`unique_active_email_per_operator`), so if another
        active contact already uses the new email the update is skipped rather than failing the login sync.
        """
        try:
            user_operator = UserOperatorDataAccessService.get_approved_user_operator(user)
        except UserOperator.DoesNotExist:
            return
        operator_contacts = Contact.objects.filter(operator_id=user_operator.operator_id)
        contact = operator_contacts.filter(email=old_email).first()
        if not contact or operator_contacts.filter(email=new_email).exists():
            return
        contact.email = new_email
        contact.save(update_fields=["email"])

    @classmethod
    def get_contact_for_user(cls, user: User) -> Contact | None:
        if user.is_industry_user():
            user_operator = UserOperatorService.get_current_user_approved_user_operator_or_raise(user)
            # first try querying by email address - return result if there is one
            query_by_email = Contact.objects.filter(operator=user_operator.operator, email=user.email)
            if query_by_email.count() == 1:
                return query_by_email.first()
            # if we can't get the contact by the user's email, query by name
            query_by_name = Contact.objects.filter(
                operator=user_operator.operator, first_name=user.first_name, last_name=user.last_name
            )
            if query_by_name.count() == 1:
                return query_by_name.first()
            # if neither of these are successful, return None
            return None
        # if the user isn't an industry user, there won't be a Contact record for them
        else:
            return None
