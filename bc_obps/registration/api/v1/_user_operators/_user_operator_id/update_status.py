from typing import Literal, Tuple
from django.http import HttpRequest
from uuid import UUID
from registration.constants import USER_OPERATOR_TAGS
from service.user_operator_service import UserOperatorService
from registration.api.utils.current_user_utils import get_current_user_guid
from registration.decorators import authorize, handle_http_errors
from registration.schema.v1 import (
    UserOperatorOut,
    UserOperatorStatusUpdate,
)
from registration.schema.generic import Message
from registration.models import (
    AppRole,
    UserOperator,
)
from service.error_service.custom_codes_4xx import custom_codes_4xx
from registration.api.router import router


@router.put(
    "/user-operators/{user_operator_id}/update-status",
    response={200: UserOperatorOut, custom_codes_4xx: Message},
    tags=USER_OPERATOR_TAGS,
    description="""Updates the status of a user operator by its ID.
    If the status is updated to 'APPROVED' or 'DECLINED', the user operator is verified with the current timestamp and the admin who performed the action.
    An email notification is sent based on the updated status.""",
)
@authorize(AppRole.get_all_authorized_app_roles(), ["admin"])
@handle_http_errors()
def update_user_operator_status(
    request: HttpRequest, user_operator_id: UUID, payload: UserOperatorStatusUpdate
) -> Tuple[Literal[200], UserOperator]:
    return 200, UserOperatorService.update_status(user_operator_id, payload, get_current_user_guid(request))
