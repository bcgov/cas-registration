from typing import Dict, Literal, Tuple
from django.http import HttpRequest
from registration.api.utils.current_user_utils import get_current_user_guid
from registration.constants import USER_OPERATOR_TAGS
from service.data_access_service.user_service import UserDataAccessService

from registration.decorators import authorize, handle_http_errors
from registration.schema.v1 import IsApprovedUserOperator
from registration.schema.generic import Message
from registration.api.router import router

from registration.models import UserOperator
from service.error_service.custom_codes_4xx import custom_codes_4xx

# "current" refers to the current user-operator (we look up the current user-operator via the current user)
@router.get(
    "/user-operators/current/is-current-user-approved-admin",
    response={200: IsApprovedUserOperator, custom_codes_4xx: Message},
    url_name="is_current_user_approved_admin",
    tags=USER_OPERATOR_TAGS,
)
@authorize(["industry_user"], UserOperator.get_all_industry_user_operator_roles())
@handle_http_errors()
def is_current_user_approved_admin(request: HttpRequest) -> Tuple[Literal[200], Dict[str, bool]]:
    user_guid = get_current_user_guid(request)
    return 200, UserDataAccessService.is_user_an_approved_admin_user_operator(user_guid)
