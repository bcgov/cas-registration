from ninja import ModelSchema
from typing import Optional

from registration.models import Operation
from reporting.models import ReportVersion


class ReportHistoryResponse(ModelSchema):
    class Meta:
        model = ReportVersion
        fields = ["id", "updated_at", "status", "report_type"]

    report_id: int
    submitted_by: Optional[str] = None
    version: Optional[str] = None


class ReportOperationResponse(ModelSchema):
    class Meta:
        model = Operation
        fields = ["id", "name"]
