from typing import Optional
from ninja import ModelSchema, Schema

from reporting.models import ReportVersion


class ReportingVersionOut(ModelSchema):
    """
    Schema for Report Version output
    """

    reason_for_change: Optional[str] = None

    class Meta:
        model = ReportVersion
        fields = ["updated_at", "report_type", "report", "status", "reason_for_change"]


class ReportVersionTypeIn(Schema):
    """
    Schema for changing the report version type
    """

    report_type: ReportVersion.ReportType


class ReportVersionChangeIn(Schema):
    """
    Schema for adding reason_for_change in supplementary report version
    """

    reason_for_change: str
