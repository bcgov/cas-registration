from service.user_operator_service import UserOperatorDataAccessService
from registration.decorators import authorize, handle_http_errors
from registration.schema import (
    UserOperatorOut,
    Message,
    UserOperatorStatusUpdate,
)

from registration.models import (
    AppRole,
)
from registration.api.custom_codes_4xx import custom_codes_4xx
from registration.api.api_base import router


@router.put(
    "/select-operator/user-operator/update-status",
    response={200: UserOperatorOut, custom_codes_4xx: Message},
    url_name="update_user_operator_status",
)
@authorize(AppRole.get_all_authorized_app_roles(), ["admin"])
@handle_http_errors()
def update_user_operator_status(request, payload: UserOperatorStatusUpdate):
    return 200, UserOperatorDataAccessService.update_user_operator_status(request, payload)
