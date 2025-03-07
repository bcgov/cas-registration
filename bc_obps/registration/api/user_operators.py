from django.db.models import QuerySet
from ninja import Query
from common.permissions import authorize
from common.api.utils import get_current_user_guid
from django.http import HttpRequest
from registration.models import UserOperator
from registration.api.router import router
from service.error_service.custom_codes_4xx import custom_codes_4xx
from typing import Literal, Tuple, Optional, List
from registration.constants import USER_OPERATOR_TAGS
from registration.schema import (
    OperatorIn,
    Message,
    UserOperatorOperatorOut,
    UserOperatorListOut,
    UserOperatorFilterSchema,
)
from service.user_operator_service import UserOperatorService
from ninja.pagination import paginate, PageNumberPagination

## GET
@router.get(
    "/user-operators",
    response={200: List[UserOperatorListOut], custom_codes_4xx: Message},
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
    sort_field: Optional[str] = "created_at",
    sort_order: Optional[Literal["desc", "asc"]] = "desc",
    paginate_result: bool = Query(True, description="Whether to paginate the results"),
) -> QuerySet[UserOperator]:
    # NOTE: PageNumberPagination raises an error if we pass the response as a tuple (like 200, ...)
    return UserOperatorService.list_user_operators(get_current_user_guid(request), sort_field, sort_order, filters)


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
) -> Tuple[Literal[201], UserOperatorOperatorOut]:
    user_operator_data = UserOperatorService.create_operator_and_user_operator(get_current_user_guid(request), payload)

    return 201, UserOperatorOperatorOut(**user_operator_data)
