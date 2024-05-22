from typing import Literal, Tuple
from django.http import HttpRequest
from registration.api.utils.current_user_utils import get_current_user_guid
from registration.constants import OPERATION_TAGS
from service.operation_service import OperationService
from registration.decorators import authorize, handle_http_errors
from ..router import router


from registration.models import (
    AppRole,
    UserOperator,
)
from registration.schema.v1 import (
    OperationCreateIn,
    OperationPaginatedOut,
    OperationCreateOut,
    OperationFilterSchema,
)
from registration.schema.generic import Message
from ninja.responses import codes_4xx
from ninja import Query
from ninja.types import DictStrAny

##### GET #####


@router.get(
    "/operations",
    response={200: OperationPaginatedOut, codes_4xx: Message},
    url_name="list_operations",
    tags=OPERATION_TAGS,
)
@authorize(AppRole.get_all_authorized_app_roles(), UserOperator.get_all_industry_user_operator_roles())
@handle_http_errors()
def list_operations(
    request: HttpRequest, filters: OperationFilterSchema = Query(...)
) -> Tuple[Literal[200], DictStrAny]:
    return 200, OperationService.list_operations(get_current_user_guid(request), filters)


##### POST #####


@router.post(
    "/operations",
    response={201: OperationCreateOut, codes_4xx: Message},
    url_name="create_operation",
    tags=OPERATION_TAGS,
)
@authorize(["industry_user"], UserOperator.get_all_industry_user_operator_roles())
@handle_http_errors()
def create_operation(request: HttpRequest, payload: OperationCreateIn) -> Tuple[Literal[201], DictStrAny]:
    return 201, OperationService.create_operation(get_current_user_guid(request), payload)
