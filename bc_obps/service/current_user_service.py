from uuid import UUID
from django.shortcuts import get_object_or_404
from registration.models import UserOperator
from registration.schema.user_operator import PendingUserOperatorOut

NO_USER_OPERATOR_MESSAGE = "User is not associated with any operator"

class CurrentUserService:

    def get_user_guid(request):
        return request.current_user.user_guid

    def get_users_operator(user_guid: str):
        # brianna  how to do this/self
        try:
            user_operator = this.get_users_user_operator(user_guid: str)
            # b will this except still work?
        except UserOperator.DoesNotExist:
            return 404, {"message": NO_USER_OPERATOR_MESSAGE}
        return 200, user_operator.operator

    def get_users_user_operator(user_guid: str):
        try:
            user_operator = (
                UserOperator.objects.only("id", "status", "operator__id", "operator__is_new", "operator__status")
                .exclude(status=UserOperator.Statuses.DECLINED) # We exclude declined user_operators because the user may have previously requested access and been declined and therefore have multiple records in the user_operator table
                .select_related("operator")
                .get(user_id=user_guid)
            )
        except UserOperator.DoesNotExist:
            return 404, {"message": NO_USER_OPERATOR_MESSAGE}
        return 200, PendingUserOperatorOut.from_orm(user_operator)

    def get_users_user_operator_id(user_guid: str):
        try:
            user_operator = get_object_or_404(UserOperator, user_id=user_guid)
        except UserOperator.DoesNotExist:
            return 404, {"message": NO_USER_OPERATOR_MESSAGE}
        return 200, {"user_operator_id": user_operator.id}


    def is_user_an_approved_admin_user_operator(user_guid: str):
        approved_user_operator: bool = UserOperator.objects.filter(
            user_id=user_guid, role=UserOperator.Roles.ADMIN, status=UserOperator.Statuses.APPROVED
        ).exists()

        return 200, {"approved": approved_user_operator}

    def is_users_user_operator_declined(user_guid:str, operator_id: UUID):
        is_declined = UserOperator.objects.filter(
            operator_id=operator_id, user_id=user_guid, status=UserOperator.Statuses.DECLINED
        ).exists()
        return 200, is_declined
