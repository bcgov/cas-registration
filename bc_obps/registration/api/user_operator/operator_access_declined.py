from uuid import UUID
from service.user_service import UserDataAccessService

from registration.decorators import authorize, handle_http_errors
from registration.schema import (
    Message,
)
from registration.api.api_base import router

from registration.models import (
    UserOperator,
)
from registration.api.custom_codes_4xx import custom_codes_4xx
from registration.api.utils.current_user_utils import get_current_user_guid


@router.get(
    "/operator-access-declined/{operator_id}",
    response={200: bool, custom_codes_4xx: Message},
    url_name="operator_access_declined",
)
@authorize(['industry_user'], UserOperator.get_all_industry_user_operator_roles(), False)
@handle_http_errors()
def get_user_operator_access_declined(request, operator_id: UUID):
    return 200, UserDataAccessService.is_users_user_operator_declined(get_current_user_guid(request), operator_id)
