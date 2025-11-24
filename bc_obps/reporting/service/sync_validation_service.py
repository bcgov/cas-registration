from reporting.models import ReportVersion
from service.reporting_year_service import ReportingYearService


class SyncValidationService:
    """
    Service to validate whether sync operations are allowed for a given report version.
    """

    @classmethod
    def is_sync_allowed(cls, version_id: int) -> bool:
        """
        Check if syncing with admin data is allowed for the given report version.

        Sync is NOT allowed if:
        1. The report is not for the current reporting year
        2. The operation is not currently owned by the operator who filed the report

        Args:
            version_id: The report version ID

        Returns:
            bool: True if sync is allowed, False otherwise
        """
        try:
            report_version = ReportVersion.objects.select_related(
                'report__operation', 'report__operator', 'report__reporting_year'
            ).get(id=version_id)
        except ReportVersion.DoesNotExist:
            return False

        # Check if report is for current reporting year
        current_reporting_year = ReportingYearService.get_current_reporting_year()
        report_year = report_version.report.reporting_year.reporting_year

        if report_year != current_reporting_year.reporting_year:
            return False

        # Check if operation is still owned by the same operator
        operation = report_version.report.operation
        report_operator = report_version.report.operator
        current_operator = operation.operator

        if report_operator.id != current_operator.id:
            return False

        return True
