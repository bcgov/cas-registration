from typing import List, Literal, Tuple
from uuid import UUID
from django.http import HttpRequest
from ninja import Schema
from .form_response_builder import FormResponseBuilder
from .form_schema import ReportingFormSchema
from reporting.constants import EMISSIONS_REPORT_TAGS
from reporting.models.report_product import ReportProduct
from reporting.models.report_version import ReportVersion
from reporting.schema.generic import Message
from registration.schema.regulated_products import RegulatedProductSchema
from reporting.schema.report_product import ReportProductSchemaOut
from reporting.service.report_product_service import ReportProductService
from service.error_service.custom_codes_4xx import custom_codes_4xx
from reporting.api.permissions import approved_industry_user_report_version_composite_auth
from reporting.utils import is_operation_opted_out

from ..router import router


#  API response schema
class ProductionDataFormPayloadSchema(Schema):
    report_products: List[ReportProductSchemaOut]
    allowed_products: List[RegulatedProductSchema]
    is_operation_opted_out: bool


@router.get(
    "report-version/{version_id}/facilities/{facility_id}/forms/production-data",
    response={200: ReportingFormSchema[ProductionDataFormPayloadSchema], custom_codes_4xx: Message},
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
    report_version = ReportVersion.objects.select_related(
        "report",
        "report_operation",
    ).get(id=version_id)

    payload = {
        "report_products": report_products,
        "allowed_products": allowed_products,
        "is_operation_opted_out": is_operation_opted_out(
            reporting_year=report_version.report.reporting_year.reporting_year,
            registration_purpose=report_version.report_operation.registration_purpose,
            operation_opted_out_final_reporting_year=(
                report_version.report_operation.operation_opted_out_final_reporting_year
            ),
        ),
    }
    response = FormResponseBuilder(version_id).payload(payload).facility_data(facility_id).build()
    return 200, response
