from typing import Optional
from ninja import ModelSchema, Schema

from reporting.models import ReportVersion


class ReportingVersionOut(ModelSchema):
    """
    Schema for Report Version output
    """

    reason_for_change: Optional[str] = None
    reporting_year: int

    class Meta:
        model = ReportVersion
        fields = ["updated_at", "report_type", "report", "status", "reason_for_change"]

    @staticmethod
    def resolve_reporting_year(obj: ReportVersion) -> int:
        return obj.report.reporting_year.reporting_year


class ReportVersionTypeIn(Schema):
    """
    Schema for changing the report version type
    """

    report_type: ReportVersion.ReportType


class ReportVersionIn(Schema):
    """
    Schema for adding data to the report version
    """

    reason_for_change: str
