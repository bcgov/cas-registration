from django.http import HttpRequest
from registration.api.utils.current_user_utils import get_current_user_guid
from registration.constants import USER_OPERATOR_TAGS
from registration.models import UserOperator
from service.data_access_service.user_operator_service import UserOperatorDataAccessService
from django.db.models import QuerySet
from registration.decorators import authorize, handle_http_errors
from registration.schema.v1 import ExternalDashboardUsersTileData
from registration.schema.generic import Message
from typing import List, Literal, Tuple
from registration.api.router import router
from service.error_service.custom_codes_4xx import custom_codes_4xx


@router.get(
    "/user-operator/user-operator-list-from-user",
    response={200: List[ExternalDashboardUsersTileData], custom_codes_4xx: Message},
    url_name="get_user_operator_list_from_user",
    tags=USER_OPERATOR_TAGS,
)
@authorize(["industry_user"], ["admin"])
@handle_http_errors()
# Used to show industry_user admins the list of user_operators to approve/deny
def get_user_operator_list_from_user(request: HttpRequest) -> Tuple[Literal[200], QuerySet[UserOperator]]:
    return 200, UserOperatorDataAccessService.get_an_operators_user_operators_by_user_guid(
        get_current_user_guid(request)
    )
