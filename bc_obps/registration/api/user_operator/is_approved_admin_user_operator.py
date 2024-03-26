from service.user_operator.is_approved_admin_user_operator_service import IsApprovedAdminUserOperatorService

from registration.decorators import authorize, handle_http_errors
from registration.schema import (
    Message,
    IsApprovedUserOperator,
)
from registration.api.api_base import router

from registration.models import (
    UserOperator,
)
from registration.api.custom_codes_4xx import custom_codes_4xx


@router.get(
    "/is-approved-admin-user-operator/{user_guid}",
    response={200: IsApprovedUserOperator, custom_codes_4xx: Message},
    url_name="is_approved_admin_user_operator",
)
@authorize(["industry_user"], UserOperator.get_all_industry_user_operator_roles())
@handle_http_errors()
def is_approved_admin_user_operator(request, user_guid: str):
    return IsApprovedAdminUserOperatorService.is_approved_admin_user_operator(request, user_guid)
