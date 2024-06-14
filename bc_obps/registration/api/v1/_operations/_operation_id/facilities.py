from uuid import UUID
from registration.api.router import router
from typing import List, Literal, Optional
from django.db.models import QuerySet
from django.http import HttpRequest
from registration.constants import FACILITY_TAGS
from registration.models.facility import Facility
from registration.models.user import User
from registration.schema.v1.facility import FacilityFilterSchema, FacilityListOut
from service.facility_service import FacilityService
from registration.decorators import handle_http_errors
from ninja.pagination import paginate, PageNumberPagination
from registration.schema.generic import Message
from ninja.responses import codes_4xx
from ninja import Query


@router.get(
    "/operations/{operation_id}/facilities",
    response={200: List[FacilityListOut], codes_4xx: Message},
    tags=FACILITY_TAGS,
    description="""Retrieves a paginated list of facilities based on the provided filters.
    The endpoint allows authorized users to view and sort facilities associated to an operation filtered by various criteria such as facility name, type, and bcghg_id.""",
)
# @authorize(AppRole.get_all_authorized_app_roles(), UserOperator.get_all_industry_user_operator_roles())
@handle_http_errors()
@paginate(PageNumberPagination)
def list_facilities(
    request: HttpRequest,
    operation_id: UUID,
    filters: FacilityFilterSchema = Query(...),
    sort_field: Optional[str] = "created_at",
    sort_order: Optional[Literal["desc", "asc"]] = "desc",
) -> QuerySet[Facility]:
    user = User.objects.get(pk="4da70f32-65fd-4137-87c1-111f2daba3dd")  # TODO: TEMP
    # NOTE: PageNumberPagination raises an error if we pass the response as a tuple (like 200, ...)
    return FacilityService.list_facilities(user.user_guid, operation_id, sort_field, sort_order, filters)
