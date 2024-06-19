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

    @classmethod
    def create_report(cls, operation_id: UUID, reporting_year: int):
        """
        Creates a new report for an operation and a reporting year.
        Throws an exception if a report already exists
        """

        if ReportDataAccessService.report_exists(operation_id, reporting_year):
            raise Exception("A report already exists for this operation and reporting year")
