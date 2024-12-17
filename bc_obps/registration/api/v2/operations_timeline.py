from typing import List, Literal, Optional
from registration.schema.v2.operation_timeline import OperationTimelineFilterSchema, OperationTimelineListOut
from registration.constants import V2
from service.operation_service_v2 import OperationServiceV2
from common.permissions import authorize
from django.http import HttpRequest
from common.api.utils import get_current_user_guid
from registration.decorators import handle_http_errors
from ..router import router
from registration.schema.generic import Message
from service.error_service.custom_codes_4xx import custom_codes_4xx
from ninja import Query
from django.db.models import QuerySet
from ninja.pagination import paginate
from registration.utils import CustomPagination
from registration.models.operation_designated_operator_timeline import OperationDesignatedOperatorTimeline

##### GET #####


@router.get(
    "/operations-timeline",
    response={200: List[OperationTimelineListOut], custom_codes_4xx: Message},
    tags=V2,
    auth=authorize("approved_authorized_roles"),
)
@handle_http_errors()
@paginate(CustomPagination)
def list_operations_timeline(
    request: HttpRequest,
    filters: OperationTimelineFilterSchema = Query(...),
    sort_field: Optional[str] = "created_at",
    sort_order: Optional[Literal["desc", "asc"]] = "desc",
    paginate_result: bool = Query(True, description="Whether to paginate the results"),
) -> QuerySet[OperationDesignatedOperatorTimeline]:
    # NOTE: PageNumberPagination raises an error if we pass the response as a tuple (like 200, ...)
    return OperationServiceV2.list_operations_timeline(get_current_user_guid(request), sort_field, sort_order, filters)
