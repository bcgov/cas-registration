from typing import Literal, Tuple, Dict
from uuid import UUID
from common.permissions import authorize
from django.http import HttpRequest
from common.api.utils import get_current_user_guid
from registration.schema.v1.user_operator import RequestAccessOut, UserOperatorOperatorIn
from registration.constants import USER_OPERATOR_TAGS
from service.user_operator_service import UserOperatorService
from registration.decorators import handle_http_errors
from registration.schema.v1 import UserOperatorPaginatedOut
from registration.schema.generic import Message
from registration.api.router import router
from service.error_service.custom_codes_4xx import custom_codes_4xx


@router.get(
    "/v1/user-operators",
    response={200: UserOperatorPaginatedOut, custom_codes_4xx: Message},
    tags=USER_OPERATOR_TAGS,
    description="""Retrieves a paginated list of user operators.
    The endpoint allows authorized IRC roles to view user operators, sorted by various fields such as creation date, user details, and operator legal name.
    It excludes:
    - pending user operators for operators with approved admins
    - approved user operators verified by industry users.""",
    auth=authorize("authorized_irc_user"),
)
@handle_http_errors()
def v1_list_user_operators(
    request: HttpRequest, page: int = 1, sort_field: str = "created_at", sort_order: str = "desc"
) -> Tuple[Literal[200], UserOperatorPaginatedOut]:
    return 200, UserOperatorService.list_user_operators(page, sort_field, sort_order)


## POST
@router.post(
    "/v1/user-operators",
    response={200: RequestAccessOut, custom_codes_4xx: Message},
    tags=USER_OPERATOR_TAGS,
    description="""Creates a new operator and a user-operator for the current user.
    The endpoint ensures that only authorized industry users can create a new operator and user-operator.
    It checks for the uniqueness of the CRA Business Number and sets the operator's status to 'Pending'.
    An email notification is sent to confirm the creation and access request.""",
    auth=authorize("industry_user"),
)
@handle_http_errors()
def v1_create_operator_and_user_operator(
    request: HttpRequest, payload: UserOperatorOperatorIn
) -> Tuple[Literal[200], Dict[str, UUID]]:
    return 200, UserOperatorService.create_operator_and_user_operator(payload, get_current_user_guid(request))
