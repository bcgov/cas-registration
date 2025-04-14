from django.core.exceptions import ValidationError
from model_bakery.baker import make_recipe
import pytest
from unittest.mock import patch, MagicMock
from reporting.service.report_submission_service import ReportSubmissionService
from reporting.models.report_version import ReportVersion
from reporting.schema.report_sign_off import ReportSignOffAcknowledgements, ReportSignOffIn
import uuid

from reporting.service.report_validation.report_validation_error import ReportValidationError, Severity


@pytest.mark.django_db
class TestReportSubmissionService:
    @patch("reporting.service.report_sign_off_service.ReportSignOffService.save_report_sign_off")
    @patch("reporting.service.report_submission_service.report_submitted.send")
    @patch("reporting.models.report_version.ReportVersion.objects.filter")
    @patch("reporting.models.report_version.ReportVersion.objects.get")
    @patch(
        "reporting.service.report_validation.report_validation_service.ReportValidationService.validate_report_version"
    )
    def test_submit_report(
        self,
        mock_validate_report_version,
        mock_get,
        mock_filter,
        mock_signal_send,
        mock_save_report_sign_off,
    ):
        # Arrange
        version_id = 1
        user_guid = uuid.uuid4()
        mock_validate_report_version.return_value = {}

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
                acknowledgement_of_corrections=None,
            ),
            signature="signature",
        )

        # Act: Call submit_report.
        result = ReportSubmissionService.submit_report(version_id, user_guid, fake_sign_off_data)

        # Assert that validate_report was called.
        mock_validate_report_version.assert_called_once_with(version_id)

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

    @patch(
        "reporting.service.report_validation.report_validation_service.ReportValidationService.validate_report_version"
    )
    def test_submit_report_throws_with_errors(self, mock_validate_report_version: MagicMock):
        mock_validate_report_version.return_value = {"test_key": ReportValidationError(Severity.ERROR, "test message")}

        report_version = make_recipe("reporting.tests.utils.report_version")

        with pytest.raises(ValidationError, match="['test message']"):
            ReportSubmissionService.submit_report(report_version.id, uuid.UUID(int=0), {})
