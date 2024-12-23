from typing import Optional
from ninja import FilterSchema, ModelSchema
from registration.models.operation import Operation
from ninja import Field


class ReportingDashboardOperationOut(ModelSchema):
    report_id: int | None
    report_version_id: int | None
    report_status: str | None
    bcghg_id: Optional[str] = Field(None, alias="bcghg_id.id")

    class Meta:
        model = Operation
        fields = ["id", "name"]


class ReportingDashboardOperationFilterSchema(FilterSchema):
    bcghg_id: Optional[str] = None
    name: Optional[str] = None
    report_status: Optional[str] = None
    sort_field: Optional[str] = "created_at"
    sort_order: Optional[str] = "desc"
