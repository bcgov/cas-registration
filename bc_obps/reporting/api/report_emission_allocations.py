from typing import Literal
from uuid import UUID
from reporting.schema.report_product_emission_allocation import ReportProductEmissionAllocationSchemaIn, ReportProductEmissionAllocationsSchemaOut
from registration.decorators import handle_http_errors
from service.error_service.custom_codes_4xx import custom_codes_4xx
from common.permissions import authorize
from django.http import HttpRequest
from reporting.schema.generic import Message
from common.api.utils.current_user_utils import get_current_user_guid
from .router import router
from typing import List, Tuple
from reporting.constants import EMISSIONS_REPORT_TAGS
from reporting.service.report_emission_allocation_service import ReportEmissionAllocationService

# MOCKING THE GET API
@router.get(
    "report-version/{report_version_id}/facilities/{facility_id}/allocate-emissions",
    response={200: dict, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Retrieves the data for product emissions allocations that have been saved for a facility""",
    exclude_none=True,
    auth=authorize("approved_industry_user"),
)
@handle_http_errors()
def get_emission_allocations(
    request: HttpRequest, report_version_id: int, facility_id: UUID
) -> Tuple[Literal[200], dict]:
    # TEMP: Mock the response data
    temp_response = {
        "report_product_emission_allocations": [
            {
                "emission_category": "Flaring emissions",
                "products": [
                    {
                        "product_id": 1,
                        "product_name": "BC-specific refinery complexity throughput",
                        "allocated_quantity": 200.0,
                    },
                    {
                        "product_id": 29,
                        "product_name": "Sugar: solid",
                        "allocated_quantity": 100.0,
                    },
                ],
                "emission_total": 300,
                "category_type": "basic",
            },
            # Additional categories go here...
        ],
        "facility_total_emissions": 300.0,
        "report_product_emission_allocation_totals": [
            {
                "product_id": 1,
                "product_name": "BC-specific refinery complexity throughput",
                "allocated_quantity": 200.0,
            },
            {
                "product_id": 29,
                "product_name": "Sugar: solid",
                "allocated_quantity": 100.0,
            },
        ],
        "methodology": "Other",
        "other_methodology_description": "test",
    }
    return 200, temp_response


# TODO: FIX GET API
@router.get(
    "Xreport-version/{report_version_id}/facilities/{facility_id}/allocate-emissions",
    response={200: dict, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Retrieves the data for product emissions allocations that have been saved for a facility""",
    exclude_none=True,
    auth=authorize("approved_industry_user"),
)
@handle_http_errors()
def Xget_emission_allocations(
    request: HttpRequest, report_version_id: int, facility_id: UUID
) -> Tuple[Literal[200], ReportProductEmissionAllocationsSchemaOut]:
    # Delegate the responsibility to the service
    response_data = ReportEmissionAllocationService.get_emission_allocation_data(report_version_id, facility_id)
    return 200, response_data

@router.post(
    "report-version/{report_version_id}/facilities/{facility_id}/allocate-emissions",
    response={200: int, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Saves the data for the allocation of emissions page into multiple ReportProductEmissionAllocation rows""",
    auth=authorize("approved_industry_user"),
)
@handle_http_errors()
def save_emission_allocation_data(
    request: HttpRequest,
    report_version_id: int,
    facility_id: UUID,
    payload: List[ReportProductEmissionAllocationSchemaIn],
) -> Literal[200]:

    emission_allocation_data_dicts = [item.dict() for item in payload]

    ReportEmissionAllocationService.save_emission_allocation_data(
        report_version_id, facility_id, emission_allocation_data_dicts, get_current_user_guid(request)
    )

    return 200