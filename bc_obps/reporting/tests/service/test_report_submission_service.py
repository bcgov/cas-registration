import pytest
from unittest.mock import patch, MagicMock
from reporting.models.report_verification import ReportVerification
from reporting.models.report_attachment import ReportAttachment
from reporting.service.report_submission_service import ReportSubmissionService
from reporting.models.report_version import ReportVersion
from reporting.schema.report_sign_off import ReportSignOffAcknowledgements, ReportSignOffIn
import uuid


@pytest.mark.django_db
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

    @patch("reporting.service.report_sign_off_service.ReportSignOffService.save_report_sign_off")
    @patch("reporting.service.report_submission_service.report_submitted.send")
    @patch("reporting.models.report_version.ReportVersion.objects.filter")
    @patch("reporting.models.report_version.ReportVersion.objects.get")
    @patch("reporting.service.report_submission_service.ReportSubmissionService.validate_report")
    def test_submit_report(
        self,
        mock_validate_report,
        mock_get,
        mock_filter,
        mock_signal_send,
        mock_save_report_sign_off,
    ):
        # Arrange
        version_id = 1
        user_guid = uuid.uuid4()

        # Create a fake Report instance object
        fake_report = MagicMock()
        fake_report.id = 1
        fake_report_version = MagicMock()
        fake_report_version.report = fake_report
        fake_report_version.is_latest_submitted = False
        fake_report_version.status = ReportVersion.ReportVersionStatus.Draft

        # Configure the get() call to return our fake report version.
        mock_get.return_value = fake_report_version

        # Configure the filter() call to return a mock that supports update.
        mock_filter_instance = MagicMock()
        mock_filter.return_value = mock_filter_instance

        fake_sign_off_data = ReportSignOffIn(
            acknowledgements=ReportSignOffAcknowledgements(
                acknowledgement_of_review=True,
                acknowledgement_of_records=True,
                acknowledgement_of_information=True,
                acknowledgement_of_possible_costs=True,
                acknowledgement_of_new_version=None,
            ),
            signature="signature",
        )

        # Act: Call submit_report.
        result = ReportSubmissionService.submit_report(version_id, user_guid, fake_sign_off_data)

        # Assert that validate_report was called.
        mock_validate_report.assert_called_once_with(version_id)

        # Assert that save_report_sign_off was called with the correct parameters.
        mock_save_report_sign_off.assert_called_once_with(version_id, fake_sign_off_data)

        # Assert that ReportVersion was fetched with the correct version_id.
        mock_get.assert_called_once_with(id=version_id)

        # Assert that any previously submitted latest versions were updated.
        mock_filter.assert_called_once_with(
            report=fake_report,
            status=ReportVersion.ReportVersionStatus.Submitted,
            is_latest_submitted=True,
        )
        mock_filter_instance.update.assert_called_once_with(is_latest_submitted=False)

        # Assert that the fake report version’s properties were updated.
        assert fake_report_version.is_latest_submitted is True
        assert fake_report_version.status == ReportVersion.ReportVersionStatus.Submitted

        # Assert that the fake report version was saved.
        fake_report_version.save.assert_called_once()

        # Assert that the report_submitted signal was sent with the correct parameters.
        mock_signal_send.assert_called_once_with(
            sender=ReportSubmissionService, version_id=version_id, user_guid=user_guid
        )

        # Assert that the returned value is the fake report version.
        assert result == fake_report_version
