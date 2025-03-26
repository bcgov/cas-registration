from typing import Tuple, List

from django.db.models import QuerySet

from common.permissions import authorize
from registration.models import Operation
from reporting.constants import EMISSIONS_REPORT_TAGS
from .router import router
from ..schema.report_history import ReportHistoryResponse, ReportOperationResponse
from ..models import Report, ReportVersion
from django.http import HttpRequest
from ninja.pagination import paginate, PageNumberPagination
from registration.constants import PAGE_SIZE
from reporting.schema.generic import Message
from service.error_service.custom_codes_4xx import custom_codes_4xx
from ..service.report_history_dashboard_service import ReportingHistoryDashboardService


@router.get(
    "/report-history/{report_id}",
    response={200: List[ReportHistoryResponse], custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Returns json object with current reporting year and due date.""",
    auth=authorize("approved_industry_user"),
)
@paginate(PageNumberPagination, page_size=PAGE_SIZE)
def get_report_history(request: HttpRequest, report_id: int) -> QuerySet[ReportVersion]:
    report_versions = ReportingHistoryDashboardService.get_report_versions_for_report_history_dashboard(report_id)
    return report_versions


@router.get(
    "/reports/{report_id}/operation",
    response={200: ReportOperationResponse, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Returns the operation details given report.""",
    auth=authorize("approved_industry_user"),
)
def get_report_operation(request: HttpRequest, report_id: int) -> Tuple[int, Operation]:
    operation = Report.objects.select_related('operation').get(id=report_id).operation
    return 200, operation
