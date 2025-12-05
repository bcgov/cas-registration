from uuid import UUID
from typing import Optional, Tuple
from reporting.models import ReportVersion
from service.reporting_year_service import ReportingYearService
from registration.models import Facility, Operation


class SyncValidationService:
    """
    Service to validate whether sync operations are allowed for a given report version.
    """

    @classmethod
    def _validate_sync_conditions(cls, version_id: int) -> Tuple[bool, Optional[ReportVersion]]:
        """
        Internal helper to validate sync conditions and return the report version.

        Args:
            version_id: The report version ID

        Returns:
            Tuple of (is_allowed: bool, report_version: Optional[ReportVersion])
        """
        report_version = ReportVersion.objects.select_related(
            'report__operation', 'report__operator', 'report__reporting_year'
        ).get(id=version_id)

        # Check if report is for current reporting year
        current_reporting_year = ReportingYearService.get_current_reporting_year()
        report_year = report_version.report.reporting_year.reporting_year

        if report_year != current_reporting_year.reporting_year:
            return False, None

        # Check if operation is still owned by the same operator
        operation = report_version.report.operation
        report_operator = report_version.report.operator
        current_operator = operation.operator

        if report_operator.id != current_operator.id:
            return False, None

        return True, report_version

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
        is_allowed, _ = cls._validate_sync_conditions(version_id)
        return is_allowed

    @classmethod
    def is_facility_sync_allowed(cls, version_id: int, facility_id: UUID) -> bool:
        """
        Check if syncing with admin data is allowed for the given facility report.

        Sync is NOT allowed if:
        1. The report is not for the current reporting year
        2. The operation is not currently owned by the operator who filed the report
        3. For LFO (Linear Facility Operations) only: The facility is not currently owned
           by the same operation that filed the report

        Args:
            version_id: The report version ID
            facility_id: The facility ID

        Returns:
            bool: True if sync is allowed, False otherwise
        """
        is_allowed, report_version = cls._validate_sync_conditions(version_id)
        if not is_allowed or report_version is None:
            return False

        report_operation = report_version.report.operation

        # Only check facility transfer for Linear Facility Operations (LFO)
        if report_operation.type == Operation.Types.LFO:
            facility = Facility.objects.select_related('operation').get(id=facility_id)
            current_facility_operation = facility.operation

            # Check if facility is still owned by the same operation
            if report_operation.id != current_facility_operation.id:
                return False

        return True
