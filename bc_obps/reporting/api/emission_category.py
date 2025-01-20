from common.permissions import authorize
from reporting.service.emission_category_service import EmissionCategoryService
from reporting.models import FacilityReport
from service.error_service.custom_codes_4xx import custom_codes_4xx
from .router import router
from registration.decorators import handle_http_errors
from django.http import HttpRequest
from typing import Tuple, List
from uuid import UUID
from reporting.schema.generic import Message
from reporting.models import EmissionCategory
from reporting.schema.emission_category import EmissionCategorySchema, EmissionSummarySchemaOut


##### GET #####


@router.get(
    "/emission-category",
    response={200: List[EmissionCategorySchema], custom_codes_4xx: Message},
    auth=authorize("approved_industry_user"),
)
@handle_http_errors()
def get_emission_category(request: HttpRequest) -> Tuple[int, List[EmissionCategory]]:
    return 200, EmissionCategoryService.get_all_emission_categories()


@router.get(
    "/report-version/{version_id}/facility-report/{facility_id}/emission-summary",
    response={200: EmissionSummarySchemaOut, custom_codes_4xx: Message},
    url_name="get_emission_summary_totals",
    auth=authorize("approved_authorized_roles"),
)
@handle_http_errors()
def get_emission_summary_totals(request: HttpRequest, version_id: int, facility_id: UUID) -> Tuple[int, dict]:
    facility_report_id = FacilityReport.objects.get(report_version_id=version_id, facility_id=facility_id).pk
    return 200, EmissionCategoryService.get_facility_emission_summary_form_data(facility_report_id)


@router.get(
    "/report-version/{version_id}/emission-summary",
    response={200: EmissionSummarySchemaOut, custom_codes_4xx: Message},
    url_name="get_operation_emission_summary_totals",
    auth=authorize("approved_authorized_roles"),
)
@handle_http_errors()
def get_operation_emission_summary_totals(request: HttpRequest, version_id: int) -> Tuple[int, dict]:
    return 200, EmissionCategoryService.get_operation_emission_summary_form_data(version_id)
