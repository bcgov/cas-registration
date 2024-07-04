from ninja import ModelSchema
from registration.models.operation import Operation


class ReportingDashboardOperationOut(ModelSchema):
    report_id: int
    report_version_id: int

    class Meta:
        model = Operation
        fields = ["name", "bcghg_id"]

    @staticmethod
    def resolve_report_id(obj: Operation) -> int:
        return 0

    @staticmethod
    def resolve_report_version_id(obj: Operation) -> int:
        return 0
