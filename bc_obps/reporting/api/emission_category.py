from common.permissions import authorize
from reporting.service.emission_category_service import EmissionCategoryService
from reporting.models import FacilityReport
from .router import router
from registration.decorators import handle_http_errors
from django.http import HttpRequest
from typing import Tuple, List
from uuid import UUID
from decimal import Decimal
from common.permissions import authorize

from reporting.schema.generic import Message
from ninja.responses import codes_4xx, codes_5xx

from ..models import EmissionCategory
from ..schema.emission_category import EmissionCategorySchema
from ..service.emission_category_service import EmissionCategoryService


##### GET #####


@router.get(
    "/emission-category",
    response={200: List[EmissionCategorySchema], codes_4xx: Message, codes_5xx: Message},
    auth=authorize("approved_industry_user"),
)
@handle_http_errors()
def get_emission_category(request: HttpRequest) -> tuple[int, list[EmissionCategory]]:
    return 200, EmissionCategoryService.get_all_emission_categories()
    "/report-version/{version_id}/facility-report/{facility_id}/emission-summary",
    response={200: Dict[str, Decimal | int], codes_4xx: Message, codes_5xx: Message},
    url_name="get_emission_summary_totals",
    auth=authorize("approved_authorized_roles"),
)
@handle_http_errors()
def get_emission_summary_totals(
    request: HttpRequest, version_id: int, facility_id: UUID
) -> Tuple[int, Dict[str, Decimal | int]]:
    facility_report_id = FacilityReport.objects.get(report_version_id=version_id, facility_id=facility_id).pk
    return 200, EmissionCategoryService.get_all_category_totals(facility_report_id)
