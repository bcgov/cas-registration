from service.user_operator_service import UserOperatorService
from registration.decorators import authorize, handle_http_errors
from registration.schema import UserOperatorPaginatedOut, Message
from registration.api.api_base import router

from registration.models import (
    AppRole,
)
from service.error_service.custom_codes_4xx import custom_codes_4xx

# can this just be user-operators/irc??
@router.get(
    "/user-operator/user-operator-initial-requests",
    response={200: UserOperatorPaginatedOut, custom_codes_4xx: Message},
    url_name="list_user_operators",
)
@authorize(AppRole.get_authorized_irc_roles())
@handle_http_errors()
def list_user_operators(request, page: int = 1, sort_field: str = "created_at", sort_order: str = "desc"):
    return 200, UserOperatorService.list_user_operators(page, sort_field, sort_order)
