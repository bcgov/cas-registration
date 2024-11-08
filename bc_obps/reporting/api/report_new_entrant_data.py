from typing import Literal, Tuple
from django.http import HttpRequest
from registration.decorators import handle_http_errors
from reporting.schema.generic import Message
from service.error_service.custom_codes_4xx import custom_codes_4xx
from service.report_service import ReportService
from .router import router
from ..schema.report_new_entrant import ReportNewEntrantSchemaIn, ReportNewEntrantDataOut
from ..service.report_new_entrant_service import ReportNewEntrantService


@router.get(
    "report-version/{report_version_id}/new-entrant-data",
    response={200: ReportNewEntrantDataOut},
    tags=["Emissions Report"],
)
def get_new_entrant_data(request: HttpRequest, report_version_id: int) -> Tuple[Literal[200], dict]:
    report_new_entrant = ReportNewEntrantService.get_new_entrant_data(report_version_id) or {}
    regulated_products = ReportService.get_regulated_products_by_version_id(report_version_id) or {}

    response_data = {
        "regulated_products": regulated_products,
        "report_new_entrant_data": report_new_entrant,
    }
    print('response_data', response_data)

    return 200, response_data


@router.post(
    "report-version/{report_version_id}/new-entrant-data",
    response={200: int, custom_codes_4xx: Message},
    tags=["Emissions Report"],
    description="Saves the data for the new entrant report",
    # auth=authorize("approved_industry_user"),
)
@handle_http_errors()
def save_new_entrant_data(
    request: HttpRequest,
    report_version_id: int,
    payload: ReportNewEntrantSchemaIn,
) -> int:
    ReportNewEntrantService.save_new_entrant_data(report_version_id, payload)

    return 200
