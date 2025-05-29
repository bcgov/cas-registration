import pytest
from unittest.mock import patch
from model_bakery.baker import make_recipe
from compliance.signals.consumers import handle_report_submission


pytestmark = pytest.mark.django_db


class TestHandleReportSubmission:
    @patch('compliance.signals.consumers.settings')
    @patch('compliance.signals.consumers.logger')
    def test_ignores_signal_in_production_environment(self, mock_logger, mock_settings):
        """Test that the signal handler returns early in production environment."""
        # Arrange
        mock_settings.ENVIRONMENT = "prod"
        kwargs = {'version_id': 123, 'user_guid': 'test-guid'}

        # Act
        handle_report_submission(sender=None, **kwargs)

        # Assert
        mock_logger.info.assert_called_once_with("Ignoring report submission signal in production environment")

    @patch('compliance.signals.consumers.settings')
    @patch('compliance.signals.consumers.ComplianceReportVersionService')
    def test_processes_signal_in_non_production_environment(self, mock_service, mock_settings):
        """Test that the signal handler processes normally in non-production environment."""
        # Arrange
        mock_settings.ENVIRONMENT = "dev"

        # Create real objects using baker recipes
        operation = make_recipe('registration.tests.utils.operation', registration_purpose='OBPS Regulated Operation')
        report = make_recipe('reporting.tests.utils.report', operation=operation)
        report_version = make_recipe('reporting.tests.utils.report_version', report=report)

        kwargs = {'version_id': report_version.id}

        # Act
        handle_report_submission(sender=None, **kwargs)

        # Assert
        mock_service.create_compliance_report_version.assert_called_once()
