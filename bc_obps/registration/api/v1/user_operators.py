from typing import Literal, Tuple, Dict
from uuid import UUID
from django.http import HttpRequest
from registration.api.utils.current_user_utils import get_current_user_guid
from registration.schema.v1.user_operator import RequestAccessOut, UserOperatorOperatorIn
from registration.constants import USER_OPERATOR_TAGS
from service.user_operator_service import UserOperatorService
from registration.decorators import authorize, handle_http_errors
from registration.schema.v1 import UserOperatorPaginatedOut
from registration.schema.generic import Message
from registration.api.router import router

from registration.models import (
    AppRole,
    UserOperator,
)
from service.error_service.custom_codes_4xx import custom_codes_4xx


@router.get(
    "/user-operators",
    response={200: UserOperatorPaginatedOut, custom_codes_4xx: Message},
    tags=USER_OPERATOR_TAGS,
    description="""Retrieves a paginated list of user operators.
    The endpoint allows authorized IRC roles to view user operators, sorted by various fields such as creation date, user details, and operator legal name.
    It excludes pending user operators for operators with approved admins and approved user operators verified by industry users.""",
)
@authorize(AppRole.get_authorized_irc_roles())
@handle_http_errors()
def list_user_operators(
    request: HttpRequest, page: int = 1, sort_field: str = "created_at", sort_order: str = "desc"
) -> Tuple[Literal[200], UserOperatorPaginatedOut]:
    return 200, UserOperatorService.list_user_operators(page, sort_field, sort_order)


## POST
@router.post(
    "/user-operators",
    response={200: RequestAccessOut, custom_codes_4xx: Message},
    tags=USER_OPERATOR_TAGS,
    description="""Creates a new operator and a user-operator for the current user.
    The endpoint ensures that only authorized industry users can create a new operator and user-operator.
    It checks for the uniqueness of the CRA Business Number and sets the operator's status to 'Pending'.
    An email notification is sent to confirm the creation and access request.""",
)
@authorize(["industry_user"], UserOperator.get_all_industry_user_operator_roles(), False)
@handle_http_errors()
def create_operator_and_user_operator(
    request: HttpRequest, payload: UserOperatorOperatorIn
) -> Tuple[Literal[200], Dict[str, UUID]]:
    return 200, UserOperatorService.create_operator_and_user_operator(payload, get_current_user_guid(request))
