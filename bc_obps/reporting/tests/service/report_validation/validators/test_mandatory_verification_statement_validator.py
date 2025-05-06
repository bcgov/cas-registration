from unittest.mock import MagicMock, patch
from model_bakery.baker import make_recipe
import pytest
from reporting.models.report_attachment import ReportAttachment
from reporting.models.report_verification import ReportVerification
from reporting.service.report_validation.report_validation_error import (
    ReportValidationError,
    Severity,
)
from reporting.service.report_validation.validators import (
    mandatory_verification_statement,
)


@pytest.mark.django_db
class TestMandatoryVerificationStatementValidator:
    @patch("reporting.service.report_verification_service.ReportVerificationService.get_report_needs_verification")
    @patch("reporting.models.report_verification.ReportVerification.objects.get")
    @patch("reporting.models.report_attachment.ReportAttachment.objects.get")
    def test_validate_with_verification_needed_success(
        self, mock_get_attachment, mock_get_verification, mock_get_needs_verification
    ):
        report_version = make_recipe("reporting.tests.utils.report_version")
        mock_get_needs_verification.return_value = {"show_verification_page": True, "verification_required": True}
        mock_get_verification.return_value = MagicMock()  # Ensure verification exists
        mock_get_attachment.return_value = MagicMock()  # Ensure Attachment exists

        # Act
        result = mandatory_verification_statement.validate(report_version)

        # Assert
        mock_get_attachment.assert_called_once_with(
            report_version_id=report_version.id,
            attachment_type=ReportAttachment.ReportAttachmentType.VERIFICATION_STATEMENT,
        )
        mock_get_verification.assert_called_once_with(report_version_id=report_version.id)

        assert not result

    @patch("reporting.service.report_verification_service.ReportVerificationService.get_report_needs_verification")
    @patch("reporting.models.report_verification.ReportVerification.objects.get")
    @patch("reporting.models.report_attachment.ReportAttachment.objects.get")
    def test_validate_with_verification_not_needed_success(
        self, mock_get_attachment, mock_get_verification, mock_get_needs_verification
    ):
        # Arrange
        report_version = make_recipe("reporting.tests.utils.report_version")
        mock_get_needs_verification.return_value = {"show_verification_page": False, "verification_required": False}

        # Act
        result = mandatory_verification_statement.validate(report_version)

        # Assert
        mock_get_attachment.assert_not_called()
        mock_get_verification.assert_not_called()
        assert not result

    @patch("reporting.service.report_verification_service.ReportVerificationService.get_report_needs_verification")
    @patch("reporting.models.report_verification.ReportVerification.objects.get")
    @patch("reporting.models.report_attachment.ReportAttachment.objects.get")
    def test_validate_report_missing_verification_statement(
        self, mock_get_attachment, mock_get_verification, mock_get_needs_verification
    ):
        # Arrange
        report_version = make_recipe("reporting.tests.utils.report_version")
        mock_get_needs_verification.return_value = {"show_verification_page": True, "verification_required": True}
        mock_get_verification.return_value = MagicMock()  # Ensure verification exists
        mock_get_attachment.side_effect = ReportAttachment.DoesNotExist

        # Act & Assert
        result = mandatory_verification_statement.validate(report_version)

        mock_get_attachment.assert_called_once_with(
            report_version_id=report_version.id,
            attachment_type=ReportAttachment.ReportAttachmentType.VERIFICATION_STATEMENT,
        )

        assert result == {
            "verification_statement": ReportValidationError(
                Severity.ERROR,
                "Mandatory verification statement document was not uploaded with this report.",
            )
        }

    @patch("reporting.service.report_verification_service.ReportVerificationService.get_report_needs_verification")
    @patch("reporting.models.report_verification.ReportVerification.objects.get")
    @patch("reporting.models.report_attachment.ReportAttachment.objects.get")
    def test_validate_report_missing_report_verification(
        self, mock_get_attachment, mock_get_verification, mock_get_needs_verification
    ):
        # Arrange
        report_version = make_recipe("reporting.tests.utils.report_version")
        mock_get_needs_verification.return_value = {"show_verification_page": True, "verification_required": True}
        mock_get_verification.side_effect = ReportVerification.DoesNotExist  # Verification does not exist

        # Act & Assert
        result = mandatory_verification_statement.validate(report_version)

        mock_get_verification.assert_called_once_with(report_version_id=report_version.id)

        assert result == {
            "missing_report_verification": ReportValidationError(
                Severity.ERROR, "Report verification form not found in the report."
            )
        }
