from uuid import UUID
from reporting.models.report import Report


class ReportDataAccessService:
    @classmethod
    def report_exists(cls, operation_id: UUID, reporting_year: int) -> Report | None:
        return (
            Report.objects.prefetch_related("operation")
            .filter(operation__id=operation_id, reporting_year=reporting_year)
            .first()
        )
