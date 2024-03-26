from service.current_user_service import CurrentUserService
from registration.models import (
    User,
    UserOperator,
)
from registration.decorators import handle_http_errors


class GetUserOperatorListFromUserService:
    @staticmethod
    @handle_http_errors()
    def get_user_operator_list_from_user(request):
        user: User = request.current_user
        # # this gets the user's operator by looking it up in the user_operator table (we exclude declined user_operators because the user may have previously requested access and been declined and therefore have two records in the user_operator table)
        # operator = (
        #     UserOperator.objects.select_related("operator")
        #     .exclude(status=UserOperator.Statuses.DECLINED)
        #     .get(user=user.user_guid)
        #     .operator
        # )
        operator = CurrentUserService.get_users_operator(CurrentUserService.get_user(request))
        user_operator_list = UserOperator.objects.select_related("user").filter(
            operator_id=operator, user__business_guid=user.business_guid
        )
        return user_operator_list
