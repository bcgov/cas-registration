from uuid import UUID
from service.current_user_service import CurrentUserService

from registration.decorators import authorize, handle_http_errors
from registration.schema import (
    Message,
)
from registration.api.api_base import router

from registration.models import (
    UserOperator,
)
from registration.api.custom_codes_4xx import custom_codes_4xx


@router.get(
    "/operator-access-declined/{operator_id}",
    response={200: bool, custom_codes_4xx: Message},
    url_name="operator_access_declined",
)
@authorize(['industry_user'], UserOperator.get_all_industry_user_operator_roles(), False)
@handle_http_errors()
def get_user_operator_access_declined(operator_id: UUID):
    return CurrentUserService.is_users_user_operator_declined(CurrentUserService.get_user_guid(), operator_id)
