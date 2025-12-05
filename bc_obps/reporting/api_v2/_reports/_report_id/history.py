from typing import Literal, Optional, Tuple, List

from common.permissions import authorize
from django.http import HttpRequest
from registration.models.operation import QuerySet
from reporting.api_v2._reports._report_id.report_history_response_builder import ReportHistoryResponseBuilder
from reporting.api_v2._reports._report_id.report_reponse_builder import PaginatedReportResponseBuilder
from reporting.api_v2._reports._report_id.report_schema import ReportingReportResponseSchema
from reporting.api_v2.schema import ReportingResponseSchema
from reporting.constants import EMISSIONS_REPORT_TAGS
from ...router import router
from reporting.schema.report_history import ReportHistoryResponse
from ninja.pagination import paginate, PageNumberPagination
from registration.constants import PAGE_SIZE
from reporting.schema.generic import Message
from service.error_service.custom_codes_4xx import custom_codes_4xx
from reporting.service.report_history_dashboard_service import ReportingHistoryDashboardService


@router.get(
    "/report/{report_id}/history",
    response={200: ReportingReportResponseSchema, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Returns json object with current reporting year and due date.""",
    auth=authorize("approved_authorized_roles"),
)
def get_report_history(request: HttpRequest, report_id: int, **kwargs ) -> Tuple[Literal[200], dict]:
    report_versions = ReportingHistoryDashboardService.get_report_versions_for_report_history_dashboard(report_id)
    # response = PaginatedReportResponseBuilder(report_id, page, PAGE_SIZE).payload(report_versions).build()
    builder = ReportHistoryResponseBuilder(PAGE_SIZE, **kwargs)
    builder.report(report_id)
    response = builder.payload(report_versions).build()
    print('*********** response in history:', response)
    return 200, response
