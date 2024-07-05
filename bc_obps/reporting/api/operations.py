from typing import List, Literal, Tuple
from django.http import HttpRequest
from ninja import Query
from registration.decorators import handle_http_errors
from registration.models.operation import Operation
from reporting.schema.generic import Message
from reporting.constants import DASHBOARD_TAGS
from reporting.schema.operation import ReportingDashboardOperationFilterSchema, ReportingDashboardOperationOut
from .router import router
from ninja.responses import codes_4xx


@router.get(
    "/operations",
    response={200: List[ReportingDashboardOperationOut], codes_4xx: Message},
    tags=DASHBOARD_TAGS,
    description="""Returns a list of operators for the current reporting year, for the current user. Populates 
    the main reporting dashboard page.""",
)
@handle_http_errors()
def get_dashboard_operations_list(
    request: HttpRequest, filters: ReportingDashboardOperationFilterSchema = Query(...)
) -> Tuple[Literal[200], List[ReportingDashboardOperationOut]]:
    return 200, Operation.objects.all()
