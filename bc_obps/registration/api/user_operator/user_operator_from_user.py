from service.user_operator.get_user_operator_from_user_service import UserOperatorFromUserService
from registration.decorators import authorize
from registration.schema import (
    Message,
    PendingUserOperatorOut,
)
from registration.api.api_base import router

from registration.models import (
    UserOperator,
)
from registration.api.custom_codes_4xx import custom_codes_4xx


@router.get(
    "/user-operator-from-user",
    response={200: PendingUserOperatorOut, custom_codes_4xx: Message},
    url_name="get_user_operator_from_user",
)
@authorize(["industry_user"], UserOperator.get_all_industry_user_operator_roles(), False)
def get_user_operator_from_user(request):
    return UserOperatorFromUserService.get_user_operator_from_user(request)
