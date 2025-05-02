from unittest.mock import MagicMock
from model_bakery.baker import make_recipe
import pytest
from reporting.service.report_validation.report_validation_service import (
    ReportValidationService,
)


@pytest.mark.django_db
class TestReportValidationService:
    def test_initializes_with_the_proper_plugins(self):
        plugin_names = [p.__name__ for p in ReportValidationService.validation_plugins]
        assert plugin_names == [
            "reporting.service.report_validation.validators.mandatory_verification_statement",
            "reporting.service.report_validation.validators.operation_boroid_presence",
            "reporting.service.report_validation.validators.report_attachments_are_scanned",
            "reporting.service.report_validation.validators.supplementary_report_attachments_confirmation",
        ]

    def test_validates_the_report_with_the_registered_plugins(self):
        original_plugins = ReportValidationService.validation_plugins

        mock_validation_plugins = [MagicMock(), MagicMock(), MagicMock()]
        mock_validation_plugins[0].validate.return_value = {"mock_key": "mock_errors"}
        mock_validation_plugins[1].validate.return_value = {"mock_key2": "mock_errors2"}

        ReportValidationService.validation_plugins = mock_validation_plugins

        report_version = make_recipe("reporting.tests.utils.report_version")

        errors = ReportValidationService.validate_report_version(report_version.id)
        mock_validation_plugins[0].validate.assert_called_once()
        mock_validation_plugins[1].validate.assert_called_once()
        assert errors == {"mock_key": "mock_errors", "mock_key2": "mock_errors2"}

        ReportValidationService.validation_plugins = original_plugins
