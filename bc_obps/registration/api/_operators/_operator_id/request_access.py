from typing import Dict, Literal, Tuple
from uuid import UUID
from common.permissions import authorize
from django.http import HttpRequest
from registration.constants import OPERATOR_TAGS
from registration.schema import RequestAccessOut, Message
from common.api.utils import get_current_user_guid
from registration.api.router import router
from service.error_service.custom_codes_4xx import custom_codes_4xx
from service.application_access_service import ApplicationAccessService


@router.post(
    "/operators/{operator_id}/request-access",
    response={201: RequestAccessOut, custom_codes_4xx: Message},
    tags=OPERATOR_TAGS,
    description="""Allows an industry user to request access to a specific operator.
    The endpoint checks if the user is eligible to request access, and if so, creates a draft UserOperator instance if one does not already exist.
    An email notification is sent to the operator if a new request is created.""",
    auth=authorize("industry_user"),
)
def request_access(request: HttpRequest, operator_id: UUID) -> Tuple[Literal[201], Dict[str, UUID]]:

    return 201, ApplicationAccessService.request_access(operator_id, get_current_user_guid(request))
