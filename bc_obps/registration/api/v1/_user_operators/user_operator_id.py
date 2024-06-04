from typing import Dict, Literal, Tuple
from django.http import HttpRequest
from registration.constants import USER_OPERATOR_TAGS
from service.user_operator_service import UserOperatorService
from registration.api.utils.current_user_utils import get_current_user_guid
from registration.decorators import authorize, handle_http_errors
from registration.schema.v1 import (
    UserOperatorOperatorIn,
    RequestAccessOut,
)
from registration.schema.generic import Message
from registration.api.router import router

from registration.models import (
    UserOperator,
)
from uuid import UUID
from service.error_service.custom_codes_4xx import custom_codes_4xx

from service.data_access_service.user_operator_service import UserOperatorDataAccessService

from registration.schema.v1 import UserOperatorOut

from registration.models import (
    AppRole,
)


# GET
@router.get(
    "/user-operators/{uuid:user_operator_id}",
    response={200: UserOperatorOut, custom_codes_4xx: Message},
    url_name="get_user_operator",
    tags=USER_OPERATOR_TAGS,
    description="""Retrieves data about a specific user-operator by its ID.
    It checks if a user is eligible to access a user_operator (i.e., they're allowed to access their own information (user_operator, operations, etc.) but not other people's).
    Internal users are always allowed to access user operators.""",
)
@authorize(AppRole.get_all_authorized_app_roles(), UserOperator.get_all_industry_user_operator_roles())
@handle_http_errors()
def get_user_operator_by_id(request: HttpRequest, user_operator_id: UUID) -> Tuple[Literal[200], UserOperator]:
    UserOperatorService.check_if_user_eligible_to_access_user_operator(
        get_current_user_guid(request), user_operator_id
    )  # industry users can only access their own user_operators
    return 200, UserOperatorDataAccessService.get_user_operator_by_id(user_operator_id)


## PUT
@router.put(
    "/user-operators/{uuid:user_operator_id}",
    response={200: RequestAccessOut, custom_codes_4xx: Message},
    url_name="update_operator_and_user_operator",
    tags=USER_OPERATOR_TAGS,
    description="""Updates both the operator and the user-operator by their ID.
    The endpoint ensures that industry users can only update their own user-operators.
    It checks for the uniqueness of the CRA Business Number and updates the operator's status to 'Pending' if it is currently 'Draft'.
    The updated data is saved, and a new user-operator instance is created if one does not already exist.""",
)
@authorize(["industry_user"], ["admin"])
@handle_http_errors()
def update_operator_and_user_operator(
    request: HttpRequest, payload: UserOperatorOperatorIn, user_operator_id: UUID
) -> Tuple[Literal[200], Dict[str, UUID]]:
    UserOperatorService.check_if_user_eligible_to_access_user_operator(
        get_current_user_guid(request), user_operator_id
    )  # industry users can only update their own user_operators
    return 200, UserOperatorService.update_operator_and_user_operator(
        user_operator_id, payload, get_current_user_guid(request)
    )
