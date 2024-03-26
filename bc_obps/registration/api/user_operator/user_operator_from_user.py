from service.current_user_service import CurrentUserService
from registration.decorators import authorize, handle_http_errors
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
@handle_http_errors()
def get_user_operator_from_user():
    return CurrentUserService.get_users_user_operator(CurrentUserService.get_user_guid())
