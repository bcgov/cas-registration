from uuid import UUID
from django.db import transaction
from registration.api.utils.current_user_utils import get_current_user
from service.operation_service import OperationService
from registration.utils import generate_useful_error
from registration.decorators import authorize, handle_http_errors
from registration.api.api_base import router
from datetime import datetime
from django.core.exceptions import ValidationError
from zoneinfo import ZoneInfo
from registration.models import (
    AppRole,
    Operation,
    Operator,
    User,
)
from registration.schema import (
    Message,
    OperationUpdateStatusIn,
    OperationUpdateStatusOut,
)
from ninja.responses import codes_4xx, codes_5xx
from ninja.errors import HttpError


@router.put(
    "/operation/{operation_id}/update-status",
    response={200: OperationUpdateStatusOut, codes_4xx: Message, codes_5xx: Message},
    url_name="update_operation_status",
)
@authorize(AppRole.get_authorized_irc_roles())
@handle_http_errors()
def update_operation_status(request, operation_id: UUID, payload: OperationUpdateStatusIn):
    return 200, OperationService.update_operation_status(
        get_current_user(request).user_guid, operation_id, payload.status
    )
