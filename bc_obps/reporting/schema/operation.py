from datetime import datetime
import re
from typing import Optional

from ninja import FilterSchema, ModelSchema

from pgtrigger import Q
from registration.models.operation import Operation
from ninja import Field
from reporting.models.report_version import ReportVersion


class ReportingDashboardOperationOut(ModelSchema):
    report_id: int | None
    report_version_id: int | None
    report_status: str | None
    report_submitted_by: Optional[str] = None
    operation_name: Optional[str] = None
    report_updated_at: Optional[datetime] = None
    bcghg_id: Optional[str] = Field(None, alias="bcghg_id.id")

    class Meta:
        model = Operation
        fields = ["id", "name"]


class ReportingDashboardOperationFilterSchema(FilterSchema):
    bcghg_id: Optional[str] = Field(None, json_schema_extra={'q': 'bcghg_id__id__icontains'})
    operation_name: Optional[str] = Field(None, json_schema_extra={'q': 'operation_name__icontains'})
    report_status: Optional[str] = Field(None, json_schema_extra={'q': 'report_status__icontains'})
    report_version: Optional[str] = Field(None, json_schema_extra={'q': 'report_version__icontains'})
    

    # @staticmethod
    # def filtering_including_custom_statuses(field: str, value: str) -> Q:
    #     # re.search("c", "abcdef")
    #     if value and re.search(value, 'not started', re.IGNORECASE):
    #         return Q(**{f"{field}__isnull": True})
    #     if value and re.search(value, 'draft supplementary report', re.IGNORECASE):
    #         # breakpoint()
    #         return Q(**{f"{field}__icontains": value}) | Q(**{f"{field}__isnull": True})
    #     return Q(**{f"{field}__icontains": value}) if value else Q()

    #     # Fallback: basic icontains match
    #     return Q(**{f"{field}__icontains": value})

    # def filter_bcghg_id(self, value: str) -> Q:
    #     return self.filtering_including_custom_statuses('bcghg_id', value)
    
    # def filter_operation__name(self, value: str) -> Q:
    #     return self.filtering_including_custom_statuses('operation__name', value)

    def filter_report_status(self, value: str) -> Q:
        """
        Sometimes on the front-end, we tweak the status display to give the user more information. This function allows us to filter by the front-end status Not Started (db status is null) and Draft Supplementary Report (db status is Draft and report_version_id > 1).
        """
        if not value:
            return Q()

        filters = Q()

        if re.search(value, 'not started', re.IGNORECASE):
            filters |= Q(report_status__isnull=True)

        if re.search(value, 'draft supplementary report', re.IGNORECASE):
            filters |= Q(report_status=ReportVersion.ReportVersionStatus.Draft) & Q(report_version_id__gt=1)

        # Generic partial match (e.g., value = 'draft' should match both Draft and Draft Supplementary Report)
        filters |= Q(report_status__icontains=value)

        return filters