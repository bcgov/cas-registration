import pytest
from unittest.mock import patch, MagicMock
from reporting.models.report_verification import ReportVerification
from reporting.models.report_attachment import ReportAttachment
from reporting.service.report_submission_service import ReportSubmissionService


class TestReportSubmissionService:
    @patch("reporting.service.report_verification_service.ReportVerificationService.get_report_needs_verification")
    @patch("reporting.models.report_verification.ReportVerification.objects.get")
    @patch("reporting.models.report_attachment.ReportAttachment.objects.get")
    def test_validate_verification_needed_success(
        self, mock_get_attachment, mock_get_verification, mock_get_needs_verification
    ):
        # Arrange
        version_id = 1
        mock_get_needs_verification.return_value = True
        mock_get_verification.return_value = MagicMock()  # Ensure verification exists
        mock_get_attachment.return_value = MagicMock()  # Ensure Attachment exist

        # Act
        ReportSubmissionService.validate_report(version_id)

        # Assert
        mock_get_attachment.assert_called_once_with(
            report_version_id=version_id,
            attachment_type=ReportAttachment.ReportAttachmentType.VERIFICATION_STATEMENT,
        )
        mock_get_verification.assert_called_once_with(report_version_id=version_id)

    @patch("reporting.service.report_verification_service.ReportVerificationService.get_report_needs_verification")
    @patch("reporting.models.report_verification.ReportVerification.objects.get")
    @patch("reporting.models.report_attachment.ReportAttachment.objects.get")
    def test_validate_verification_not_needed(
        self, mock_get_attachment, mock_get_verification, mock_get_needs_verification
    ):
        # Arrange
        version_id = 1
        mock_get_needs_verification.return_value = False

        # Act
        ReportSubmissionService.validate_report(version_id)

        # Assert
        mock_get_attachment.assert_not_called()
        mock_get_verification.assert_not_called()

    @patch("reporting.service.report_verification_service.ReportVerificationService.get_report_needs_verification")
    @patch("reporting.models.report_verification.ReportVerification.objects.get")
    @patch("reporting.models.report_attachment.ReportAttachment.objects.get")
    def test_validate_report_missing_verification_statement(
        self, mock_get_attachment, mock_get_verification, mock_get_needs_verification
    ):
        # Arrange
        version_id = 1
        mock_get_needs_verification.return_value = True
        mock_get_verification.return_value = MagicMock()  # Ensure verification exists
        mock_get_attachment.side_effect = ReportAttachment.DoesNotExist

        # Act & Assert
        with pytest.raises(Exception) as excinfo:
            ReportSubmissionService.validate_report(version_id)
        assert str(excinfo.value) == "verification_statement"

        mock_get_attachment.assert_called_once_with(
            report_version_id=version_id,
            attachment_type=ReportAttachment.ReportAttachmentType.VERIFICATION_STATEMENT,
        )

    @patch("reporting.service.report_verification_service.ReportVerificationService.get_report_needs_verification")
    @patch("reporting.models.report_verification.ReportVerification.objects.get")
    @patch("reporting.models.report_attachment.ReportAttachment.objects.get")
    def test_validate_report_missing_report_verification(
        self, mock_get_attachment, mock_get_verification, mock_get_needs_verification
    ):
        # Arrange
        version_id = 1
        mock_get_needs_verification.return_value = True
        mock_get_verification.side_effect = ReportVerification.DoesNotExist  # Verification does not exist

        # Act & Assert
        with pytest.raises(Exception) as excinfo:
            ReportSubmissionService.validate_report(version_id)
        assert str(excinfo.value) == "missing_report_verification"

        mock_get_verification.assert_called_once_with(report_version_id=version_id)
        mock_get_attachment.assert_not_called()
