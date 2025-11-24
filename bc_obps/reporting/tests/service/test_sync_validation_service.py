import pytest
from model_bakery import baker
from reporting.service.sync_validation_service import SyncValidationService
from reporting.models import ReportingYear

pytestmark = pytest.mark.django_db


class TestSyncValidationService:
    def setup_method(self):
        # Create current reporting year - use get_or_create to avoid duplicates
        self.current_year = 2024
        self.current_reporting_year, _ = ReportingYear.objects.get_or_create(reporting_year=self.current_year)

        # Create previous reporting year
        self.previous_year = 2023
        self.previous_reporting_year, _ = ReportingYear.objects.get_or_create(reporting_year=self.previous_year)

        # Create operator and operation
        self.operator = baker.make_recipe("registration.tests.utils.operator")
        self.operation = baker.make_recipe(
            "registration.tests.utils.operation",
            operator=self.operator,
        )

    def test_is_sync_allowed_for_current_year_same_operator(self):
        """Sync should be allowed for current year with same operator"""
        report = baker.make_recipe(
            "reporting.tests.utils.report",
            operation=self.operation,
            operator=self.operator,
            reporting_year=self.current_reporting_year,
        )
        report_version = baker.make_recipe(
            "reporting.tests.utils.report_version",
            report=report,
            status="Draft",
        )

        result = SyncValidationService.is_sync_allowed(report_version.id)
        assert result is True

    def test_is_sync_allowed_false_for_previous_year(self):
        """Sync should NOT be allowed for previous reporting year"""
        report = baker.make_recipe(
            "reporting.tests.utils.report",
            operation=self.operation,
            operator=self.operator,
            reporting_year=self.previous_reporting_year,
        )
        report_version = baker.make_recipe(
            "reporting.tests.utils.report_version",
            report=report,
            status="Draft",
        )

        result = SyncValidationService.is_sync_allowed(report_version.id)
        assert result is False

    def test_is_sync_allowed_false_for_transferred_operation(self):
        """Sync should NOT be allowed when operation has been transferred"""
        # Create a new operator
        new_operator = baker.make_recipe("registration.tests.utils.operator")

        # Create report with original operator
        report = baker.make_recipe(
            "reporting.tests.utils.report",
            operation=self.operation,
            operator=self.operator,
            reporting_year=self.current_reporting_year,
        )
        report_version = baker.make_recipe(
            "reporting.tests.utils.report_version",
            report=report,
            status="Draft",
        )

        # Transfer operation to new operator
        self.operation.operator = new_operator
        self.operation.save()

        result = SyncValidationService.is_sync_allowed(report_version.id)
        assert result is False

    def test_is_sync_allowed_false_for_nonexistent_version(self):
        """Sync should return False for non-existent report version"""
        result = SyncValidationService.is_sync_allowed(999999)
        assert result is False

    def test_is_sync_allowed_false_for_previous_year_and_transferred(self):
        """Sync should NOT be allowed when both conditions fail"""
        # Create a new operator
        new_operator = baker.make_recipe("registration.tests.utils.operator")

        # Create report with original operator for previous year
        report = baker.make_recipe(
            "reporting.tests.utils.report",
            operation=self.operation,
            operator=self.operator,
            reporting_year=self.previous_reporting_year,
        )
        report_version = baker.make_recipe(
            "reporting.tests.utils.report_version",
            report=report,
            status="Draft",
        )

        # Transfer operation to new operator
        self.operation.operator = new_operator
        self.operation.save()

        result = SyncValidationService.is_sync_allowed(report_version.id)
        assert result is False
