from uuid import UUID
from registration.api.utils.current_user_utils import get_current_user_guid
from registration.constants import USER_OPERATOR_TAGS
from service.user_operator_service import UserOperatorService
from service.data_access_service.user_operator_service import UserOperatorDataAccessService

from registration.decorators import authorize, handle_http_errors
from registration.schema.v1 import UserOperatorOut
from registration.schema.generic import Message
from registration.api.router import router

from registration.models import (
    AppRole,
    UserOperator,
)
from service.error_service.custom_codes_4xx import custom_codes_4xx


@router.get(
    "user-operator/{uuid:user_operator_id}",
    response={200: UserOperatorOut, custom_codes_4xx: Message},
    url_name="get_user_operator",
    tags=USER_OPERATOR_TAGS,
)
@authorize(AppRole.get_all_authorized_app_roles(), UserOperator.get_all_industry_user_operator_roles())
@handle_http_errors()
def get_user_operator_by_id(request, user_operator_id: UUID):
    UserOperatorService.check_if_user_eligible_to_access_user_operator(
        get_current_user_guid(request), user_operator_id
    )  # industry users can only access their own user_operators
    return 200, UserOperatorDataAccessService.get_user_operator_by_id(user_operator_id)
