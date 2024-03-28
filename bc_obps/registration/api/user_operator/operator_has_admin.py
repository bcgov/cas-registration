from uuid import UUID
from service.data_access_service.user_operator_service import UserOperatorDataAccessService
from service.data_access_service.user_service import UserDataAccessService

from registration.decorators import authorize, handle_http_errors
from registration.schema import (
    Message,
)
from registration.api.api_base import router

from registration.models import (
    AppRole,
    UserOperator,
)
from registration.api.custom_codes_4xx import custom_codes_4xx
from registration.api.utils.current_user_utils import get_current_user_guid


@router.get(
    "/operator-has-admin/{operator_id}",
    response={200: bool, custom_codes_4xx: Message},
    url_name="get_user_operator_admin_exists",
)
@authorize(AppRole.get_all_authorized_app_roles(), UserOperator.get_all_industry_user_operator_roles(), False)
@handle_http_errors()
def get_user_operator_admin_exists(request, operator_id: UUID):
    # this is maybe going to be a length check instead
    if UserOperatorDataAccessService.get_approved_admin_users(operator_id):
        # brianna what is this actually going to return
        return 200, True
    else:
        return 200, False
