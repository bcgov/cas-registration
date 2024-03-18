from registration.service.user_operator.GetUserOperatorOperatorService import GetUserOperatorOperatorService

from registration.decorators import authorize, try_except_wrapper
from registration.schema import (
    Message,
    OperatorFromUserOperatorOut,
)
from registration.api.api_base import router

from registration.models import (
    UserOperator,
)
from ninja.responses import codes_4xx


@router.get(
    "/user-operator-operator",
    response={200: OperatorFromUserOperatorOut, codes_4xx: Message},
    url_name="get_user_operator_operator",
)
@authorize(["industry_user"], UserOperator.get_all_industry_user_operator_roles())
@try_except_wrapper()
def get_user_operator_operator(request):
    return GetUserOperatorOperatorService.get_user_operator_operator(request)
