from uuid import UUID
from django.db import transaction
from registration.models.operation import Operation
from reporting.models.report import Report
from service.data_access_service.report_service import ReportDataAccessService
from service.data_access_service.reporting_year import ReportingYearDataAccessService
from reporting.service.report_version_service import ReportVersionService


class ReportService:
    @classmethod
    @transaction.atomic()
    def create_report(cls, operation_id: UUID, reporting_year: int) -> int:
        if ReportDataAccessService.report_exists(operation_id, reporting_year):
            raise Exception("A report already exists for this operation and year, unable to create a new one.")

        # Fetching report context
        operation = (
            Operation.objects.select_related("operator")
            .prefetch_related("activities", "regulated_products")
            .get(id=operation_id)
        )
        operator = operation.operator

        # Creating report object

        report = Report.objects.create(
            operation=operation,
            operator=operator,
            reporting_year=ReportingYearDataAccessService.get_by_year(reporting_year),
        )

        report_version = ReportVersionService.create_report_version(report)
        return report_version.id
