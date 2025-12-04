from typing import Literal, Tuple

from common.permissions import authorize
from django.http import HttpRequest
from reporting.constants import EMISSIONS_REPORT_TAGS
from reporting.schema.generic import Message
from service.reporting_year_service import ReportingYearService
from service.error_service.custom_codes_4xx import custom_codes_4xx
from reporting.schema.reporting_year import ReportingYearOut
from ..router import router
from reporting.models import ReportingYear


@router.get(
    "report/{report_id}/reporting-year",
    response={200: ReportingYearOut, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Returns json object with reporting year and due date for the report version id.""",
    auth=authorize("approved_authorized_roles"),
)
def get_report_reporting_year(request: HttpRequest, report_id: int) -> Tuple[Literal[200], ReportingYear]:
    return 200, ReportingYearService.get_report_reporting_year(report_id)
