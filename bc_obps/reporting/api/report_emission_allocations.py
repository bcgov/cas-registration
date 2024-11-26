from typing import Literal
from uuid import UUID
from reporting.schema.report_product_emission_allocation import ReportProductEmissionAllocationSchemaIn
from registration.decorators import handle_http_errors
from service.error_service import custom_codes_4xx
from common.permissions import authorize
from django.http import HttpRequest
from reporting.schema.generic import Message
from common.api.utils.current_user_utils import get_current_user_guid
from reporting.service.report_emission_allocation_service import ReportEmissionAllocationService
from .router import router
from typing import List, Tuple
from reporting.constants import EMISSIONS_REPORT_TAGS
from reporting.models.report_product import ReportProduct
from reporting.schema.report_product import ProductionDataOut
from reporting.models.report_product_emission_allocation import ReportProductEmissionAllocation

from reporting.schema.report_product_emission_allocation import AllocationDataOut
from reporting.models import FacilityReport
from reporting.service.emission_category_service import EmissionCategoryService

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
   
    # Step 1: Get the report facility emission production by category
    facility_report_id = FacilityReport.objects.get(report_version_id=report_version_id, facility_id=facility_id).pk
    all_emmission_categories_totals = EmissionCategoryService.get_all_category_totals(facility_report_id)
    print(f"Step 1: emmission categories total - {all_emmission_categories_totals}")
    # Step 2: Get reporting products for this report version; facility
    # Step 3: Get reporting products values for this report version; facility


    # TEMP: Mock the response data
    report_product_emission_allocations= [
            {
            "emission_category": "flaring",
            "products": [
                { "product_id": 1, "product_name": "Product A", "product_emission": 500 },
                { "product_id": 2, "product_name": "Product B", "product_emission": 500 }
            ],
            "emission_total": 1000
            },
            {
            "emission_category": "fugitive",
            "products": [
                { "product_id": 1, "product_name": "Product A", "product_emission": 0 },
                { "product_id": 2, "product_name": "Product B", "product_emission": 0 }
            ],
            "emission_total": 300
            }
        ]
    return 200, {"report_product_emission_allocations": report_product_emission_allocations}

@router.get(
    "Xreport-version/{report_version_id}/facilities/{facility_id}/allocate-emissions",
    response={200: ProductionDataOut, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Retrieves the data for emissions allocations that have been saved for a facility""",
    exclude_none=True,
    auth=authorize("approved_industry_user"),
)
@handle_http_errors()
def Xget_emission_allocations(
    request: HttpRequest, report_version_id: int, facility_id: UUID
) -> Tuple[Literal[200], dict]:

    # Filter records by facility_id through the related ReportProduct model
    report_emission_allocations = (
        ReportProductEmissionAllocation.objects.filter(
            report_version_id=report_version_id, report_product__facility_report__facility_id=facility_id
        )
        .select_related("report_product", "emission_category")  # Optimize queries by joining related models
        .order_by("report_product__id")
    )
    report_emission_allocations_data = [
        {
            "product_id": allocation.report_product.product_id,
            "product_name": allocation.report_product.product.name,
            "emission_category_name": allocation.emission_category.name,
            "allocated_quantity": allocation.allocated_quantity,
        }
        for allocation in report_emission_allocations
    ]
    # allowed_products are all the products that are associated with the operation
    # allowed_products = ReportOperation.objects.get(report_version_id=report_version_id).regulated_products.all()

    # allowed_products are all products for which there is production data associated with this facility
    allowed_products = (
        ReportProduct.objects.filter(report_version_id=report_version_id, facility_report__facility_id=facility_id)
        .values("product_id", "product__name")
        .distinct()
    )

    return 200, {"report_emission_allocations": report_emission_allocations_data, "allowed_products": allowed_products}


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
