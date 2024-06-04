from typing import Literal, Tuple
from django.http import HttpRequest
from registration.constants import USER_OPERATOR_TAGS
from registration.schema.v1.user_operator import PendingUserOperatorOut
from service.data_access_service.user_service import UserDataAccessService
from registration.api.utils.current_user_utils import get_current_user_guid
from registration.decorators import authorize, handle_http_errors
from registration.schema.generic import Message
from registration.api.router import router
from registration.models import UserOperator
from service.error_service.custom_codes_4xx import custom_codes_4xx

# We don't need a user_operator_id parameter (using "pending" instead) because we can look up the user_operator via the user data we receive in the middleware

# This endpoint retrieves data about both the user-operator and the operator.
@router.get(
    "/user-operators/pending",
    response={200: PendingUserOperatorOut, custom_codes_4xx: Message},
    url_name="get_pending_operator_and_user_operator",
    tags=USER_OPERATOR_TAGS,
    description="""Retrieves data about the pending user-operator and their associated operator.
    This endpoint leverages user data from the middleware to identify the current user-operator.
    Declined user-operators are excluded from the results.""",
)
@authorize(["industry_user"], UserOperator.get_all_industry_user_operator_roles(), False)
@handle_http_errors()
def get_pending_operator_and_user_operator(request: HttpRequest) -> Tuple[Literal[200], UserOperator]:
    return 200, UserDataAccessService.get_user_operator_by_user(get_current_user_guid(request))
