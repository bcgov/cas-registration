from typing import List, Optional, Literal
from ninja import Query
from uuid import UUID
from common.permissions import authorize
from django.http import HttpRequest
from django.db.models import QuerySet
from ninja.pagination import paginate, PageNumberPagination

from common.api.utils import get_current_user_guid
from registration.models.operation import Operation
from reporting.models.report import Report
from reporting.schema.generic import Message
from reporting.constants import DASHBOARD_TAGS
from reporting.schema.dashboard import (
    ReportingDashboardOperationFilterSchema,
    ReportingDashboardOperationOut,
    ReportingDashboardReportOut,
)
from reporting.service.reporting_dashboard_service import ReportingDashboardService
from service.error_service.custom_codes_4xx import custom_codes_4xx
from service.reporting_year_service import ReportingYearService


from .router import router


@router.get(
    "/operations",
    response={200: List[ReportingDashboardOperationOut], custom_codes_4xx: Message},
    tags=DASHBOARD_TAGS,
    description="""Returns a list of operations for the current user, current reporting year, current report version. Populates
    the main reporting dashboard page.""",
    auth=authorize("approved_authorized_roles"),
)
@paginate(PageNumberPagination)
def get_dashboard_operations_list(
    request: HttpRequest,
    filters: ReportingDashboardOperationFilterSchema = Query(...),
    sort_field: Optional[str] = "bcghg_id",
    sort_order: Optional[Literal["desc", "asc"]] = "asc",
    paginate_result: bool = Query(True, description="Whether to paginate the results"),
) -> QuerySet[Operation]:
    user_guid: UUID = get_current_user_guid(request)
    reporting_year: int = ReportingYearService.get_current_reporting_year().reporting_year
    return ReportingDashboardService.get_operations_for_reporting_dashboard(
        user_guid, reporting_year, sort_field=sort_field, sort_order=sort_order, filters=filters
    )


@router.get(
    "/reports",
    response={200: List[ReportingDashboardReportOut], custom_codes_4xx: Message},
    tags=DASHBOARD_TAGS,
    description="""Returns a list of reports for the current user.""",
    auth=authorize("approved_authorized_roles"),
)
@paginate(PageNumberPagination)
def get_dashboard_past_reports_list(
    request: HttpRequest,
    filters: ReportingDashboardOperationFilterSchema = Query(...),
    sort_field: Optional[str] = "reporting_year",
    sort_order: Optional[Literal["desc", "asc"]] = "desc",
    paginate_result: bool = Query(True, description="Whether to paginate the results"),
    get_past_reports: Optional[bool] = Query(None),
) -> QuerySet[Report]:
    user_guid: UUID = get_current_user_guid(request)
    reporting_year: int = ReportingYearService.get_current_reporting_year().reporting_year
    return ReportingDashboardService.get_reports_for_reporting_dashboard(
        user_guid,
        reporting_year,
        get_past_reports=get_past_reports,
        sort_field=sort_field,
        sort_order=sort_order,
        filters=filters,
    )
