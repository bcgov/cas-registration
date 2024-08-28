from typing import Literal, Tuple
from registration.schema.v2.operator import OperatorFilterSchema, OperatorPaginatedOut
from service.operator_service_v2 import OperatorServiceV2
from common.permissions import authorize
from django.http import HttpRequest
from registration.decorators import handle_http_errors
from ..router import router
from registration.schema.generic import Message
from ninja.responses import codes_4xx
from ninja import Query
from ninja.types import DictStrAny

##### GET #####


@router.get(
    "/v2/operators",
    response={200: OperatorPaginatedOut, codes_4xx: Message},
    tags=["V2"],
    auth=authorize("approved_authorized_roles"),
)
@handle_http_errors()
def list_operators_v2(
    request: HttpRequest, filters: OperatorFilterSchema = Query(...)
) -> Tuple[Literal[200], DictStrAny]:
    return 200, OperatorServiceV2.list_operators(filters)
