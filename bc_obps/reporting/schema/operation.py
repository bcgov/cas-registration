from datetime import datetime
from typing import Optional
from ninja import FilterSchema, ModelSchema
from registration.models.operation import Operation
from ninja import Field


class ReportingDashboardOperationOut(ModelSchema):
    report_id: int | None
    report_version_id: int | None
    report_status: str | None
    submitted_by: Optional[str] = None
    report_updated_at: Optional[datetime] = None
    bcghg_id: Optional[str] = Field(None, alias="bcghg_id.id")

    class Meta:
        model = Operation
        fields = ["id", "name"]

    @staticmethod
    def resolve_submitted_by(obj: Operation) -> Optional[str]:
        return obj.updated_by.get_full_name() if obj.updated_by else None


class ReportingDashboardOperationFilterSchema(FilterSchema):
    bcghg_id: Optional[str] = Field(None, json_schema_extra={'q': 'bcghg_id__id__icontains'})
    name: Optional[str] = Field(None, json_schema_extra={'q': 'name__icontains'})
    report_status: Optional[str] = Field(None, json_schema_extra={'q': 'report_status__icontains'})
