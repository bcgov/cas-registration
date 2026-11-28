from ninja import ModelSchema
from registration.models import Operation
from reporting.models import ReportVersion


class ReportHistoryResponse(ModelSchema):
    class Meta:
        model = ReportVersion
        fields = ["id", "updated_at", "status", "report_type", "is_latest_submitted"]

    submitted_by: str | None = None
    version: str | None = None

    @staticmethod
    def resolve_submitted_by(obj: ReportVersion) -> str | None:
        return obj.updated_by.get_full_name() if obj.updated_by else None


class ReportOperationResponse(ModelSchema):
    class Meta:
        model = Operation
        fields = ["id", "name"]
