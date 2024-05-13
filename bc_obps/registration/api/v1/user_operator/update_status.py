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
)
from service.error_service.custom_codes_4xx import custom_codes_4xx
from registration.api.router import router


@router.put(
    "/user-operator/update-status",
    response={200: UserOperatorOut, custom_codes_4xx: Message},
    url_name="update_user_operator_status",
)
@authorize(AppRole.get_all_authorized_app_roles(), ["admin"])
@handle_http_errors()
def update_user_operator_status(request, payload: UserOperatorStatusUpdate):
    return 200, UserOperatorService.update_user_operator_status(
        payload.user_operator_id, payload, get_current_user_guid(request)
    )
