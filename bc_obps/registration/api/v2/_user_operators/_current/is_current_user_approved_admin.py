from typing import Dict, Literal, Tuple
from common.permissions import authorize
from django.http import HttpRequest
from common.api.utils import get_current_user_guid
from registration.constants import USER_OPERATOR_TAGS
from service.data_access_service.user_service import UserDataAccessService
from registration.schema import IsApprovedUserOperator, Message
from registration.api.router import router
from service.error_service.custom_codes_4xx import custom_codes_4xx


# "current" refers to the current user-operator (we look up the current user-operator via the current user)
@router.get(
    "/user-operators/current/is-current-user-approved-admin",
    response={200: IsApprovedUserOperator, custom_codes_4xx: Message},
    tags=USER_OPERATOR_TAGS,
    description="""Checks if the current user is an approved admin for their operator.
    The endpoint verifies whether the current user has the 'ADMIN' role and 'APPROVED' status.
    It returns a dictionary indicating whether the user is an approved admin.""",
    auth=authorize("approved_industry_user"),
)
def is_current_user_approved_admin(request: HttpRequest) -> Tuple[Literal[200], Dict[str, bool]]:
    user_guid = get_current_user_guid(request)
    return 200, UserDataAccessService.is_user_an_approved_admin_user_operator(user_guid)
