from typing import Dict, Literal, Tuple
from uuid import UUID
from common.permissions import authorize
from django.http import HttpRequest
from registration.constants import OPERATOR_TAGS
from registration.schema.v1.user_operator import RequestAccessOut
from common.api.utils import get_current_user_guid
from service.application_access_service import ApplicationAccessService
from registration.decorators import handle_http_errors
from registration.schema import Message
from registration.api.router import router
from service.error_service.custom_codes_4xx import custom_codes_4xx


@router.post(
    "/v1/operators/{operator_id}/request-admin-access",
    response={201: RequestAccessOut, custom_codes_4xx: Message},
    tags=OPERATOR_TAGS,
    description="""Allows an industry user to request admin access to a specific operator.
    The endpoint checks if the user is eligible to request admin access, and if so, creates a draft UserOperator instance if one does not already exist.
    An email notification is sent to the operator if a new request is created.""",
    auth=authorize("industry_user"),
)
@handle_http_errors()
def v1_request_admin_access(request: HttpRequest, operator_id: UUID) -> Tuple[Literal[201], Dict[str, UUID]]:
    user_guid = get_current_user_guid(request)
    return 201, ApplicationAccessService.request_admin_access(operator_id, user_guid)
