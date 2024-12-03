from typing import List, Literal, Tuple
from uuid import UUID
from common.permissions import authorize
from django.http import HttpRequest
from common.api.utils import get_current_user_guid
from registration.decorators import handle_http_errors
from reporting.constants import EMISSIONS_REPORT_TAGS
from reporting.models.report_operation import ReportOperation
from reporting.models.report_product import ReportProduct
from reporting.schema.report_product import ProductionDataOut, ReportProductSchemaIn
from reporting.service.report_product_service import ReportProductService
from service.error_service.custom_codes_4xx import custom_codes_4xx
from reporting.schema.generic import Message
from .router import router


@router.post(
    "report-version/{report_version_id}/facilities/{facility_id}/production-data",
    response={200: int, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Saves the data for the production data page into multiple ReportProduct rows""",
    auth=authorize("approved_industry_user"),
)
@handle_http_errors()
def save_production_data(
    request: HttpRequest,
    report_version_id: int,
    facility_id: UUID,
    payload: List[ReportProductSchemaIn],
) -> Literal[200]:

    product_data_dicts = [item.dict() for item in payload]

    ReportProductService.save_production_data(
        report_version_id, facility_id, product_data_dicts, get_current_user_guid(request)
    )

    return 200


@router.get(
    "report-version/{report_version_id}/facilities/{facility_id}/production-data",
    response={200: ProductionDataOut, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Retrieves the data for the production data page from the multiple ReportProduct rows""",
    exclude_none=True,
    auth=authorize("approved_industry_user"),
)
@handle_http_errors()
def load_production_data(request: HttpRequest, report_version_id: int, facility_id: UUID) -> Tuple[Literal[200], dict]:

    report_products = (
        ReportProduct.objects.filter(facility_report__facility_id=facility_id).order_by("product_id").all()
    )
    allowed_products = ReportOperation.objects.get(report_version_id=report_version_id).regulated_products.all()

    return 200, {"report_products": report_products, "allowed_products": allowed_products}
