from uuid import UUID
from reporting.models.report import Report


class ReportDataAccessService:
    @classmethod
    def report_exists(cls, operation_id: UUID, reporting_year: int) -> bool:
        return Report.objects.filter(operation_id=operation_id, reporting_year=reporting_year).exists()
