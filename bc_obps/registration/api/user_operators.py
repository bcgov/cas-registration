from typing import List, Literal, Optional, Tuple

from common.api.utils import get_current_user_guid
from common.permissions import authorize
from common.service.error_service.custom_codes_4xx import custom_codes_4xx
from django.db.models import QuerySet
from django.http import HttpRequest
from ninja import Query
from ninja.pagination import PageNumberPagination, paginate
from registration.api.router import router
from registration.constants import USER_OPERATOR_TAGS
from registration.models import UserOperator
from registration.schema import (
    Message,
    OperatorIn,
    UserOperatorFilterSchema,
    UserOperatorListOut,
    UserOperatorOperatorOut,
)
from registration.service.user_operator_service import UserOperatorService


## GET
@router.get(
    "/user-operators",
    response={200: list[UserOperatorListOut], custom_codes_4xx: Message},
    tags=USER_OPERATOR_TAGS,
    description="""Retrieves a paginated list of user operators.
    The endpoint allows authorized IRC roles to view user operators, sorted by various fields such as creation date,
    user details, and operator legal name.""",
    auth=authorize("authorized_irc_user"),
)
@paginate(PageNumberPagination)
def list_user_operators(
    request: HttpRequest,
    filters: UserOperatorFilterSchema = Query(...),
    sort_field: str | None = "status",
    sort_order: Literal["desc", "asc"] | None = "desc",
    paginate_result: bool = Query(True, description="Whether to paginate the results"),
) -> QuerySet[UserOperator]:
    # NOTE: PageNumberPagination raises an error if we pass the response as a tuple (like 200, ...)
    return UserOperatorService.list_user_operators(
        get_current_user_guid(request), sort_field, sort_order, filters
    )


## POST
@router.post(
    "/user-operators",
    response={201: UserOperatorOperatorOut, custom_codes_4xx: Message},
    tags=USER_OPERATOR_TAGS,
    description="""Creates a new operator and a new user-operator for the current user.
    The endpoint ensures that only authorized industry users can create a new operator and user-operator.
    It sets the operator's status to 'Approved' and the user operator's role to 'admin' and status to 'Approved`.""",
    auth=authorize("industry_user"),
)
def create_operator_and_user_operator(
    request: HttpRequest, payload: OperatorIn
) -> tuple[Literal[201], UserOperatorOperatorOut]:
    user_operator_data = UserOperatorService.create_operator_and_user_operator(
        get_current_user_guid(request), payload
    )

    return 201, UserOperatorOperatorOut(**user_operator_data)
