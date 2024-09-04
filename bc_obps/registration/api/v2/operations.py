from typing import List, Literal, Optional
from registration.constants import V2
from registration.models.operation import Operation
from registration.schema.v2.operation import OperationFilterSchema, OperationListOut
from service.operation_service_v2 import OperationServiceV2
from common.permissions import authorize
from django.http import HttpRequest
from registration.api.utils.current_user_utils import get_current_user_guid
from registration.decorators import handle_http_errors
from ..router import router
from registration.schema.generic import Message
from service.error_service.custom_codes_4xx import custom_codes_4xx
from ninja import Query
from django.db.models import QuerySet
from ninja.pagination import paginate
from registration.utils import CustomPagination

##### GET #####


@router.get(
    "/v2/operations",
    response={200: List[OperationListOut], custom_codes_4xx: Message},
    tags=V2,
    auth=authorize("approved_authorized_roles"),
)
@handle_http_errors()
@paginate(CustomPagination)
def list_operations_v2(
    request: HttpRequest,
    filters: OperationFilterSchema = Query(...),
    sort_field: Optional[str] = "created_at",
    sort_order: Optional[Literal["desc", "asc"]] = "desc",
    paginate_result: bool = Query(True, description="Whether to paginate the results"),
) -> QuerySet[Operation]:
    # NOTE: PageNumberPagination raises an error if we pass the response as a tuple (like 200, ...)
    return OperationServiceV2.list_operations(get_current_user_guid(request), sort_field, sort_order, filters)
