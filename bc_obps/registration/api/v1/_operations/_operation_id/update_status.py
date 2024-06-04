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
    tags=OPERATION_TAGS,
    description="""Updates the status of an operation.
    When an operation is approved or declined, it is marked as verified with the current timestamp and the user who performed the action.
    If the operation is approved, a unique BORO ID is generated, and the associated operator is approved if not already.
    An email notification is sent to the relevant external user based on the new status of the operation.""",
)
@authorize(AppRole.get_authorized_irc_roles())
@handle_http_errors()
def update_operation_status(
    request: HttpRequest, operation_id: UUID, payload: OperationUpdateStatusIn
) -> Tuple[Literal[200], Operation]:
    return 200, OperationService.update_status(get_current_user_guid(request), operation_id, payload.status)  # type: ignore[attr-defined]
