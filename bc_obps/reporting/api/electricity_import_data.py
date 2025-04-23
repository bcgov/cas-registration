from typing import Literal, Tuple
from uuid import UUID
from django.http import HttpRequest
from reporting.constants import EMISSIONS_REPORT_TAGS
from reporting.models.report_operation import ReportOperation
from reporting.models.report_product import ReportProduct
from reporting.schema.report_product import ProductionDataOut
from service.error_service.custom_codes_4xx import custom_codes_4xx
from reporting.schema.generic import Message
from .router import router
from reporting.api.permissions import approved_industry_user_report_version_composite_auth
from ..schema.electricity_import_data import ElectricityImportDataIn
from ..service.electricity_import_data_service import ElectricityImportDataService


@router.post(
    "report-version/{version_id}/electricity-import-data",
    response={200: int, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Saves the data for the production data page into multiple ReportProduct rows""",
    auth=approved_industry_user_report_version_composite_auth,
)
def save_electricity_import_data(
    request: HttpRequest,
    version_id: int,
    payload: ElectricityImportDataIn,
) -> Literal[200]:
    print('payload', payload)
    ElectricityImportDataService.save_electricity_import_data(version_id, payload)
    return 200


@router.get(
    "report-version/{version_id}/electricity-import-data",
    response={200: ProductionDataOut, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Retrieves the data for the production data page from the multiple ReportProduct rows""",
    exclude_none=True,
    auth=approved_industry_user_report_version_composite_auth,
)
def load_production_data(request: HttpRequest, version_id: int, facility_id: UUID) -> Tuple[Literal[200], dict]:
    report_products = (
        ReportProduct.objects.filter(
            facility_report__facility_id=facility_id, report_version_id=version_id, product__is_regulated=True
        )
        .order_by("product_id")
        .all()
    )
    allowed_products = ReportOperation.objects.get(report_version_id=version_id).regulated_products.exclude(
        is_regulated=False
    )

    return 200, {"report_products": report_products, "allowed_products": allowed_products}
