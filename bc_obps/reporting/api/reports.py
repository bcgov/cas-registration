from typing import Literal, Tuple
from django.http import HttpRequest
from registration.decorators import handle_http_errors
from reporting.schema.generic import Message
from reporting.schema.report import StartReportIn
from ninja.responses import codes_4xx
from service.report_service import ReportService

from .router import router


@router.post(
    "/reports",
    response={200: int, codes_4xx: Message},
    tags=["Emissions Report"],
    description="""Starts a report for a given operation and reporting year, by creating the underlying data structures and
    pre-populating them with factility, operation and operator information. Returns the id of the report that was created.
    This endpoint only allows the creation of a report for an operation / operator to which the current user has access.""",
)
@handle_http_errors()
def start_report(request: HttpRequest, payload: StartReportIn) -> Tuple[Literal[201], int]:
    report = ReportService.create_report(payload.operation_id, payload.reporting_year)
    return 201, report.id
