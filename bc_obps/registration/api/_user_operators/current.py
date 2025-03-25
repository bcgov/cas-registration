from typing import Literal, Tuple
from common.permissions import authorize
from django.http import HttpRequest
from registration.constants import USER_OPERATOR_TAGS
from registration.schema import CurrentUserOperatorOut, Message
from service.data_access_service.user_service import UserDataAccessService
from common.api.utils import get_current_user_guid
from registration.api.router import router
from registration.models import UserOperator
from service.error_service.custom_codes_4xx import custom_codes_4xx

# "current" refers to the current user-operator (we look up the current user-operator via the current user)
# We don't need a user_operator_id parameter (using "current" instead) because we can look up the user_operator via the user data we receive in the middleware
# This endpoint retrieves data about both the user-operator and the operator.
@router.get(
    "/user-operators/current",
    response={200: CurrentUserOperatorOut, custom_codes_4xx: Message},
    tags=USER_OPERATOR_TAGS,
    description="""Retrieves data about the user-operator and their associated operator regardless of approval status.
    Declined user-operators are excluded from the results.""",
    auth=authorize("industry_user"),
)
def get_current_operator_from_user_operator(request: HttpRequest) -> Tuple[Literal[200], UserOperator]:
    return 200, UserDataAccessService.get_user_operator_by_user(get_current_user_guid(request))
