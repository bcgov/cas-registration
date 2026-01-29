from typing import Literal, Tuple
from uuid import UUID
from django.http import HttpRequest
from .form_response_builder import FormResponseBuilder
from .form_schema import ReportingFormSchema
from reporting.constants import EMISSIONS_REPORT_TAGS
from reporting.models.report_product import ReportProduct
from reporting.models.report_operation import ReportOperation
from reporting.schema.generic import Message
from reporting.schema.report_product import ProductionDataOut
from reporting.service.report_product_service import ReportProductService
from service.error_service.custom_codes_4xx import custom_codes_4xx
from reporting.api.permissions import approved_industry_user_report_version_composite_auth

from ..router import router


@router.get(
    "report-version/{version_id}/facilities/{facility_id}/forms/production-data",
    response={200: ReportingFormSchema[ProductionDataOut], custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Retrieves the data for the production data page from the multiple ReportProduct rows""",
    exclude_none=True,
    auth=approved_industry_user_report_version_composite_auth,
)
def get_production_form_data(request: HttpRequest, version_id: int, facility_id: UUID) -> Tuple[Literal[200], dict]:

    report_products = (
        ReportProduct.objects.filter(
            facility_report__facility_id=facility_id, report_version_id=version_id, product__is_regulated=True
        )
        .order_by("product_id")
        .all()
    )
    allowed_products = ReportProductService.get_allowed_products(version_id)
    payload = {"report_products": report_products, "allowed_products": allowed_products}

    report_operation = ReportOperation.objects.get(report_version_id=version_id)
    operation_opted_out_final_reporting_year = report_operation.operation_opted_out_final_reporting_year

    response = (
        FormResponseBuilder(version_id)
        .payload(payload)
        .facility_data(facility_id)
        .report_operation_opt_out_status(operation_opted_out_final_reporting_year)
        .build()
    )

    return 200, response
