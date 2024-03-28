from uuid import UUID
from service.user_operator_service import UserOperatorDataAccessService

from registration.decorators import authorize, handle_http_errors
from registration.schema import (
    UserOperatorOut,
    Message,
)
from typing import List
from registration.api.api_base import router

from registration.models import (
    AppRole,
    UserOperator,
)
from registration.api.custom_codes_4xx import custom_codes_4xx


@router.get(
    "/select-operator/user-operator/{uuid:user_operator_id}",
    response={200: UserOperatorOut, custom_codes_4xx: Message},
    url_name="get_user_operator",
)
@authorize(AppRole.get_all_authorized_app_roles(), UserOperator.get_all_industry_user_operator_roles())
@handle_http_errors()
def get_user_operator_by_id(request, user_operator_id: UUID):
    return 200, UserOperatorDataAccessService.get_user_operator_by_id(user_operator_id)
