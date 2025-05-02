import pytest
from unittest.mock import patch, MagicMock
from model_bakery.baker import make_recipe
from django.core.exceptions import ObjectDoesNotExist

from reporting.service.report_validation.report_validation_error import (
    ReportValidationError,
    Severity,
)
from reporting.service.report_validation.validators.supplementary_report_attachments_confirmation import (
    validate,
)


@pytest.mark.django_db
class TestSupplementaryReportAttachmentConfirmationValidator:
    @patch("service.report_version_service.ReportVersionService.is_initial_report_version")
    @patch("reporting.models.report_attachment_confirmation.ReportAttachmentConfirmation.objects.get")
    def test_initial_version_skips_validation(self, mock_get, mock_initial):
        # Initial version should bypass all checks
        mock_initial.return_value = True
        version = make_recipe("reporting.tests.utils.report_version")

        result = validate(version)

        mock_initial.assert_called_once_with(version.id)
        assert result == {}

    @patch("service.report_version_service.ReportVersionService.is_initial_report_version")
    @patch("reporting.models.report_attachment_confirmation.ReportAttachmentConfirmation.objects.get")
    def test_missing_confirmation_entry(self, mock_get, mock_initial):
        # Non-initial version with no confirmation record
        mock_initial.return_value = False
        mock_get.side_effect = ObjectDoesNotExist
        version = make_recipe("reporting.tests.utils.report_version")

        result = validate(version)

        mock_initial.assert_called_once_with(version.id)
        mock_get.assert_called_once_with(report_version_id=version.id)
        assert result == {
            "missing_supplementary_report_attachment_confirmation": ReportValidationError(
                Severity.ERROR, "No attachment confirmation found for this supplementary report version."
            )
        }

    @pytest.mark.parametrize(
        "required_uploaded, existing_relevant, error_key, message",
        [
            (
                False,
                True,
                "missing_required_attachment_confirmation",
                "Must confirm that all required supplementary attachments have been uploaded.",
            ),
            (
                True,
                False,
                "missing_existing_attachment_confirmation",
                "Must confirm that all existing attachments are still relevant to the supplementary submission.",
            ),
        ],
    )
    @patch("service.report_version_service.ReportVersionService.is_initial_report_version")
    @patch("reporting.models.report_attachment_confirmation.ReportAttachmentConfirmation.objects.get")
    def test_partial_confirmations(
        self,
        mock_get,
        mock_initial,
        required_uploaded,
        existing_relevant,
        error_key,
        message,
    ):
        mock_initial.return_value = False
        confirmation = MagicMock()
        confirmation.confirm_supplementary_required_attachments_uploaded = required_uploaded
        confirmation.confirm_supplementary_existing_attachments_relevant = existing_relevant
        mock_get.return_value = confirmation
        version = make_recipe("reporting.tests.utils.report_version")

        result = validate(version)

        mock_initial.assert_called_once_with(version.id)
        mock_get.assert_called_once_with(report_version_id=version.id)
        assert error_key in result
        assert result[error_key] == ReportValidationError(Severity.ERROR, message)

    @patch("service.report_version_service.ReportVersionService.is_initial_report_version")
    @patch("reporting.models.report_attachment_confirmation.ReportAttachmentConfirmation.objects.get")
    def test_all_confirmations_present(self, mock_get, mock_initial):
        # Both flags true should produce no errors
        mock_initial.return_value = False
        confirmation = MagicMock()
        confirmation.confirm_supplementary_required_attachments_uploaded = True
        confirmation.confirm_supplementary_existing_attachments_relevant = True
        mock_get.return_value = confirmation
        version = make_recipe("reporting.tests.utils.report_version")

        result = validate(version)

        mock_initial.assert_called_once_with(version.id)
        mock_get.assert_called_once_with(report_version_id=version.id)
        assert result == {}
