from service.user_operator.operator_service import OperatorService
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
    return OperatorService.create_operator_and_user_operator(request, payload)


## PUT
@router.put(
    "/user-operator/operator/{uuid:user_operator_id}",
    response={200: RequestAccessOut, custom_codes_4xx: Message},
    url_name="update_operator_and_user_operator",
)
@authorize(["industry_user"], ["admin"])
@handle_http_errors()
def update_operator_and_user_operator(request, payload: UserOperatorOperatorIn, user_operator_id: UUID):

    return OperatorService.update_operator_and_user_operator(request, payload, user_operator_id)
