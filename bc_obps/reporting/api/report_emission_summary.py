from common.permissions import authorize
from ninja import Status
from reporting.service.emission_category_service import EmissionCategoryService
from reporting.models import FacilityReport
from service.error_service.custom_codes_4xx import custom_codes_4xx
from .router import router
from django.http import HttpRequest
from typing import List
from uuid import UUID
from reporting.schema.generic import Message
from reporting.schema.emission_category import EmissionCategorySchema, EmissionSummarySchemaOut
from reporting.api.permissions import approved_authorized_roles_report_version_composite_auth
from decimal import Decimal


##### GET #####


@router.get(
    "/emission-category",
    response={200: List[EmissionCategorySchema], custom_codes_4xx: Message},
    auth=authorize("approved_industry_user"),
)
def get_emission_category(request: HttpRequest) -> Status:
    return Status(200, EmissionCategoryService.get_all_emission_categories())


@router.get(
    "/report-version/{version_id}/facility-report/{facility_id}/emission-summary",
    response={200: EmissionSummarySchemaOut, custom_codes_4xx: Message},
    url_name="get_emission_summary_totals",
    auth=approved_authorized_roles_report_version_composite_auth,
)
def get_emission_summary_totals(request: HttpRequest, version_id: int, facility_id: UUID) -> Status:
    facility_report_id = FacilityReport.objects.get(report_version_id=version_id, facility_id=facility_id).pk
    return Status(200, EmissionCategoryService.get_facility_emission_summary_form_data(facility_report_id))


@router.get(
    "/report-version/{version_id}/emission-summary",
    response={200: EmissionSummarySchemaOut, custom_codes_4xx: Message},
    url_name="get_operation_emission_summary_totals",
    auth=approved_authorized_roles_report_version_composite_auth,
)
def get_operation_emission_summary_totals(request: HttpRequest, version_id: int) -> Status:
    return Status(200, EmissionCategoryService.get_operation_emission_summary_form_data(version_id))


# Endpoint is for handling a pulp & paper edge case when industrial emissions overlap with excluded emissions
@router.get(
    "/report-version/{version_id}/facility-report/{facility_id}/overlapping_industrial_process_emissions",
    response={200: Decimal, custom_codes_4xx: Message},
    url_name="get_overlapping_industrial_process_emissions",
    auth=authorize("approved_authorized_roles"),
)
def get_overlapping_industrial_process_emissions(request: HttpRequest, version_id: int, facility_id: UUID) -> Status:
    facility_report_id = FacilityReport.objects.get(report_version_id=version_id, facility_id=facility_id).pk
    return Status(
        200, EmissionCategoryService.get_industrial_process_excluded_biomass_overlap_by_facility(facility_report_id)
    )
