from service.user_operator.get_user_operator_operator_service import GetUserOperatorOperatorService

from registration.decorators import authorize
from registration.schema import (
    Message,
    OperatorFromUserOperatorOut,
)
from registration.api.api_base import router

from registration.models import (
    UserOperator,
)
from registration.api.custom_codes_4xx import custom_codes_4xx


@router.get(
    "/user-operator-operator",
    response={200: OperatorFromUserOperatorOut, custom_codes_4xx: Message},
    url_name="get_user_operator_operator",
)
@authorize(["industry_user"], UserOperator.get_all_industry_user_operator_roles())
def get_user_operator_operator(request):
    return GetUserOperatorOperatorService.get_user_operator_operator(request)
