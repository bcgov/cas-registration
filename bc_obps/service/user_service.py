from uuid import UUID
from registration.constants import UNAUTHORIZED_MESSAGE
from registration.models.user import User
from service.data_access_service.user_service import UserDataAccessService


class UserService:
    @classmethod
    def get_if_authorized(cls, admin_user_guid: UUID, target_user_guid: UUID) -> User:
        admin_user: User = UserDataAccessService.get_by_guid(admin_user_guid)
        target_user: User = UserDataAccessService.get_by_guid(target_user_guid)
        if admin_user.is_industry_user() and admin_user.business_guid != target_user.business_guid:
            raise Exception(UNAUTHORIZED_MESSAGE)
        return target_user
