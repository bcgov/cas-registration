from typing import Literal

from common.api.utils import get_current_user_guid
from common.permissions import authorize
from common.service.error_service.custom_codes_4xx import custom_codes_4xx
from django.http import HttpRequest
from registration.api.router import router
from registration.constants import USER_OPERATOR_TAGS
from registration.models.operator import Operator
from registration.schema import Message, OperatorIn, OperatorOut
from registration.service.data_access_service.user_service import UserDataAccessService
from registration.service.operator_service import OperatorService


## GET
@router.get(
    "/user-operators/current/operator",
    response={200: OperatorOut, custom_codes_4xx: Message},
    tags=USER_OPERATOR_TAGS,
    description="""Retrieves data about the current user-operator and their associated operator.
    Declined user-operators are excluded from the results.""",
    exclude_none=True,  # To exclude None values from the response (used for parent and partner arrays)
    auth=authorize("approved_industry_user"),
)
def get_current_operator_and_user_operator(
    request: HttpRequest,
) -> tuple[Literal[200], Operator]:
    operator = UserDataAccessService.get_operator_by_user(
        get_current_user_guid(request)
    )
    return 200, operator


## PUT
@router.put(
    "/user-operators/current/operator",
    response={200: OperatorOut, custom_codes_4xx: Message},
    tags=USER_OPERATOR_TAGS,
    description="""Updates the current user's operator.
    The endpoint ensures that industry users can only update their own operators.
    The updated data is saved.""",
    auth=authorize("approved_industry_user"),
)
def update_operator_and_user_operator(
    request: HttpRequest,
    payload: OperatorIn,
) -> tuple[Literal[200], Operator]:
    return 200, OperatorService.update_operator(get_current_user_guid(request), payload)
