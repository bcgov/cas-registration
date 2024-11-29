from typing import Literal, Tuple
from common.permissions import authorize
from django.http import HttpRequest
from registration.constants import USER_OPERATOR_TAGS
from registration.schema.v1.operator import OperatorFromUserOperatorOut
from service.data_access_service.user_service import UserDataAccessService
from common.api.utils import get_current_user_guid
from registration.decorators import handle_http_errors
from registration.schema.generic import Message
from registration.api.router import router

from registration.models import (
    UserOperator,
)
from service.error_service.custom_codes_4xx import custom_codes_4xx


# "current" refers to the current user-operator (we look up the current user-operator via the current user)
# this endpoint retrieves data about both the user-operator and the operator
@router.get(
    "/v1/user-operators/current",
    response={200: OperatorFromUserOperatorOut, custom_codes_4xx: Message},
    tags=USER_OPERATOR_TAGS,
    description="""Retrieves data about the current user-operator and their associated operator.
    Declined user-operators are excluded from the results.""",
    auth=authorize("approved_industry_user"),
)
@handle_http_errors()
def v1_get_current_operator_and_user_operator(request: HttpRequest) -> Tuple[Literal[200], UserOperator]:
    user_operator = UserDataAccessService.get_user_operator_by_user(get_current_user_guid(request))
    return 200, user_operator
