from typing import Literal, Tuple
from uuid import UUID
from django.http import HttpRequest
from registration.api.utils.current_user_utils import get_current_user_guid
from registration.constants import OPERATION_TAGS
from service.operation_service import OperationService
from registration.decorators import authorize, handle_http_errors
from registration.api.router import router
from registration.models import (
    AppRole,
    Operation,
)
from registration.schema.v1 import (
    OperationUpdateStatusIn,
    OperationUpdateStatusOut,
)
from registration.schema.generic import Message
from ninja.responses import codes_4xx, codes_5xx


@router.put(
    "/operations/{operation_id}/update-status",
    response={200: OperationUpdateStatusOut, codes_4xx: Message, codes_5xx: Message},
    url_name="update_operation_status",
    tags=OPERATION_TAGS,
)
@authorize(AppRole.get_authorized_irc_roles())
@handle_http_errors()
def update_operation_status(
    request: HttpRequest, operation_id: UUID, payload: OperationUpdateStatusIn
) -> Tuple[Literal[200], Operation]:
    return 200, OperationService.update_status(get_current_user_guid(request), operation_id, payload.status)  # type: ignore[attr-defined]
