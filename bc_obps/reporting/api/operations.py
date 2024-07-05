from typing import Iterable, List
from django.http import HttpRequest
from ninja import Query
from registration.api.utils.current_user_utils import get_current_user_guid
from registration.decorators import handle_http_errors
from registration.models.operation import Operation
from reporting.schema.generic import Message
from reporting.constants import DASHBOARD_TAGS
from reporting.schema.operation import ReportingDashboardOperationFilterSchema, ReportingDashboardOperationOut
from service.data_access_service.operation_service import OperationDataAccessService
from service.data_access_service.user_service import UserDataAccessService
from .router import router
from ninja.responses import codes_4xx
from ninja.pagination import paginate, PageNumberPagination


@router.get(
    "/operations",
    response={200: List[ReportingDashboardOperationOut], codes_4xx: Message},
    tags=DASHBOARD_TAGS,
    description="""Returns a list of operators for the current reporting year, for the current user. Populates 
    the main reporting dashboard page.""",
)
@handle_http_errors()
@paginate(PageNumberPagination, page_size=5)
def get_dashboard_operations_list(
    request: HttpRequest, filters: ReportingDashboardOperationFilterSchema = Query(...)
) -> Iterable[ReportingDashboardOperationOut]:
    user_guid = get_current_user_guid(request)
    user = UserDataAccessService.get_by_guid(user_guid)
    return OperationDataAccessService.get_all_operations_for_user(user)
