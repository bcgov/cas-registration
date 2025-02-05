import pytest
from unittest.mock import patch, MagicMock
from uuid import UUID
from reporting.models.report_attachment import ReportAttachment
from reporting.models.report_version import ReportVersion
from reporting.service.report_submission_service import ReportSubmissionService


class TestReportSubmissionService:
    @patch("reporting.service.report_submission_service.ReportVerificationService.get_report_needs_verification")
    @patch("reporting.models.report_attachment.ReportAttachment.objects.get")
    def test_validate_report_with_verification_statement(self, mock_get_attachment, mock_get_verification):
        # Arrange
        version_id = 1
        mock_get_verification.return_value = True  # Verification statement is mandatory

        # Act
        ReportSubmissionService.validate_report(version_id)

        # Assert
        mock_get_attachment.assert_called_once_with(
            report_version_id=version_id,
            attachment_type=ReportAttachment.ReportAttachmentType.VERIFICATION_STATEMENT,
        )

    @patch("reporting.service.report_submission_service.ReportVerificationService.get_report_needs_verification")
    @patch("reporting.models.report_attachment.ReportAttachment.objects.get")
    def test_validate_report_without_verification_statement(self, mock_get_attachment, mock_get_verification):
        # Arrange
        version_id = 1
        mock_get_verification.return_value = False  # Verification statement is not mandatory

        # Act
        ReportSubmissionService.validate_report(version_id)

        # Assert
        mock_get_attachment.assert_not_called()

    @patch("reporting.service.report_submission_service.ReportVerificationService.get_report_needs_verification")
    @patch("reporting.models.report_attachment.ReportAttachment.objects.get")
    def test_validate_report_raises_exception_if_verification_missing(self, mock_get_attachment, mock_get_verification):
        # Arrange
        version_id = 1
        mock_get_verification.return_value = True  # Verification statement is mandatory
        mock_get_attachment.side_effect = ReportAttachment.DoesNotExist

        # Act & Assert
        with pytest.raises(Exception, match="verification_statement"):
            ReportSubmissionService.validate_report(version_id)

    @patch("reporting.models.report_version.ReportVersion.objects.get")
    @patch("reporting.service.report_submission_service.ReportSubmissionService.validate_report")
    def test_submit_report(self, mock_validate_report, mock_get_report_version):
        # Arrange
        version_id = 1
        user_guid = UUID("12345678-1234-5678-1234-567812345678")

        mock_report_version = MagicMock()
        mock_get_report_version.return_value = mock_report_version

        # Act
        result = ReportSubmissionService.submit_report(version_id, user_guid)

        # Assert
        mock_validate_report.assert_called_once_with(version_id)
        mock_get_report_version.assert_called_once_with(id=version_id)
        assert mock_report_version.status == ReportVersion.ReportVersionStatus.Submitted
        mock_report_version.save.assert_called_once()
        assert result == mock_report_version
