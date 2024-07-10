from typing import Iterable, List
from django.http import HttpRequest
from ninja import Query
from registration.api.utils.current_user_utils import get_current_user_guid
from registration.constants import PAGE_SIZE
from registration.decorators import handle_http_errors
from registration.models.operation import Operation
from reporting.models.report import Report
from reporting.schema.generic import Message
from reporting.constants import DASHBOARD_TAGS
from reporting.schema.operation import ReportingDashboardOperationFilterSchema, ReportingDashboardOperationOut
from reporting.tests.utils.bakers import report_baker, report_version_baker
from service.data_access_service.operation_service import OperationDataAccessService
from service.data_access_service.user_service import UserDataAccessService
from service.reporting_year_service import ReportingYearService
from .router import router
from ninja.responses import codes_4xx
from ninja.pagination import paginate, PageNumberPagination

from django.db.models import OuterRef, Max


@router.get(
    "/operations",
    response={200: List[ReportingDashboardOperationOut], codes_4xx: Message},
    tags=DASHBOARD_TAGS,
    description="""Returns a list of operators for the current reporting year, for the current user. Populates
    the main reporting dashboard page.""",
)
@handle_http_errors()
@paginate(PageNumberPagination, page_size=PAGE_SIZE)
def get_dashboard_operations_list(
    request: HttpRequest, filters: ReportingDashboardOperationFilterSchema = Query(...)
) -> Iterable[ReportingDashboardOperationOut]:
    user_guid = get_current_user_guid(request)
    user = UserDataAccessService.get_by_guid(user_guid)
    reporting_year = ReportingYearService.get_current_reporting_year()

    op2 = Operation.objects.get(name='Operation 2')
    if not Report.objects.filter(operation=op2).exists():
        r = report_baker(operation=op2, operator=op2.operator, reporting_year=reporting_year)
        report_version_baker(report=r)

    report_subq = Report.objects.filter(
        operation=OuterRef('pk'),
        reporting_year__reporting_year=reporting_year.reporting_year,
    ).annotate(latest_version_id=Max('report_versions__id'))

    val = OperationDataAccessService.get_all_operations_for_user(user).annotate(
        report_id=report_subq.values('pk'),
        report_version_id=report_subq.values('latest_version_id'),
        report_status=report_subq.values('report_versions__status'),
    )

    return val
