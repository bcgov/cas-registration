import re
from datetime import datetime
from enum import Enum
from typing import Annotated, Optional
from uuid import UUID

from django.db.models import F, Q
from ninja import Field, FilterSchema, ModelSchema
from registration.models.operation import Operation
from reporting.models.report import Report


class ReportingDashboardOperationOut(ModelSchema):
    report_id: int | None
    operation_id: UUID = Field(..., alias="id")
    report_version_id: int | None
    first_report_version_id: Optional[int] = None
    report_status: str | None
    report_submitted_by: Optional[str] = None
    operation_name: Optional[str] = None
    report_updated_at: Optional[datetime] = None
    bcghg_id: Optional[str] = Field(None, alias="bcghg_id.id")
    restricted: bool = False

    class Meta:
        model = Operation
        fields = ["id", "name"]


class ReportingDashboardReportOut(ModelSchema):
    report_id: int | None
    operation_id: UUID = Field(..., alias="operation.id")
    report_version_id: int | None
    first_report_version_id: Optional[int] = None
    report_status: str | None
    report_submitted_by: Optional[str] = None
    operation_name: Optional[str] = None
    report_updated_at: Optional[datetime] = None

    class Meta:
        model = Report
        fields = ["id", "reporting_year"]


class ReportingDashboardFilterSchema(FilterSchema):
    operation_name: Annotated[str | None, Field(q='operation_name__icontains')] = None
    report_version_id: Annotated[int | None, Field(q='report_version_id')] = None
    report_status: str | None = None  # Uses custom filter method below

    def filter_report_status(self, value: str) -> Q:
        """
        Sometimes on the front-end, we tweak the status display to give the user more information. This function allows us to filter by the front-end status Not Started (db status is null) and Draft Supplementary Report (db status is Draft and we're not looking at the first report version).
        """
        if not value:
            return Q()

        filters = Q()

        if re.search(value, 'not started', re.IGNORECASE):
            filters |= Q(report_status__isnull=True)

        if re.search(value, 'supplementary report', re.IGNORECASE):
            filters |= ~Q(first_report_version_id=F('report_version_id'))

        # Generic partial match for status (i.e., value = 'draft' should match both Draft and Draft Supplementary Report)
        filters |= Q(report_status__icontains=value)

        return filters


class ReportingDashboardOperationFilterSchema(ReportingDashboardFilterSchema):
    bcghg_id: Annotated[str | None, Field(q='bcghg_id__id__icontains')] = None


class ReportingDashboardReportFilterSchema(ReportingDashboardFilterSchema):
    reporting_year: Annotated[int | None, Field(q='reporting_year')] = None


class ReportsPeriod(str, Enum):
    ALL = "all"
    PAST = "past"
    CURRENT = "current"
