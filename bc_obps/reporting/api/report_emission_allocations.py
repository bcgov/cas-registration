from typing import Literal
from uuid import UUID
from common.api.utils.current_user_utils import get_current_user_guid
from reporting.schema.report_product_emission_allocation import (
    ReportProductEmissionAllocationsSchemaIn,
    ReportProductEmissionAllocationsSchemaOut,
)
from service.error_service.custom_codes_4xx import custom_codes_4xx
from django.http import HttpRequest
from reporting.schema.generic import Message
from .router import router
from reporting.constants import EMISSIONS_REPORT_TAGS
from reporting.service.report_emission_allocation_service import ReportEmissionAllocationService
from reporting.api.permissions import approved_industry_user_report_version_composite_auth


@router.get(
    "report-version/{version_id}/facilities/{facility_id}/allocate-emissions",
    response={200: ReportProductEmissionAllocationsSchemaOut, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Retrieves the data for product emissions allocations that have been saved for a facility""",
    exclude_none=True,
    auth=approved_industry_user_report_version_composite_auth,
)
def get_emission_allocations(
    request: HttpRequest, version_id: int, facility_id: UUID
) -> tuple[Literal[200], ReportProductEmissionAllocationsSchemaOut]:
    # Delegate the responsibility to the service
    response_data = ReportEmissionAllocationService.get_emission_allocation_data(version_id, facility_id)
    return 200, response_data


@router.post(
    "report-version/{version_id}/facilities/{facility_id}/allocate-emissions",
    response={200: int, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Saves the data for the allocation of emissions page into multiple ReportProductEmissionAllocation rows""",
    auth=approved_industry_user_report_version_composite_auth,
)
def save_emission_allocation_data(
    request: HttpRequest,
    version_id: int,
    facility_id: UUID,
    payload: ReportProductEmissionAllocationsSchemaIn,
) -> Literal[200]:

    ReportEmissionAllocationService.save_emission_allocation_data(
        version_id,
        facility_id,
        payload,
        get_current_user_guid(request),
    )

    return 200
