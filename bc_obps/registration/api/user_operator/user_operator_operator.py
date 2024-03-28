from registration.schema.user_operator import PendingUserOperatorOut
from service.data_access_service.user_service import UserDataAccessService

from registration.decorators import authorize, handle_http_errors
from registration.schema import (
    Message,
    OperatorFromUserOperatorOut,
)
from registration.api.api_base import router

from registration.models import (
    UserOperator,
)
from registration.api.custom_codes_4xx import custom_codes_4xx
from registration.api.utils.current_user_utils import get_current_user_guid


@router.get(
    "/user-operator-operator",
    response={200: OperatorFromUserOperatorOut, custom_codes_4xx: Message},
    url_name="get_user_operator_operator",
)
@authorize(["industry_user"], UserOperator.get_all_industry_user_operator_roles())
@handle_http_errors()
def get_user_operator_operator(request):
    user_operator = UserDataAccessService.get_users_user_operator(get_current_user_guid(request))
    return 200, PendingUserOperatorOut.from_orm(user_operator)
