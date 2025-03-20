from ninja import ModelSchema
from typing import Optional, Any

from registration.models import Operation
from reporting.models import ReportVersion


class ReportHistoryResponse(ModelSchema):
    class Meta:
        model = ReportVersion
        fields = ["id", "updated_at", "status", "report_type", "is_latest_submitted"]

    report_id: int
    submitted_by: Optional[str] = None
    version: Optional[str] = None

    @staticmethod
    def resolve_version(obj: Any) -> str:
        if obj.version_number == 1:
            return "Current Version"
        return f"Version {obj.version_number}"

    @staticmethod
    def resolve_submitted_by(obj: ReportVersion) -> Optional[str]:
        return obj.updated_by.get_full_name() if obj.updated_by else None


class ReportOperationResponse(ModelSchema):
    class Meta:
        model = Operation
        fields = ["id", "name"]
