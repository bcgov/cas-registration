from common.permissions import authorize
from django.http import HttpRequest
from common.api.utils import get_current_user_guid
from registration.constants import USER_OPERATOR_TAGS
from registration.models.user_operator import UserOperator
from service.data_access_service.user_operator_service import UserOperatorDataAccessService
from django.db.models import QuerySet, Q
from registration.decorators import handle_http_errors
from registration.schema.v1 import UserOperatorUsersOut
from registration.schema.generic import Message
from typing import List, Literal, Tuple
from registration.api.router import router
from service.error_service.custom_codes_4xx import custom_codes_4xx


# "current" refers to the current user-operator (we look up the current user-operator via the current user)
@router.get(
    "/v1/user-operators/current/operator-users",
    response={200: List[UserOperatorUsersOut], custom_codes_4xx: Message},
    tags=USER_OPERATOR_TAGS,
    description="""Retrieves the list of users associated with the operator of the current user. The current user is an industry user admin.
    The endpoint returns the users that have Pending or Approved status.
    The list is filtered based on the business GUID of the current user and the associated operator.""",
    auth=authorize("approved_industry_user"),
)
@handle_http_errors()
def v1_get_operator_users(request: HttpRequest) -> Tuple[Literal[200], QuerySet[UserOperator]]:
    current_user_guid = get_current_user_guid(request)
    return (
        200,
        UserOperatorDataAccessService.get_an_operators_user_operators_by_user_guid(current_user_guid)
        .exclude(Q(user_id=current_user_guid) | Q(status=UserOperator.Statuses.DECLINED))
        .distinct(),
    )  # Exclude the current user and declined users from the list
