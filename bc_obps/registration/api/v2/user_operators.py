from common.permissions import authorize
from common.api.utils import get_current_user_guid
from django.http import HttpRequest
from registration.decorators import handle_http_errors
from registration.schema.generic import Message
from registration.api.router import router
from service.error_service.custom_codes_4xx import custom_codes_4xx
from typing import Literal, Tuple

from registration.constants import USER_OPERATOR_TAGS_V2
from registration.schema.v2.operator import OperatorIn
from registration.schema.v2.user_operator import UserOperatorOperatorOut
from service.user_operator_service_v2 import UserOperatorServiceV2


## POST
@router.post(
    "/v2/user-operators",
    response={200: UserOperatorOperatorOut, custom_codes_4xx: Message},
    tags=USER_OPERATOR_TAGS_V2,
    description="""Creates a new operator and a new user-operator for the current user.
    The endpoint ensures that only authorized industry users can create a new operator and user-operator.
    It sets the operator's status to 'Approved' and the user operator's role to 'admin' and status to 'Approved`.""",
    auth=authorize("industry_user"),
)
@handle_http_errors()
def create_operator_and_user_operator_v2(
    request: HttpRequest, payload: OperatorIn
) -> Tuple[Literal[200], UserOperatorOperatorOut]:
    user_operator_data = UserOperatorServiceV2.create_operator_and_user_operator(
        get_current_user_guid(request), payload
    )

    return 200, UserOperatorOperatorOut(**user_operator_data)
