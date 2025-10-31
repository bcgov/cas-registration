from typing import Literal, Optional, Tuple
from uuid import UUID
from django.http import HttpRequest
from reporting.api.v2 import router
from reporting.api.v2.base_schema import ReportingBaseSchema
from reporting.constants import EMISSIONS_REPORT_TAGS
from reporting.models.report_product import ReportProduct
from reporting.schema.generic import Message
from reporting.schema.report_product import ProductionDataOut
from reporting.service.report_product_service import ReportProductService
from service.error_service import custom_codes_4xx
from reporting.api.permissions import approved_industry_user_report_version_composite_auth


class TestSchema(ReportingBaseSchema[ProductionDataOut]):
    some_stuff: Optional[int] = 0


@router.get(
    "report-version/{version_id}/facilities/{facility_id}/forms/production-data",
    response={200: TestSchema, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Retrieves the data for the production data page from the multiple ReportProduct rows""",
    exclude_none=True,
    auth=approved_industry_user_report_version_composite_auth,
)
def get_production_data(request: HttpRequest, version_id: int, facility_id: UUID) -> Tuple[Literal[200], dict]:

    report_products = (
        ReportProduct.objects.filter(
            facility_report__facility_id=facility_id, report_version_id=version_id, product__is_regulated=True
        )
        .order_by("product_id")
        .all()
    )
    allowed_products = ReportProductService.get_allowed_products(version_id)

    return 200, {"report_products": report_products, "allowed_products": allowed_products}
