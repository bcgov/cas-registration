from typing import Iterable, List
from uuid import UUID
from django.http import HttpRequest
from ninja import Query
from registration.api.utils.current_user_utils import get_current_user, get_current_user_guid
from registration.constants import PAGE_SIZE
from registration.decorators import handle_http_errors
from registration.models.operation import Operation
from reporting.models.report import Report
from reporting.schema.generic import Message
from reporting.constants import DASHBOARD_TAGS
from reporting.schema.operation import ReportingDashboardOperationFilterSchema, ReportingDashboardOperationOut
from reporting.service.reporting_dashboard_service import ReportingDashboardService
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

    user_guid: UUID = get_current_user_guid(request)
    reporting_year: int = ReportingYearService.get_current_reporting_year().reporting_year
    return ReportingDashboardService.get_operations_for_reporting_dashboard(user_guid, reporting_year)
