from typing import Literal, Tuple, List

from common.permissions import authorize
from django.http import HttpRequest
from reporting.api_v2._reports._report_id.report_reponse_builder import ReportResponseBuilder
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
    response={200: ReportingResponseSchema[List[ReportHistoryResponse]], custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Returns json object with current reporting year and due date.""",
    auth=authorize("approved_authorized_roles"),
)
@paginate(PageNumberPagination, page_size=PAGE_SIZE)
def get_report_history(request: HttpRequest, report_id: int) -> Tuple[Literal[200], dict]:
    report_versions = ReportingHistoryDashboardService.get_report_versions_for_report_history_dashboard(report_id)
    payload = {"report_versions": report_versions}
    response = ReportResponseBuilder(report_id).payload(payload).build()
    print('************* response in api:', response)
    return 200, response
