from common.permissions import authorize
from registration.models.operator import Operator
from service.operator_service_v2 import OperatorServiceV2
from registration.schema.v2.operator import OperatorIn, OperatorOut
from service.error_service.custom_codes_4xx import custom_codes_4xx
from typing import Literal, Tuple
from django.http import HttpRequest
from common.api.utils import get_current_user_guid
from registration.decorators import handle_http_errors
from registration.schema.generic import Message
from registration.api.router import router


## PUT
@router.put(
    "/user-operators/current/operator",
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
