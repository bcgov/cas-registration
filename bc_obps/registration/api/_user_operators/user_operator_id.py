from typing import Literal, Tuple
from common.permissions import authorize
from django.http import HttpRequest
from registration.constants import USER_OPERATOR_TAGS
from registration.schema import UserOperatorOutV2, Message
from common.api.utils import get_current_user_guid
from registration.api.router import router
from registration.models import UserOperator
from uuid import UUID
from service.error_service.custom_codes_4xx import custom_codes_4xx
from service.data_access_service.user_operator_service import UserOperatorDataAccessService
from service.user_operator_service import UserOperatorService


# GET
@router.get(
    "/user-operators/{uuid:user_operator_id}",
    response={200: UserOperatorOutV2, custom_codes_4xx: Message},
    tags=USER_OPERATOR_TAGS,
    description="""Retrieves data about a specific user-operator by its ID.
    It checks if a user is eligible to access a user_operator (i.e., they're allowed to access their own information (user_operator, operations, etc.) but not other people's).
    Internal users are always allowed to access user operators.""",
    auth=authorize("approved_authorized_roles"),
)
def get_user_operator_by_id(request: HttpRequest, user_operator_id: UUID) -> Tuple[Literal[200], UserOperator]:
    UserOperatorService.check_if_user_eligible_to_access_user_operator(
        get_current_user_guid(request), user_operator_id
    )  # industry users can only access their own user_operators
    return 200, UserOperatorDataAccessService.get_user_operator_by_id(user_operator_id)
