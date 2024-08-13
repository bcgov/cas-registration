from typing import Literal, Tuple
from registration.schema.v2.operation import OperationFilterSchema, OperationPaginatedOut
from service.operation_service_v2 import OperationServiceV2
from common.permissions import authorize
from django.http import HttpRequest
from registration.api.utils.current_user_utils import get_current_user_guid
from registration.decorators import handle_http_errors
from ..router import router
from registration.schema.generic import Message
from ninja.responses import codes_4xx
from ninja import Query
from ninja.types import DictStrAny

##### GET #####


@router.get(
    "/v2/operations",
    response={200: OperationPaginatedOut, codes_4xx: Message},
    tags=["V2"],
    auth=authorize("approved_authorized_roles"),
)
@handle_http_errors()
def list_operations_v2(
    request: HttpRequest, filters: OperationFilterSchema = Query(...)
) -> Tuple[Literal[200], DictStrAny]:

    return 200, OperationServiceV2.list_operations(get_current_user_guid(request), filters)
