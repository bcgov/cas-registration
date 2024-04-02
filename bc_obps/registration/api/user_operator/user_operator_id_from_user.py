from service.data_access_service.user_service import UserDataAccessService

from registration.decorators import authorize, handle_http_errors
from registration.schema import (
    Message,
    UserOperatorIdOut,
)
from registration.api.api_base import router

from registration.models import (
    UserOperator,
)
from registration.api.custom_codes_4xx import custom_codes_4xx
from registration.api.utils.current_user_utils import get_current_user_guid


@router.get(
    "/user-operator-id", response={200: UserOperatorIdOut, custom_codes_4xx: Message}, url_name="get_user_operator_id"
)
@authorize(["industry_user"], UserOperator.get_all_industry_user_operator_roles(), False)
@handle_http_errors()
def get_user_operator_id(request):
    return 200, {"user_operator_id": UserDataAccessService.get_user_operator_by_user(get_current_user_guid(request)).id}
