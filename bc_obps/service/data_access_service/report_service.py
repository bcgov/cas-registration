from uuid import UUID
from reporting.models.report import Report


class ReportDataAccessService:
    @classmethod
    def get_report(cls, operator_id: UUID, reporting_year: int) -> Report | None:
        return Report.objects.first()
