from uuid import UUID
from registration.api.utils.current_user_utils import get_current_user_guid
from service.application_access_service import ApplicationAccessService
from registration.decorators import authorize, handle_http_errors
from registration.schema import (
    Message,
    RequestAccessOut,
)
from registration.api.api_base import router

from registration.models import (
    UserOperator,
)
from service.error_service.custom_codes_4xx import custom_codes_4xx


@router.post(
    "/select-operator/{operator_id}/request-admin-access",
    response={201: RequestAccessOut, custom_codes_4xx: Message},
    url_name="request_admin_access",
)
@authorize(["industry_user"], UserOperator.get_all_industry_user_operator_roles(), False)
@handle_http_errors()
def request_admin_access(request, operator_id: UUID):
    user_guid = get_current_user_guid(request)
    return 201, ApplicationAccessService.request_admin_access(operator_id, user_guid)
