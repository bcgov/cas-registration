from typing import Literal, Tuple
from common.permissions import authorize
from django.http import HttpRequest
from common.api.utils import get_current_user_guid
from registration.constants import OPERATION_TAGS
from service.operation_service import OperationService
from registration.decorators import handle_http_errors
from ..router import router
from registration.schema.v1 import (
    OperationCreateIn,
    OperationCreateOut,
    OperationPaginatedOut,
    OperationFilterSchema,
)
from registration.schema.generic import Message
from service.error_service.custom_codes_4xx import custom_codes_4xx
from ninja import Query
from ninja.types import DictStrAny

##### GET #####


@router.get(
    "/operations",
    response={200: OperationPaginatedOut, custom_codes_4xx: Message},
    tags=OPERATION_TAGS,
    description="""Retrieves a paginated list of operations based on the provided filters.
    The endpoint allows authorized users to view operations filtered by various criteria such as BCGHG ID, regulated operation, name, operator, status, and sort order.""",
    auth=authorize("approved_authorized_roles"),
)
@handle_http_errors()
def list_operations(
    request: HttpRequest, filters: OperationFilterSchema = Query(...)
) -> Tuple[Literal[200], DictStrAny]:
    return 200, OperationService.list_operations(get_current_user_guid(request), filters)


##### POST #####


@router.post(
    "/operations",
    response={201: OperationCreateOut, custom_codes_4xx: Message},
    tags=OPERATION_TAGS,
    description="""Creates a new operation for the current user.
    It verifies that an operation with the given BCGHG ID does not already exist and associates the new operation with the current user's approved user-operator.""",
    auth=authorize("approved_industry_user"),
)
@handle_http_errors()
def create_operation(request: HttpRequest, payload: OperationCreateIn) -> Tuple[Literal[201], DictStrAny]:
    return 201, OperationService.create_operation(get_current_user_guid(request), payload)
