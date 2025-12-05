from typing import Literal, Tuple

from common.permissions import authorize
from django.http import HttpRequest

from reporting.api_v2._reports._report_id.report_reponse_builder import ReportInformationMixin
from reporting.api_v2._reports._report_id.report_schema import ReportingReportResponseSchema
from reporting.api_v2.response_builder import PaginatedResponseBuilder
from reporting.api_v2.router import router

from reporting.constants import EMISSIONS_REPORT_TAGS
from reporting.schema.report_history import ReportHistoryResponse
from reporting.schema.generic import Message
from service.error_service.custom_codes_4xx import custom_codes_4xx
from reporting.service.report_history_dashboard_service import ReportingHistoryDashboardService


class ReportHistoryResponseBuilder(PaginatedResponseBuilder, ReportInformationMixin):
    pass


@router.get(
    "/report/{report_id}/history",
    response={200: ReportingReportResponseSchema[ReportHistoryResponse], custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Returns json object with current reporting year and due date.""",
    auth=authorize("approved_authorized_roles"),
)
def get_report_history(request: HttpRequest, report_id: int) -> Tuple[Literal[200], dict]:
    report_versions = ReportingHistoryDashboardService.get_report_versions_for_report_history_dashboard(report_id)

    builder = ReportHistoryResponseBuilder(request)
    response = builder.report(report_id).payload(report_versions).build()

    print('*********** response in history:', response)
    return 200, response
