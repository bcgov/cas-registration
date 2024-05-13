from uuid import UUID
from service.data_access_service.user_operator_service import UserOperatorDataAccessService
from registration.decorators import authorize, handle_http_errors
from registration.schema import Message
from registration.api.router import router
from registration.models import (
    AppRole,
    UserOperator,
)
from service.error_service.custom_codes_4xx import custom_codes_4xx


@router.get(
    "/operator/operator-has-admin/{operator_id}",
    response={200: bool, custom_codes_4xx: Message},
    url_name="get_user_operator_admin_exists",
)
@authorize(AppRole.get_all_authorized_app_roles(), UserOperator.get_all_industry_user_operator_roles(), False)
@handle_http_errors()
def get_user_operator_admin_exists(request, operator_id: UUID):
    return 200, UserOperatorDataAccessService.get_admin_users(operator_id, UserOperator.Statuses.APPROVED).exists()
