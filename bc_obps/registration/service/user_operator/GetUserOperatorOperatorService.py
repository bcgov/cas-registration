from registration.models import (
    User,
    UserOperator,
)


class GetUserOperatorOperatorService:
    def get_user_operator_operator(request):
        try:
            user: User = request.current_user
            user_operator = (
                UserOperator.objects.only("operator__status", "operator__id")
                .exclude(status=UserOperator.Statuses.DECLINED)
                .select_related("operator")
                .get(user=user.user_guid)
            )
        except UserOperator.DoesNotExist:
            return 404, {"message": "User is not associated with any operator"}
        return 200, user_operator.operator
