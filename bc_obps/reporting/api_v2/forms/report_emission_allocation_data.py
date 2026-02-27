from decimal import Decimal
from typing import List, Literal, Tuple
from uuid import UUID

from django.http import HttpRequest
from ninja import Schema
from registration.models.activity import Activity
from reporting.api_v2.forms.form_response_builder import FormResponseBuilder
from reporting.api_v2.forms.form_schema import ReportingFormSchema
from reporting.constants import EMISSIONS_REPORT_TAGS
from reporting.schema.activity import FacilityReportActivityDataOut
from reporting.schema.generic import Message
from reporting.schema.report_emission_allocation import ReportEmissionAllocationSchemaOut
from reporting.service.emission_category_service import EmissionCategoryService
from reporting.service.report_emission_allocation_service import ReportEmissionAllocationService
from service.error_service.custom_codes_4xx import custom_codes_4xx
from reporting.api.permissions import approved_industry_user_report_version_composite_auth
from service.facility_report_service import FacilityReportService

from ..router import router


class EmissionAllocationFormPayloadSchema(Schema):
    emission_allocation_data: ReportEmissionAllocationSchemaOut
    ordered_activities: List[FacilityReportActivityDataOut]
    overlapping_industrial_process_emissions: Decimal


@router.get(
    "report-version/{version_id}/facilities/{facility_id}/forms/emission-allocation-data",
    response={200: ReportingFormSchema[EmissionAllocationFormPayloadSchema], custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Retrieves the data for product emissions allocations that have been saved for a facility""",
    exclude_none=True,
    auth=approved_industry_user_report_version_composite_auth,
)
def get_emission_allocation_form_data(
    request: HttpRequest, version_id: int, facility_id: UUID
) -> Tuple[Literal[200], dict]:
    emission_allocation_data = ReportEmissionAllocationService.get_emission_allocation_data(version_id, facility_id)

    facility_report_activities = FacilityReportService.get_activity_ids_for_facility(version_id, facility_id)
    ordered_activities = Activity.objects.filter(pk__in=facility_report_activities).order_by("weight", "name")

    overlapping_industrial_process_emissions = (
        EmissionCategoryService.get_industrial_process_excluded_biomass_overlap_by_facility(
            FacilityReportService.get_facility_report_by_version_and_id(version_id, facility_id).id
        )
    )

    payload = {
        "emission_allocation_data": emission_allocation_data,
        "ordered_activities": ordered_activities,
        "overlapping_industrial_process_emissions": overlapping_industrial_process_emissions,
    }

    response = FormResponseBuilder(version_id).payload(payload).facility_data(facility_id).operation_data().build()

    return 200, response
