from django.conf import settings
from django.db import transaction
from registration.schema import UserIn, UserLoginSyncIn
from registration.service.data_access_service.user_service import UserDataAccessService
from registration.service.data_access_service.contact_service import ContactDataAccessService
from registration.models import AppRole
from registration.enums.enums import IdPs
from uuid import UUID
from registration.models import User


class UserProfileService:
    @classmethod
    def create_user_profile(cls, user_guid: UUID, user_data: UserIn) -> User:
        # Determine the role based on the identity provider
        role_mapping = {
            IdPs.IDIR.value: (
                AppRole.objects.get(role_name="cas_analyst")
                if settings.BYPASS_ROLE_ASSIGNMENT
                else AppRole.objects.get(role_name="cas_pending")
            ),
            IdPs.BCEIDBUSINESS.value: AppRole.objects.get(role_name="industry_user"),
        }
        role: AppRole = role_mapping.get(user_data.identity_provider)  # type: ignore[assignment] # we know this will not be None
        return UserDataAccessService.create_user(user_guid, role, user_data)

    @classmethod
    @transaction.atomic()
    def sync_user_profile_from_idp(cls, user_guid: UUID, idp_data: UserLoginSyncIn) -> User:
        """
        Refreshes the identity-provider-owned fields (email, BCeID business name) of an existing industry user.
        Called on every login so that changes made in the BCeID portal are reflected in BCIERS
        """
        user: User = UserDataAccessService.get_by_guid(user_guid)
        if not user.is_industry_user():
            return user

        old_email = user.email
        has_changes = False
        for field, value in idp_data.dict().items():
            value = (value or "").strip()
            # never blank out a stored value
            if value and getattr(user, field) != value:
                setattr(user, field, value)
                has_changes = True

        if not has_changes:
            return user

        user.save()
        if user.email != old_email:
            # keep the user's Contact record (looked up by email) linked to the user
            ContactDataAccessService.update_user_contact_email(user, old_email, user.email)
        return user
