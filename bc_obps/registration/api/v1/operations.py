from typing import Literal, Tuple
from common.permissions import authorize
from django.http import HttpRequest
from registration.api.utils.current_user_utils import get_current_user_guid
from registration.constants import OPERATION_TAGS
from service.operation_service import OperationService
from service.operation_service_v2 import OperationServiceV2
from registration.decorators import handle_http_errors
from ..router import router
from registration.schema.v1 import (
    OperationCreateIn,
    OperationCreateOut,
    OperationPaginatedOut,
    OperationFilterSchema,
)
from registration.schema.v2.operation import OperationStatutoryDeclarationIn, OperationUpdateOut
from registration.schema.generic import Message
from ninja.responses import codes_4xx
from ninja import Query
from ninja.types import DictStrAny

##### GET #####


@router.get(
    "/operations",
    response={200: OperationPaginatedOut, codes_4xx: Message},
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
    response={201: OperationCreateOut, codes_4xx: Message},
    tags=OPERATION_TAGS,
    description="""Creates a new operation for the current user.
    It verifies that an operation with the given BCGHG ID does not already exist and associates the new operation with the current user's approved user-operator.""",
    auth=authorize("approved_industry_user"),
)
@handle_http_errors()
def create_operation(request: HttpRequest, payload: OperationCreateIn) -> Tuple[Literal[201], DictStrAny]:
    return 201, OperationService.create_operation(get_current_user_guid(request), payload)


##### PUT #####


@router.put(
    "/statutory-declarations",
    response={201: OperationUpdateOut, codes_4xx: Message},
    tags=OPERATION_TAGS,
    description="Creates or replaces a statutory declaration document for an Operation",
    auth=authorize("approved_industry_user"),
)
@handle_http_errors()
def create_or_replace_statutory_declarations(
    request: HttpRequest, payload: OperationStatutoryDeclarationIn
) -> Tuple[Literal[201], OperationUpdateOut]:
    return (
        201,
        OperationServiceV2.create_or_replace_statutory_declaration(
            user_guid=get_current_user_guid(request),
            payload=payload,
        ),
    )
