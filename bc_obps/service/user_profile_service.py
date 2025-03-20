from django.conf import settings
from registration.schema import UserIn
from service.data_access_service.user_service import UserDataAccessService
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
