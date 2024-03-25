from registration.schema import (
    PendingUserOperatorOut,
)

from registration.models import (
    UserOperator,
)
from registration.decorators import handle_http_errors


class UserOperatorFromUserService:
    @staticmethod
    @handle_http_errors()
    def get_user_operator_from_user(request):
        try:
            user_operator = (
                UserOperator.objects.only("id", "status", "operator__id", "operator__is_new", "operator__status")
                .exclude(status=UserOperator.Statuses.DECLINED)
                .select_related("operator")
                .get(user_id=request.current_user.user_guid)
            )
        except UserOperator.DoesNotExist:
            return 404, {"message": "User is not associated with any operator"}
        return 200, PendingUserOperatorOut.from_orm(user_operator)
