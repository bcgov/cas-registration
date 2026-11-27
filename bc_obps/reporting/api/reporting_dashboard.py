from typing import List, Literal, Optional
from uuid import UUID

from common.api.utils import get_current_user_guid
from common.permissions import authorize
from common.service.error_service.custom_codes_4xx import custom_codes_4xx
from django.db.models import QuerySet
from django.http import HttpRequest
from ninja import Query
from ninja.pagination import PageNumberPagination, paginate
from registration.models.operation import Operation
from reporting.constants import DASHBOARD_TAGS
from reporting.models.report import Report
from reporting.schema.dashboard import (
    ReportingDashboardOperationFilterSchema,
    ReportingDashboardOperationOut,
    ReportingDashboardReportFilterSchema,
    ReportingDashboardReportOut,
    ReportsPeriod,
)
from reporting.schema.generic import Message
from reporting.service.reporting_dashboard_service import ReportingDashboardService
from reporting.service.reporting_year_service import ReportingYearService

from .router import router


@router.get(
    "/operations",
    response={200: list[ReportingDashboardOperationOut], custom_codes_4xx: Message},
    tags=DASHBOARD_TAGS,
    description="""Returns a list of operations for the current user, current reporting year, current report version. Populates
    the main reporting dashboard page.""",
    auth=authorize("approved_authorized_roles"),
)
@paginate(PageNumberPagination)
def get_dashboard_operations_list(
    request: HttpRequest,
    filters: ReportingDashboardOperationFilterSchema = Query(...),
    sort_field: str | None = "bcghg_id",
    sort_order: Literal["desc", "asc"] | None = "asc",
    paginate_result: bool = Query(True, description="Whether to paginate the results"),
) -> QuerySet[Operation]:
    user_guid: UUID = get_current_user_guid(request)
    reporting_year: int = (
        ReportingYearService.get_current_reporting_year().reporting_year
    )
    return ReportingDashboardService.get_operations_for_reporting_dashboard(
        user_guid,
        reporting_year,
        sort_field=sort_field,
        sort_order=sort_order,
        filters=filters,
    )


@router.get(
    "/reports",
    response={200: list[ReportingDashboardReportOut], custom_codes_4xx: Message},
    tags=DASHBOARD_TAGS,
    description="""Returns a list of reports for the current user. Can return reports for current year, past years, or both.""",
    auth=authorize("approved_authorized_roles"),
)
@paginate(PageNumberPagination)
def get_dashboard_reports_list(
    request: HttpRequest,
    filters: ReportingDashboardReportFilterSchema = Query(...),
    sort_field: str | None = "reporting_year",
    sort_order: Literal["desc", "asc"] | None = "desc",
    paginate_result: bool = Query(True, description="Whether to paginate the results"),
    reports_period: ReportsPeriod = ReportsPeriod.ALL,
) -> QuerySet[Report]:
    user_guid: UUID = get_current_user_guid(request)
    reporting_year: int = (
        ReportingYearService.get_current_reporting_year().reporting_year
    )
    return ReportingDashboardService.get_reports_for_reporting_dashboard(
        user_guid,
        reporting_year,
        reports_period=reports_period,
        sort_field=sort_field,
        sort_order=sort_order,
        filters=filters,
    )
