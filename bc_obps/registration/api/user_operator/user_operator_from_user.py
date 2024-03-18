from registration.decorators import authorize, try_except_wrapper
from registration.schema import (
    Message,
    PendingUserOperatorOut,
)
from registration.api.api_base import router

from registration.models import (
    UserOperator,
)
from ninja.responses import codes_4xx


@router.get(
    "/user-operator-from-user",
    response={200: PendingUserOperatorOut, codes_4xx: Message},
    url_name="get_user_operator_from_user",
)
@authorize(["industry_user"], UserOperator.get_all_industry_user_operator_roles(), False)
@try_except_wrapper()
def get_user_operator_from_user(request):
    return UserOperatorFromUserService.get_user_operator_from_user(request)
