from typing import Literal, Tuple
from django.http import HttpRequest
from registration.constants import USER_OPERATOR_TAGS
from registration.schema.v1.operator import OperatorFromUserOperatorOut
from registration.schema.v1.user_operator import PendingUserOperatorOut
from service.data_access_service.user_service import UserDataAccessService
from registration.api.utils.current_user_utils import get_current_user_guid
from registration.decorators import authorize, handle_http_errors
from registration.schema.generic import Message
from registration.api.router import router

from registration.models import (
    UserOperator,
)
from service.error_service.custom_codes_4xx import custom_codes_4xx


# "current" refers to the current user-operator (we look up the current user-operator via the current user)
# this endpoint retrieves data about both the user-operator and the operator
@router.get(
    "/user-operators/current",
    response={200: OperatorFromUserOperatorOut, custom_codes_4xx: Message},
    url_name="get_current_operator_and_user_operator",
    tags=USER_OPERATOR_TAGS,
)
@authorize(["industry_user"], UserOperator.get_all_industry_user_operator_roles())
@handle_http_errors()
def get_current_operator_and_user_operator(request: HttpRequest) -> Tuple[Literal[200], PendingUserOperatorOut]:
    user_operator = UserDataAccessService.get_user_operator_by_user(get_current_user_guid(request))
    return 200, PendingUserOperatorOut.from_orm(user_operator)
