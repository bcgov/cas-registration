from typing import Literal, Tuple

from django.http import HttpRequest

from registration.decorators import handle_http_errors
from reporting.schema.generic import Message
from service.error_service.custom_codes_4xx import custom_codes_4xx
from .router import router
from ..schema.report_new_entrant import ReportNewEntrantDataOut, ReportNewEntrantSchemaIn
from ..service.report_new_entrant_service import ReportNewEntrantService


@router.get(
    "report-version/{report_version_id}/new-entrant-data",
    response={200: ReportNewEntrantDataOut, custom_codes_4xx: Message},
    description="""Retrieves the data for the new entrant data page, including selected products and emissions.""",
    exclude_none=True,
    # auth=authorize("approved_industry_user"),
)
@handle_http_errors()
def get_new_entrant_data(request: HttpRequest, report_version_id: int) -> Tuple[int, dict]:
    report_new_entrant = ReportNewEntrantService.get_new_entrant_data(report_version_id=report_version_id)
    return 200, report_new_entrant


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
) -> Literal[200]:
    ReportNewEntrantService.save_new_entrant_data(report_version_id, payload)

    return 200
