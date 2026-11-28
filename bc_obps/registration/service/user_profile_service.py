from dataclasses import asdict
from uuid import UUID

from django.conf import settings
from django.db import transaction
from registration.enums.enums import IdPs
from registration.models import AppRole, User
from registration.schema import UserIn
from registration.service.data_access_service.user_service import UserDataAccessService
from registration.service.data_types.user_profile_service import UserLoginSyncData


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
    def sync_user_profile_from_idp(
        cls, user_guid: UUID, idp_data: UserLoginSyncData
    ) -> User:
        """
        Refreshes the identity-provider-owned fields (email, BCeID business name) of an existing industry user.
        Called on every login so that changes made in the BCeID portal are reflected in BCIERS
        """
        user: User = UserDataAccessService.get_by_guid(user_guid)
        if not user.is_industry_user():
            return user

        has_changes = False
        for field, value in asdict(idp_data).items():
            if getattr(user, field) != value:
                setattr(user, field, value)
                has_changes = True

        if has_changes:
            user.save()
        return user
