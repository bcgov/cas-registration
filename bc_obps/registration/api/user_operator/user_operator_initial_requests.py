from service.user_operator.list_user_operators_service import ListUserOperatorsService

from registration.decorators import authorize, handle_http_errors
from registration.schema import UserOperatorPaginatedOut, Message
from registration.api.api_base import router

from registration.models import (
    AppRole,
)
from registration.api.custom_codes_4xx import custom_codes_4xx


@router.get(
    "/user-operator-initial-requests",
    response={200: UserOperatorPaginatedOut, custom_codes_4xx: Message},
    url_name="list_user_operators",
)
@authorize(AppRole.get_authorized_irc_roles())
@handle_http_errors()
def list_user_operators(request, page: int = 1, sort_field: str = "created_at", sort_order: str = "desc"):
    return 200, ListUserOperatorsService.list_user_operators(request, page, sort_field, sort_order)
