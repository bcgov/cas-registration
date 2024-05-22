from typing import Dict, Literal, Tuple
from uuid import UUID
from django.http import HttpRequest
from registration.api.utils.current_user_utils import get_current_user_guid
from registration.constants import SELECT_OPERATOR_TAGS
from service.application_access_service import ApplicationAccessService
from registration.decorators import authorize, handle_http_errors
from registration.schema.v1 import (
    SelectOperatorIn,
    RequestAccessOut,
)
from registration.schema.generic import Message
from registration.api.router import router

from registration.models import (
    UserOperator,
)
from service.error_service.custom_codes_4xx import custom_codes_4xx


@router.post(
    "/select-operator/request-admin-access",
    response={201: RequestAccessOut, custom_codes_4xx: Message},
    url_name="request_admin_access",
    tags=SELECT_OPERATOR_TAGS,
)
@authorize(["industry_user"], UserOperator.get_all_industry_user_operator_roles(), False)
@handle_http_errors()
def request_admin_access(request: HttpRequest, payload: SelectOperatorIn) -> Tuple[Literal[201], Dict[str, UUID]]:
    user_guid: UUID = get_current_user_guid(request)
    return 201, ApplicationAccessService.request_admin_access(payload.operator_id, user_guid)
