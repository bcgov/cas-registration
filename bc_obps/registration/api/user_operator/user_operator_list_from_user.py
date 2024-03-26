from service.user_operator.get_user_operator_list_from_user_service import GetUserOperatorListFromUserService

from registration.decorators import authorize, handle_http_errors
from registration.schema import ExternalDashboardUsersTileData, Message
from typing import List
from registration.api.api_base import router
from registration.api.custom_codes_4xx import custom_codes_4xx


@router.get(
    "/user-operator-list-from-user",
    response={200: List[ExternalDashboardUsersTileData], custom_codes_4xx: Message},
    url_name="get_user_operator_list_from_user",
)
@authorize(["industry_user"], ["admin"])
@handle_http_errors()
def get_user_operator_list_from_user(request):
    return GetUserOperatorListFromUserService.get_user_operator_list_from_user(request)
