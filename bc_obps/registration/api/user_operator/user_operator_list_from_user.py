from registration.api.utils.current_user_utils import get_current_user_guid
from service.data_access_service.user_operator_service import UserOperatorDataAccessService
from service.user_operator_service import UserOperatorService

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
# Used to show industry_user admins the list of user_operators to approve/deny
def get_user_operator_list_from_user(request):
    return 200, UserOperatorDataAccessService.get_an_operators_user_operators_by_user_guid(
        get_current_user_guid(request)
    )
