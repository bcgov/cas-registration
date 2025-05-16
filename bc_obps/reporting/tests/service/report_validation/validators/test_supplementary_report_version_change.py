import pytest
from unittest.mock import patch
from model_bakery.baker import make_recipe

from reporting.service.report_validation.report_validation_error import (
    ReportValidationError,
    Severity,
)
from reporting.service.report_validation.validators.supplementary_report_version_change import (
    validate,
)


@pytest.mark.django_db
class TestSupplementaryReportVersionChangeValidator:
    @patch("service.report_version_service.ReportVersionService.is_initial_report_version")
    def test_initial_version_skips_validation(self, mock_is_initial):
        # initial versions should bypass the reason_for_change check entirely
        mock_is_initial.return_value = True
        version = make_recipe("reporting.tests.utils.report_version")

        result = validate(version)

        mock_is_initial.assert_called_once_with(version.id)
        assert result == {}

    @patch("service.report_version_service.ReportVersionService.is_initial_report_version")
    def test_blank_reason_for_change_raises_error(self, mock_is_initial):
        # non‑initial version with empty string → error
        mock_is_initial.return_value = False
        version = make_recipe("reporting.tests.utils.report_version")
        version.reason_for_change = ""

        errors = validate(version)

        mock_is_initial.assert_called_once_with(version.id)
        assert "missing_supplementary_report_version_change" in errors

        err = errors["missing_supplementary_report_version_change"]
        assert isinstance(err, ReportValidationError)
        assert err.severity == Severity.ERROR
        assert err.message == ("No reason for change found for this supplementary report version.")

    @patch("service.report_version_service.ReportVersionService.is_initial_report_version")
    def test_none_reason_for_change_raises_error(self, mock_is_initial):
        # non‑initial version with None → error
        mock_is_initial.return_value = False
        version = make_recipe("reporting.tests.utils.report_version")
        version.reason_for_change = None

        errors = validate(version)

        mock_is_initial.assert_called_once_with(version.id)
        assert "missing_supplementary_report_version_change" in errors

    @patch("service.report_version_service.ReportVersionService.is_initial_report_version")
    def test_present_reason_for_change_passes(self, mock_is_initial):
        # non‑initial version with a real reason_for_change → no errors
        mock_is_initial.return_value = False
        version = make_recipe(
            "reporting.tests.utils.report_version",
            reason_for_change="Corrected a typo",
        )

        errors = validate(version)

        mock_is_initial.assert_called_once_with(version.id)
        assert errors == {}
