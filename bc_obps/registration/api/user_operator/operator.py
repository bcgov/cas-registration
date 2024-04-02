from service.user_operator_service import UserOperatorService
from registration.api.utils.current_user_utils import get_current_user_guid
from registration.decorators import authorize, handle_http_errors
from registration.schema import (
    Message,
    UserOperatorOperatorIn,
    RequestAccessOut,
)
from registration.api.api_base import router

from registration.models import (
    UserOperator,
)
from uuid import UUID
from registration.api.custom_codes_4xx import custom_codes_4xx

## POST
@router.post(
    "/user-operator/operator",
    response={200: RequestAccessOut, custom_codes_4xx: Message},
    url_name="create_operator_and_user_operator",
)
@authorize(["industry_user"], UserOperator.get_all_industry_user_operator_roles(), False)
@handle_http_errors()
def create_operator_and_user_operator(request, payload: UserOperatorOperatorIn):
    return UserOperatorService.create_operator_and_user_operator(payload, get_current_user_guid(request))


## PUT
@router.put(
    "/user-operator/operator/{uuid:user_operator_id}",
    response={200: RequestAccessOut, custom_codes_4xx: Message},
    url_name="update_operator_and_user_operator",
)
@authorize(["industry_user"], ["admin"])
@handle_http_errors()
def update_operator_and_user_operator(request, payload: UserOperatorOperatorIn, user_operator_id: UUID):
    UserOperatorService.check_if_user_eligible_to_access_user_operator(
        get_current_user_guid(request), user_operator_id
    )  # industry users can only update their own user_operators
    return 200, UserOperatorService.update_operator_and_user_operator(
        user_operator_id, payload, get_current_user_guid(request)
    )
