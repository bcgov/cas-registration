import pytest
from unittest.mock import patch, MagicMock
from model_bakery.baker import make_recipe
from django.core.exceptions import ObjectDoesNotExist

from reporting.service.report_validation.report_validation_error import (
    ReportValidationError,
    Severity,
)
from reporting.service.report_validation.validators.supplementary_report_change import (
    validate,
)
from reporting.models.report_change import ReportChange


@pytest.mark.django_db
class TestSupplementaryReportChangeValidator:
    @patch("service.report_version_service.ReportVersionService.is_initial_report_version")
    @patch("reporting.models.report_change.ReportChange.objects.get")
    def test_initial_version_skips_validation(self, mock_get, mock_initial):
        # Initial version should bypass all checks
        mock_initial.return_value = True
        version = make_recipe("reporting.tests.utils.report_version")

        result = validate(version)

        mock_initial.assert_called_once_with(version.id)
        # We never even try to fetch a ReportChange
        mock_get.assert_not_called()
        assert result == {}

    @patch("service.report_version_service.ReportVersionService.is_initial_report_version")
    @patch("reporting.models.report_change.ReportChange.objects.get")
    def test_missing_report_change_entry(self, mock_get, mock_initial):
        # Non‑initial version with no ReportChange record
        mock_initial.return_value = False
        mock_get.side_effect = ObjectDoesNotExist
        version = make_recipe("reporting.tests.utils.report_version")

        result = validate(version)

        mock_initial.assert_called_once_with(version.id)
        mock_get.assert_called_once_with(report_version_id=version.id)
        assert result == {
            "missing_supplementary_report_change": ReportValidationError(
                Severity.ERROR,
                "No report change review found for this supplementary report version.",
            )
        }

    @patch("service.report_version_service.ReportVersionService.is_initial_report_version")
    @patch("reporting.models.report_change.ReportChange.objects.get")
    def test_report_change_present(self, mock_get, mock_initial):
        # Non‑initial version and ReportChange exists → no errors
        mock_initial.return_value = False
        mock_get.return_value = MagicMock(spec=ReportChange)
        version = make_recipe("reporting.tests.utils.report_version")

        result = validate(version)

        mock_initial.assert_called_once_with(version.id)
        mock_get.assert_called_once_with(report_version_id=version.id)
        assert result == {}
