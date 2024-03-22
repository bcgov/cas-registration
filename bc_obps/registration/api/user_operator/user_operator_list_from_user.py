from registration.service.user_operator.GetUserOperatorListFromUserService import GetUserOperatorListFromUserService

from registration.decorators import authorize, handle_http_errors
from registration.schema import (
    ExternalDashboardUsersTileData,
)
from typing import List
from registration.api.api_base import router


@router.get(
    "/user-operator-list-from-user",
    response=List[ExternalDashboardUsersTileData],
    url_name="get_user_operator_list_from_user",
)
@authorize(["industry_user"], ["admin"])
@handle_http_errors()
def get_user_operator_list_from_user(request):
    return GetUserOperatorListFromUserService.get_user_operator_list_from_user(request)
