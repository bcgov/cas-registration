from uuid import UUID
from registration.models import UserOperator, User
from registration.schema.user_operator import PendingUserOperatorOut

NO_USER_OPERATOR_MESSAGE = "User is not associated with any operator"


class UserDataAccessService:
    def get_user_by_guid(user_guid: str):
        return User.objects.get(user_guid=user_guid)

    def get_user_business_guid(user_guid: str):
        return User.objects.get(user_guid=user_guid).business_guid

    def get_operator_by_user(user_guid: str):
        user_operator = UserDataAccessService.get_user_operator_by_user(user_guid)
        return user_operator.operator

    def get_user_operator_by_user(user_guid: str):
        user_operator = (
            UserOperator.objects.only("id", "status", "operator__id", "operator__is_new", "operator__status")
            .exclude(
                status=UserOperator.Statuses.DECLINED
            )  # We exclude declined user_operators because the user may have previously requested access and been declined and therefore have multiple records in the user_operator table
            .select_related("operator")
            .get(user_id=user_guid)
        )
        return user_operator

    def is_user_an_approved_admin_user_operator(user_guid: str):
        approved_user_operator: bool = UserOperator.objects.filter(
            user_id=user_guid, role=UserOperator.Roles.ADMIN, status=UserOperator.Statuses.APPROVED
        ).exists()
        return {"approved": approved_user_operator}

    def is_users_user_operator_declined(user_guid: str, operator_id: UUID):
        is_declined = UserOperator.objects.filter(
            operator_id=operator_id, user_id=user_guid, status=UserOperator.Statuses.DECLINED
        ).exists()
        return is_declined
