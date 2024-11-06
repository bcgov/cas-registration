from common.permissions import authorize
from registration.constants import V2
from registration.models.operator import Operator
from service.operator_service_v2 import OperatorServiceV2
from registration.schema.v2.operator import OperatorIn, OperatorOut
from service.error_service.custom_codes_4xx import custom_codes_4xx
from typing import Literal, Tuple
from django.http import HttpRequest
from service.data_access_service.user_service import UserDataAccessService
from common.api.utils import get_current_user_guid
from registration.decorators import handle_http_errors
from registration.schema.generic import Message
from registration.api.router import router


# "current" refers to the current user-operator (we look up the current user-operator via the current user)
# this endpoint retrieves data about both the user-operator and the operator

## GET
@router.get(
    "/v2/user-operators/current/operator",
    response={200: OperatorOut, custom_codes_4xx: Message},
    tags=V2,
    description="""Retrieves data about the current user-operator and their associated operator.
    Declined user-operators are excluded from the results.""",
    exclude_none=True,  # To exclude None values from the response (used for parent and partner arrays)
    auth=authorize("approved_industry_user"),
)
@handle_http_errors()
def get_current_operator_and_user_operator_v2(request: HttpRequest) -> Tuple[Literal[200], Operator]:
    operator = UserDataAccessService.get_operator_by_user(get_current_user_guid(request))
    return 200, operator


## PUT
@router.put(
    "/v2/user-operators/current/operator",
    response={200: OperatorOut, custom_codes_4xx: Message},
    tags=["V2"],
    description="""Updates the current user's operator.
    The endpoint ensures that industry users can only update their own operators.
    The updated data is saved.""",
    auth=authorize("approved_industry_user"),
)
@handle_http_errors()
def update_operator_and_user_operator(
    request: HttpRequest,
    payload: OperatorIn,
) -> Tuple[Literal[200], Operator]:
    return 200, OperatorServiceV2.update_operator(get_current_user_guid(request), payload)
