from typing import Optional, Union
from ninja import FilterSchema, ModelSchema
from registration.models.operation import Operation


class ReportingDashboardOperationOut(ModelSchema):
    report_id: int
    report_version_id: int
    report_status: str

    class Meta:
        model = Operation
        fields = ["id", "name", "bcghg_id"]

    @staticmethod
    def resolve_report_id(obj: Operation) -> int:
        return 0

    @staticmethod
    def resolve_report_version_id(obj: Operation) -> int:
        return 0

    @staticmethod
    def resolve_report_status(obj: Operation) -> int:
        return "test"


class ReportingDashboardOperationFilterSchema(FilterSchema):
    bcghg_id: Optional[str] = None
    name: Optional[str] = None
    report_status: Optional[str] = None
    sort_field: Optional[str] = "created_at"
    sort_order: Optional[str] = "desc"
