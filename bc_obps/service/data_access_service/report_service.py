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
    def get_all_reports_for_operator(cls, operator_id: UUID, reporting_year: int = 2024) -> list[Report]:
        """
        Fetches all reports filed by the operator, regardless of current ownership of the operation.
        """
        return (
            Report.objects.filter(operation__operator_id=operator_id)
            .prefetch_related("operation")
            .filter(reporting_year=reporting_year)
            .order_by("-reporting_year")
        )
