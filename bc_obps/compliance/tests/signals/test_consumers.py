import pytest
from unittest.mock import patch
from model_bakery import baker
from compliance.signals.consumers import handle_report_submission
from compliance.models import ComplianceReport, CompliancePeriod
from registration.models import Operation

pytestmark = pytest.mark.django_db


class TestComplianceSignalConsumer:
    def test_handle_report_submission_no_version_id(self):
        """Test that function returns early when no version_id is provided."""
        # Act
        result = handle_report_submission(sender=object(), version_id=None)

        # Assert
        assert result is None

    def test_handle_report_submission_pre_2024_report(self):
        # Arrange
        reporting_year = baker.make_recipe('reporting.tests.utils.reporting_year', reporting_year=2020)
        report_version = baker.make_recipe(
            'reporting.tests.utils.report_version', report__reporting_year=reporting_year
        )

        # Act
        result = handle_report_submission(sender=object(), version_id=report_version.id)

        # Assert
        assert result is None

    def test_handle_report_submission_non_regulated_operation(self):
        """Test that function returns early for non-regulated operations."""
        # Arrange
        operation = baker.make_recipe(
            'registration.tests.utils.operation', registration_purpose=Operation.Purposes.REPORTING_OPERATION
        )  # This will make is_regulated_operation return False

        report_version = baker.make_recipe(
            'reporting.tests.utils.report_version', report__reporting_year_id=2024, report__operation=operation
        )

        # Act
        result = handle_report_submission(sender=object(), version_id=report_version.id)

        # Assert
        assert result is None

    @patch('compliance.signals.consumers.ComplianceReportVersionService.create_compliance_report_version')
    def test_handle_report_submission_first_version_no_existing_compliance_versions(self, mock_create_version):
        """Test that first report version creates compliance report version when no existing compliance versions."""
        # Arrange
        reporting_year = baker.make_recipe('reporting.tests.utils.reporting_year', reporting_year=2028)
        baker.make_recipe('compliance.tests.utils.compliance_period', reporting_year=reporting_year)
        operation = baker.make_recipe(
            'registration.tests.utils.operation', registration_purpose=Operation.Purposes.OBPS_REGULATED_OPERATION
        )  # This will make is_regulated_operation return True

        report_version = baker.make_recipe(
            'reporting.tests.utils.report_version', report__reporting_year=reporting_year, report__operation=operation
        )

        # Act
        handle_report_submission(sender=object(), version_id=report_version.id)

        # Assert
        # ComplianceReport should be created
        assert ComplianceReport.objects.filter(report_id=report_version.report_id).exists()

        # ComplianceReportVersionService.create_compliance_report_version should be called
        mock_create_version.assert_called_once()

    @patch('compliance.signals.consumers.SupplementaryVersionService.handle_supplementary_version')
    @patch('compliance.signals.consumers.ComplianceReportVersionService.create_compliance_report_version')
    def test_handle_report_submission_with_existing_compliance_versions(
        self, mock_create_version, mock_handle_supplementary
    ):
        """Test that supplementary logic is used when compliance report versions exist."""
        # Arrange
        reporting_year = baker.make_recipe('reporting.tests.utils.reporting_year', reporting_year=2028)
        baker.make_recipe('compliance.tests.utils.compliance_period', reporting_year=reporting_year)
        operation = baker.make_recipe(
            'registration.tests.utils.operation', registration_purpose=Operation.Purposes.OBPS_REGULATED_OPERATION
        )  # This will make is_regulated_operation return True

        report_version = baker.make_recipe(
            'reporting.tests.utils.report_version', report__reporting_year=reporting_year, report__operation=operation
        )

        # Create a compliance report and existing compliance report version
        # Reuse the existing compliance_period instead of creating a new one
        compliance_period = CompliancePeriod.objects.get(reporting_year=reporting_year)
        compliance_report = baker.make_recipe(
            'compliance.tests.utils.compliance_report',
            report=report_version.report,
            compliance_period=compliance_period,
        )
        baker.make_recipe('compliance.tests.utils.compliance_report_version', compliance_report=compliance_report)

        # Act
        handle_report_submission(sender=object(), version_id=report_version.id)

        # Assert
        mock_handle_supplementary.assert_called_once()
        mock_create_version.assert_not_called()

    @patch('compliance.signals.consumers.SupplementaryVersionService.handle_supplementary_version')
    @patch('compliance.signals.consumers.ComplianceReportVersionService.create_compliance_report_version')
    def test_handle_report_submission_with_report_versions_but_no_compliance_versions(
        self, mock_create_version, mock_handle_supplementary
    ):
        """Test scenario where there are ReportVersions but no ComplianceReportVersions - should use create_compliance_report_version."""
        # Arrange
        reporting_year = baker.make_recipe('reporting.tests.utils.reporting_year', reporting_year=2029)
        baker.make_recipe('compliance.tests.utils.compliance_period', reporting_year=reporting_year)
        operation = baker.make_recipe(
            'registration.tests.utils.operation', registration_purpose=Operation.Purposes.OBPS_REGULATED_OPERATION
        )  # This will make is_regulated_operation return True

        report = baker.make_recipe('reporting.tests.utils.report', reporting_year=reporting_year, operation=operation)

        # Create multiple report versions but no compliance report versions
        baker.make_recipe('reporting.tests.utils.report_version', report=report, status='Submitted')
        current_report_version = baker.make_recipe('reporting.tests.utils.report_version', report=report)

        # Act
        handle_report_submission(sender=object(), version_id=current_report_version.id)

        # Assert
        # ComplianceReport should be created
        assert ComplianceReport.objects.filter(report_id=report.id).exists()

        mock_create_version.assert_called_once()
        mock_handle_supplementary.assert_not_called()

    @patch('compliance.signals.consumers.ComplianceReportVersionService.create_compliance_report_version')
    def test_handle_report_submission_creates_compliance_report_if_not_exists(self, mock_create_version):
        """Test that ComplianceReport is created if it doesn't exist."""
        # Arrange
        reporting_year = baker.make_recipe('reporting.tests.utils.reporting_year', reporting_year=2028)
        baker.make_recipe('compliance.tests.utils.compliance_period', reporting_year=reporting_year)
        operation = baker.make_recipe(
            'registration.tests.utils.operation', registration_purpose=Operation.Purposes.OBPS_REGULATED_OPERATION
        )  # This will make is_regulated_operation return True

        report_version = baker.make_recipe(
            'reporting.tests.utils.report_version', report__reporting_year=reporting_year, report__operation=operation
        )

        # Act
        handle_report_submission(sender=object(), version_id=report_version.id)

        # Assert
        # ComplianceReport should be created
        compliance_report = ComplianceReport.objects.get(report_id=report_version.report_id)
        assert compliance_report.compliance_period.reporting_year == reporting_year

        # ComplianceReportVersionService.create_compliance_report_version should be called
        mock_create_version.assert_called_once_with(compliance_report.id, report_version.id)
