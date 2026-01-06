from unittest.mock import patch
import pytest
from model_bakery import baker
from django.utils import timezone
from reporting.service.sync_validation_service import SyncValidationService
from reporting.models import ReportingYear

pytestmark = pytest.mark.django_db


class TestSyncValidationService:
    def setup_method(self):
        # Use dynamic year calculation: reporting year is typically the previous calendar year
        # (e.g., in 2026, we report on 2025 activities)
        now = timezone.now()
        current_reporting_year = now.year - 1
        self.current_reporting_year, _ = ReportingYear.objects.get_or_create(reporting_year=current_reporting_year)

        # Previous reporting year
        previous_reporting_year = current_reporting_year - 1
        self.previous_reporting_year, _ = ReportingYear.objects.get_or_create(reporting_year=previous_reporting_year)

        # Create operator and operation
        self.operator = baker.make_recipe("registration.tests.utils.operator")
        self.operation = baker.make_recipe(
            "registration.tests.utils.operation",
            operator=self.operator,
        )

    def _create_report_version(self, reporting_year=None, operator=None, operation=None, status="Draft"):
        """Helper method to create a report and report version."""
        report = baker.make_recipe(
            "reporting.tests.utils.report",
            operation=operation or self.operation,
            operator=operator or self.operator,
            reporting_year=reporting_year or self.current_reporting_year,
        )
        return baker.make_recipe(
            "reporting.tests.utils.report_version",
            report=report,
            status=status,
        )

    def _create_facility(self, operation=None):
        """Helper method to create a facility."""
        return baker.make_recipe(
            "registration.tests.utils.facility",
            operation=operation or self.operation,
        )

    @patch("reporting.service.sync_validation_service.ReportingYearService.get_current_reporting_year")
    def test_is_sync_allowed_for_current_year_same_operator(self, mock_get_current_reporting_year):
        """Sync should be allowed for current year with same operator"""
        mock_get_current_reporting_year.return_value = self.current_reporting_year

        report_version = self._create_report_version()

        result = SyncValidationService.is_sync_allowed(report_version.id)
        assert result is True

    def test_is_sync_allowed_false_for_previous_year(self):
        """Sync should NOT be allowed for previous reporting year"""
        report_version = self._create_report_version(reporting_year=self.previous_reporting_year)

        result = SyncValidationService.is_sync_allowed(report_version.id)
        assert result is False

    def test_is_sync_allowed_false_for_transferred_operation(self):
        """Sync should NOT be allowed when an operation has been transferred"""
        # Create a new operator
        new_operator = baker.make_recipe("registration.tests.utils.operator")

        # Create a report with the original operator
        report_version = self._create_report_version()

        # Transfer operation to a new operator
        self.operation.operator = new_operator
        self.operation.save()

        result = SyncValidationService.is_sync_allowed(report_version.id)
        assert result is False

    def test_is_sync_allowed_false_for_previous_year_and_transferred(self):
        """Sync should NOT be allowed when both conditions fail"""
        # Create a new operator
        new_operator = baker.make_recipe("registration.tests.utils.operator")

        # Create a report with original operator for previous year
        report_version = self._create_report_version(reporting_year=self.previous_reporting_year)

        # Transfer operation to a new operator
        self.operation.operator = new_operator
        self.operation.save()

        result = SyncValidationService.is_sync_allowed(report_version.id)
        assert result is False

    @patch("reporting.service.sync_validation_service.ReportingYearService.get_current_reporting_year")
    def test_is_facility_sync_allowed_for_current_year_same_operation(self, mock_get_current_reporting_year):
        """Sync should be allowed for current year with same operation and facility ownership"""
        mock_get_current_reporting_year.return_value = self.current_reporting_year

        facility = self._create_facility()
        report_version = self._create_report_version()

        result = SyncValidationService.is_facility_sync_allowed(report_version.id, facility.id)
        assert result is True

    @patch("reporting.service.sync_validation_service.ReportingYearService.get_current_reporting_year")
    def test_is_facility_sync_allowed_false_for_transferred_facility_lfo(self, mock_get_current_reporting_year):
        """Sync should NOT be allowed when a facility in LFO has been transferred to a different operation"""
        from registration.models import Operation

        mock_get_current_reporting_year.return_value = self.current_reporting_year

        # Set operation type to LFO
        self.operation.type = Operation.Types.LFO
        self.operation.save()

        # Create a facility initially owned by the operation
        facility = self._create_facility()

        # Create a report for the operation
        report_version = self._create_report_version()

        # Transfer facility to a new operation
        new_operation = baker.make_recipe(
            "registration.tests.utils.operation",
            operator=self.operator,  # Same operator but different operation
            type=Operation.Types.LFO,
        )
        facility.operation = new_operation
        facility.save()

        result = SyncValidationService.is_facility_sync_allowed(report_version.id, facility.id)
        assert result is False

    @patch("reporting.service.sync_validation_service.ReportingYearService.get_current_reporting_year")
    def test_is_facility_sync_allowed_true_for_transferred_facility_sfo(self, mock_get_current_reporting_year):
        """Sync SHOULD be allowed for SFO even if facility is transferred (doesn't check facility transfer for SFO)"""
        from registration.models import Operation

        mock_get_current_reporting_year.return_value = self.current_reporting_year

        # Set the operation type to SFO
        self.operation.type = Operation.Types.SFO
        self.operation.save()

        # Create a facility initially owned by the operation
        facility = self._create_facility()

        # Create a report for the operation
        report_version = self._create_report_version()

        # Transfer facility to a new operation (but the same operator)
        new_operation = baker.make_recipe(
            "registration.tests.utils.operation",
            operator=self.operator,
            type=Operation.Types.SFO,
        )
        facility.operation = new_operation
        facility.save()

        # For SFO, facility transfer check is skipped, so sync should be allowed
        result = SyncValidationService.is_facility_sync_allowed(report_version.id, facility.id)
        assert result is True

    @patch("reporting.service.sync_validation_service.ReportingYearService.get_current_reporting_year")
    def test_is_facility_sync_allowed_false_for_transferred_operation(self, mock_get_current_reporting_year):
        """Sync should NOT be allowed when an operation has been transferred even if the facility stayed with operation"""
        mock_get_current_reporting_year.return_value = self.current_reporting_year

        # Create facility
        facility = self._create_facility()

        # Create a report with original operator
        report_version = self._create_report_version()

        # Transfer operation to a new operator
        new_operator = baker.make_recipe("registration.tests.utils.operator")
        self.operation.operator = new_operator
        self.operation.save()

        result = SyncValidationService.is_facility_sync_allowed(report_version.id, facility.id)
        assert result is False
