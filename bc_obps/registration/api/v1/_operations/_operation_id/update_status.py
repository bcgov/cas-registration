from uuid import UUID
from registration.api.utils.current_user_utils import get_current_user_guid
from service.operation_service import OperationService
from registration.decorators import authorize, handle_http_errors
from registration.api.router import router
from registration.models import (
    AppRole,
)
from registration.schema import (
    Message,
    OperationUpdateStatusIn,
    OperationUpdateStatusOut,
)
from ninja.responses import codes_4xx, codes_5xx


@router.put(
    "/operation/{operation_id}/update-status",
    response={200: OperationUpdateStatusOut, codes_4xx: Message, codes_5xx: Message},
    url_name="update_status",
)
@authorize(AppRole.get_authorized_irc_roles())
@handle_http_errors()
def update_status(request, operation_id: UUID, payload: OperationUpdateStatusIn):
    return 200, OperationService.update_status(get_current_user_guid(request), operation_id, payload.status)
