from typing import Optional
from uuid import UUID
from service.data_access_service.user_operator_service import UserOperatorDataAccessService
from service.data_access_service.user_service import UserDataAccessService
from registration.models import User, UserOperator
from registration.constants import UNAUTHORIZED_MESSAGE


class UserOperatorService:
    @classmethod
    def check_if_user_eligible_to_access_user_operator(cls, user_guid: UUID, user_operator_id: UUID) -> Optional[bool]:
        """
        Check if a user is eligible to access a user_operator (i.e., they're allowed to access their own information (user_operator, operations, etc.) but not other people's).

        Args:
            user_guid (uuid): The user for whom eligibility is being checked.
            user_operator_id (uuid): The id of the user_operator to which access is being requested.

        Returns:
            True or raises an exception.
        """

        user: User = UserDataAccessService.get_by_guid(user_guid)
        user_operator: UserOperator = UserOperatorDataAccessService.get_user_operator_by_id(user_operator_id)
        if user.is_industry_user() and user_operator.user.user_guid != user_guid:
            raise PermissionError("Your user is not associated with this operator.")
        # internal users are always allowed to access user operators. (Though the authorize function prevents them from accessing certain external-only endpoints)
        return None


    @classmethod
    def get_current_user_approved_user_operator_or_raise(cls, user: User) -> UserOperator:
        user_operator = UserOperatorDataAccessService.get_approved_user_operator(user)
        if not user_operator:
            raise Exception(UNAUTHORIZED_MESSAGE)
        return user_operator
