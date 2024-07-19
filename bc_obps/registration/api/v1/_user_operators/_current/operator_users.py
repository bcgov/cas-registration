from django.http import HttpRequest
from registration.api.utils.current_user_utils import get_current_user_guid
from registration.constants import USER_OPERATOR_TAGS
from registration.models.user_operator import UserOperator
from service.data_access_service.user_operator_service import UserOperatorDataAccessService
from django.db.models import QuerySet
from registration.decorators import authorize, handle_http_errors
from registration.schema.v1 import UserOperatorUsersOut
from registration.schema.generic import Message
from typing import List, Literal, Tuple
from registration.api.router import router
from service.error_service.custom_codes_4xx import custom_codes_4xx


# "current" refers to the current user-operator (we look up the current user-operator via the current user)
@router.get(
    "/user-operators/current/operator-users",
    response={200: List[UserOperatorUsersOut], custom_codes_4xx: Message},
    tags=USER_OPERATOR_TAGS,
    description="""Retrieves the list of users associated with the operator of the current user. The current user is an industry user admin.
    The endpoint returns the users that have Pending or Approved status.
    The list is filtered based on the business GUID of the current user and the associated operator.""",
)
@authorize(["industry_user"], ["admin"])
@handle_http_errors()
def get_operator_users(request: HttpRequest) -> Tuple[Literal[200], QuerySet[UserOperator]]:
    return 200, UserOperatorDataAccessService.get_an_operators_user_operators_by_user_guid(
        get_current_user_guid(request)
    )
