from uuid import UUID
from registration.models.facility_designated_operation_timeline import FacilityDesignatedOperationTimeline
from registration.utils import CustomPagination
from service.facility_designated_operation_timeline_service import FacilityDesignatedOperationTimelineService
from registration.schema import (
    FacilityDesignatedOperationTimelineFilterSchema,
    FacilityDesignatedOperationTimelineOut,
    Message
)
from common.permissions import authorize
from registration.api.router import router
from typing import List, Literal, Optional
from django.db.models import QuerySet
from django.http import HttpRequest
from common.api.utils import get_current_user_guid
from registration.constants import FACILITY_TAGS
from ninja.pagination import paginate
from service.error_service.custom_codes_4xx import custom_codes_4xx
from ninja import Query


@router.get(
    "/operations/{uuid:operation_id}/facilities",
    response={200: List[FacilityDesignatedOperationTimelineOut], custom_codes_4xx: Message},
    tags=FACILITY_TAGS,
    description="""Retrieves a paginated list of facilities based on the provided filters.
    The endpoint allows authorized users to view and sort facilities associated to an operation filtered by various criteria such as facility name, type, and bcghg_id.""",
    auth=authorize("approved_authorized_roles"),
)
@paginate(CustomPagination)
def list_facilities_by_operation_id(
    request: HttpRequest,
    operation_id: UUID,
    filters: FacilityDesignatedOperationTimelineFilterSchema = Query(...),
    sort_field: Optional[str] = "facility__created_at",
    sort_order: Optional[Literal["desc", "asc"]] = "desc",
    paginate_result: bool = Query(True, description="Whether to paginate the results"),
) -> QuerySet[FacilityDesignatedOperationTimeline]:
    # NOTE: PageNumberPagination raises an error if we pass the response as a tuple (like 200, ...)
    return FacilityDesignatedOperationTimelineService.list_timeline_by_operation_id(
        get_current_user_guid(request), operation_id, sort_field, sort_order, filters
    )
