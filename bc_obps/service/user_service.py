from uuid import UUID
from common.exceptions import UserError
from registration.constants import UNAUTHORIZED_MESSAGE
from registration.models.user import User
from registration.schema.user import UserUpdateRoleIn
from service.data_access_service.user_service import UserDataAccessService


class UserService:
    @classmethod
    def get_if_authorized(cls, admin_user_guid: UUID, target_user_guid: UUID) -> User:
        admin_user: User = UserDataAccessService.get_by_guid(admin_user_guid)
        target_user: User = UserDataAccessService.get_by_guid(target_user_guid)
        if (
            admin_user.is_industry_user() and admin_user.business_guid == target_user.business_guid
        ) or admin_user.is_irc_user():
            return target_user
        raise Exception(UNAUTHORIZED_MESSAGE)

    @classmethod
    def update_user_role(
        cls,
        updating_user_guid: UUID,
        user_to_update_guid: UUID,
        updated_data: UserUpdateRoleIn,
        include_archived: bool = False,
    ) -> User:
        """
        Update a user role. Users cannot update their own roles.

        Args:
            *updating_user_guid: The guid of the user who is doing the updating
            user_to_update_guid: the guid of the user who is being updating
            updated_data: The data to update the user with (role and whether or not to archive/un-archive)
            include_archived: Whether or not to included archived users when doing operations on users.
        """
        if updating_user_guid == user_to_update_guid:
            raise UserError('You cannot change your own user role.')

        user: User = UserDataAccessService.update_user(user_to_update_guid, updated_data, include_archived)

        if updated_data.archive:
            user.set_archive(updating_user_guid)
            user.refresh_from_db()
        else:
            user.archived_at, user.archived_by = None, None
            user.save(update_fields=["archived_at", "archived_by"])

        return user
