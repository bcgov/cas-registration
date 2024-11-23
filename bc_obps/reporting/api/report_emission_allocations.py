from typing import Literal
from uuid import UUID
from django.db.models import F, Sum
from reporting.schema.report_product_emission_allocation import ReportProductEmissionAllocationSchemaIn
from registration.decorators import handle_http_errors
from service.error_service import custom_codes_4xx
from common.permissions import authorize
from django.http import HttpRequest
from reporting.schema.generic import Message
from common.api.utils.current_user_utils import get_current_user_guid
from reporting.service.report_emission_allocation_service import ReportEmissionAllocationService
from .router import router
from typing import List, Literal, Tuple
from reporting.constants import EMISSIONS_REPORT_TAGS
from reporting.models.report_operation import ReportOperation
from reporting.models.report_product import ReportProduct
from reporting.schema.report_product import ProductionDataOut
from reporting.models.report_product_emission_allocation import ReportProductEmissionAllocation

@router.get(
    "report-version/{report_version_id}/facilities/{facility_id}/allocate-emissions",
    response={200: ProductionDataOut, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Retrieves the data for """,
    exclude_none=True,
    auth=authorize("approved_industry_user"),
)
@handle_http_errors()
def get_emission_allocations(request: HttpRequest, report_version_id: int, facility_id: UUID) -> Tuple[Literal[200], dict]:

    # Filter records by facility_id through the related ReportProduct model
    report_emission_allocations = (
        ReportProductEmissionAllocation.objects.filter(report_product__facility_report__facility_id=facility_id)
        .select_related("report_product", "emission_category")  # Optimize queries by joining related models
        .order_by("report_product__id")
    )
    report_products = (
        ReportProduct.objects.filter(facility_report__facility_id=facility_id).order_by("product_id").all()
    )
    allowed_products = ReportOperation.objects.get(report_version_id=report_version_id).regulated_products.all()

    return 200, {"report_products": report_products, "allowed_products": allowed_products}


@router.post(
    "report-version/{report_version_id}/facilities/{facility_id}/allocate-emissions",
    response={200: int, custom_codes_4xx: Message},
    tags="",
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
