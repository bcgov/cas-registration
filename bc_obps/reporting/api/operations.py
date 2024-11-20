from typing import List
from uuid import UUID
from common.permissions import authorize
from django.http import HttpRequest
from django.db.models import QuerySet
from ninja.pagination import paginate, PageNumberPagination

from common.api.utils import get_current_user_guid
from registration.constants import PAGE_SIZE
from registration.decorators import handle_http_errors
from registration.models.operation import Operation
from reporting.schema.generic import Message
from reporting.constants import DASHBOARD_TAGS
from reporting.schema.operation import ReportingDashboardOperationOut
from reporting.service.reporting_dashboard_service import ReportingDashboardService
from service.error_service.custom_codes_4xx import custom_codes_4xx
from service.reporting_year_service import ReportingYearService


from .router import router


@router.get(
    "/operations",
    response={200: List[ReportingDashboardOperationOut], custom_codes_4xx: Message},
    tags=DASHBOARD_TAGS,
    description="""Returns a list of operators for the current reporting year, for the current user. Populates
    the main reporting dashboard page.""",
    auth=authorize("approved_authorized_roles"),
)
@handle_http_errors()
@paginate(PageNumberPagination, page_size=PAGE_SIZE)
def get_dashboard_operations_list(request: HttpRequest) -> QuerySet[Operation]:
    user_guid: UUID = get_current_user_guid(request)
    reporting_year: int = ReportingYearService.get_current_reporting_year().reporting_year
    return ReportingDashboardService.get_operations_for_reporting_dashboard(user_guid, reporting_year)
