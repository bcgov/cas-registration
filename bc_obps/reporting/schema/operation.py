from datetime import datetime
import re
from typing import Optional
from uuid import UUID

from ninja import FilterSchema, ModelSchema

from registration.models.operation import Operation
from ninja import Field
from django.db.models import Q, F
from reporting.models.report import Report


class ReportingDashboardOperationOut(ModelSchema):
    report_id: int | None
    operation_id: UUID | None
    report_version_id: int | None
    first_report_version_id: Optional[int] = None
    report_status: str | None
    report_submitted_by: Optional[str] = None
    operation_name: Optional[str] = None
    report_updated_at: Optional[datetime] = None
    bcghg_id: Optional[str] = Field(None, alias="bcghg_id.id")

    class Meta:
        model = Operation
        fields = ["id", "name"]


class ReportingDashboardReportOut(ModelSchema):
    report_id: int | None
    report_version_id: int | None
    first_report_version_id: Optional[int] = None
    report_status: str | None
    report_submitted_by: Optional[str] = None
    operation_name: Optional[str] = None
    report_updated_at: Optional[datetime] = None
    reporting_year_id: Optional[int] = Field(None, alias="reporting_year_id.reporting_year")

    class Meta:
        model = Report
        fields = ["id", "reporting_year", "operation"]


class ReportingDashboardOperationFilterSchema(FilterSchema):
    bcghg_id: Optional[str] = Field(None, json_schema_extra={'q': 'bcghg_id__id__icontains'})
    operation_name: Optional[str] = Field(None, json_schema_extra={'q': 'operation_name__icontains'})
    report_status: Optional[str] = Field(None, json_schema_extra={'q': 'report_status__icontains'})
    reporting_year: Optional[int] = Field(None, json_schema_extra={'q': 'report__reporting_year__icontains'})

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
