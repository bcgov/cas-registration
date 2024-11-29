from typing import Literal, Tuple
from uuid import UUID
from common.permissions import authorize
from django.http import HttpRequest
from common.api.utils import get_current_user_guid
from registration.constants import OPERATION_TAGS
from service.error_service.custom_codes_4xx import custom_codes_4xx
from service.operation_service import OperationService
from registration.decorators import handle_http_errors
from registration.api.router import router
from registration.models import Operation
from registration.schema.v1 import (
    OperationUpdateStatusIn,
    OperationUpdateStatusOut,
)
from registration.schema.generic import Message


@router.put(
    "/operations/{operation_id}/update-status",
    response={200: OperationUpdateStatusOut, custom_codes_4xx: Message},
    tags=OPERATION_TAGS,
    description="""Updates the status of an operation.
    When an operation is approved or declined, it is marked as verified with the current timestamp and the user who performed the action.
    If the operation is approved, a unique BORO ID is generated, and the associated operator is approved if not already.
    An email notification is sent to the relevant external user based on the new status of the operation.""",
    auth=authorize("v1_authorized_irc_user"),
)
@handle_http_errors()
def update_operation_status(
    request: HttpRequest, operation_id: UUID, payload: OperationUpdateStatusIn
) -> Tuple[Literal[200], Operation]:
    return 200, OperationService.update_status(get_current_user_guid(request), operation_id, payload.status)  # type: ignore[attr-defined]
