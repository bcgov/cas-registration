from unittest.mock import ANY, call, patch, MagicMock
from django.core.files.base import ContentFile
from model_bakery.baker import make_recipe
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from reporting.models.report_attachment import ReportAttachment
from reporting.tests.utils.report_access_validation import (
    assert_report_version_ownership_is_validated,
)


class TestReportAttachmentEndpoints(CommonTestSetup):
    def setup_method(self):
        self.report_version = make_recipe("reporting.tests.utils.report_version")
        self.endpoint_under_test = f"/api/reporting/report-version/{self.report_version.id}/attachments"

        super().setup_method()
        TestUtils.authorize_current_user_as_operator_user(self, operator=self.report_version.report.operator)

    @patch("reporting.service.report_attachment_service.ReportAttachmentService.set_attachment", autospec=True)
    @patch(
        "reporting.service.report_attachment_service.ReportAttachmentService.save_attachment_confirmation",
        autospec=True,
    )
    @patch("reporting.service.report_attachment_service.ReportAttachmentService.get_attachments", autospec=True)
    @patch(
        "reporting.service.report_attachment_service.ReportAttachmentService.get_attachment_confirmation", autospec=True
    )
    def test_save_attachments_calls_services_and_returns_the_get_method(
        self,
        mock_get_confirmation: MagicMock,
        mock_get_attachments: MagicMock,
        mock_save_confirmation: MagicMock,
        mock_set_attachment: MagicMock,
    ):
        # Arrange: the service will return []
        mock_get_attachments.return_value = []
        # confirmation might be None or a dict, here return a dict
        mock_get_confirmation.return_value = {
            "confirm_supplementary_existing_attachments_relevant": True,
            "confirm_supplementary_required_attachments_uploaded": True,
        }

        TestUtils.save_app_role(self, "industry_user")

        # Build multipart form data: two files + their types + confirmation flags
        form = {
            "confirm_supplementary_existing_attachments_relevant": "true",
            "confirm_supplementary_required_attachments_uploaded": "true",
            "files": [
                ContentFile(b"data1", "file1.pdf"),
                ContentFile(b"data2", "file2.txt"),
            ],
            "file_types": ["type1", "type2"],
        }

        # Act: post it
        response = TestUtils.client.post(
            self.endpoint_under_test,
            data=form,
            format="multipart",
            HTTP_AUTHORIZATION=self.auth_header_dumps,
        )

        # Assert: confirmation saved first
        mock_save_confirmation.assert_called_once_with(
            self.report_version.id,
            confirm_existing_relevant=True,
            confirm_required_uploaded=True,
        )

        # Assert: attachments saved
        expected_calls = [
            call(self.report_version.id, ANY, "type1", ANY),
            call(self.report_version.id, ANY, "type2", ANY),
        ]
        mock_set_attachment.assert_has_calls(expected_calls, any_order=False)

        # And returned JSON matches the combined schema
        assert response.status_code == 200
        assert response.json() == {
            "attachments": [],  # our mocked attachments
            "confirmation": {
                "confirm_supplementary_existing_attachments_relevant": True,
                "confirm_supplementary_required_attachments_uploaded": True,
            },
        }

    @patch("reporting.service.report_attachment_service.ReportAttachmentService.get_attachments", autospec=True)
    @patch(
        "reporting.service.report_attachment_service.ReportAttachmentService.get_attachment_confirmation", autospec=True
    )
    def test_get_attachments_returns_expected_schema(
        self,
        mock_get_confirmation: MagicMock,
        mock_get_attachments: MagicMock,
    ):
        # Arrange: fake attachment and confirmation
        fake_attachment = ReportAttachment(
            id=1,
            report_version=self.report_version,
            attachment_type="type1",
            attachment_name="example.pdf",
        )
        mock_get_attachments.return_value = [fake_attachment]

        mock_get_confirmation.return_value = make_recipe(
            "reporting.tests.utils.report_attachment_confirmation",
            report_version=self.report_version,
            confirm_supplementary_existing_attachments_relevant=True,
            confirm_supplementary_required_attachments_uploaded=True,
        )

        TestUtils.save_app_role(self, "industry_user")

        # Act
        response = TestUtils.client.get(
            self.endpoint_under_test,
            HTTP_AUTHORIZATION=self.auth_header_dumps,
        )

        # Assert
        assert response.status_code == 200
        assert response.json() == {
            "attachments": [
                {
                    "id": 1,
                    "attachment_type": "type1",
                    "attachment_name": "example.pdf",
                }
            ],
            "confirmation": {
                "confirm_supplementary_existing_attachments_relevant": True,
                "confirm_supplementary_required_attachments_uploaded": True,
            },
        }
        mock_get_attachments.assert_called_once_with(self.report_version.id)
        mock_get_confirmation.assert_called_once_with(self.report_version.id)

    @patch(
        "reporting.service.report_attachment_service.ReportAttachmentService.save_attachment_confirmation",
        autospec=True,
    )
    @patch(
        "reporting.service.report_attachment_service.ReportAttachmentService.get_attachment_confirmation", autospec=True
    )
    def test_save_attachments_error_if_bad_form_data(
        self,
        mock_get_attachments: MagicMock,
        mock_set_attachment: MagicMock,
    ):
        TestUtils.save_app_role(self, "industry_user")

        form = {
            "files": [
                ContentFile(bytes("testtesttesttest", encoding="utf-8"), "testfile.pdf"),
                ContentFile(bytes("testtesttesttest", encoding="utf-8"), "testfile2.txt"),
            ],
            "file_types": ["sometype"],  # missing a file type for the second file
        }

        response = TestUtils.client.post(
            self.endpoint_under_test,
            data=form,
            HTTP_AUTHORIZATION=self.auth_header_dumps,
        )

        assert response.status_code == 400
        mock_set_attachment.assert_not_called()
        mock_get_attachments.assert_not_called()

    @patch(
        "reporting.service.report_attachment_service.ReportAttachmentService.get_attachment",
        autospec=True,
    )
    def test_get_file_url(self, mock_get_attachment: MagicMock):
        mock_attachment = MagicMock()
        mock_attachment.get_file_url.return_value = "this is a very fake url"

        mock_get_attachment.return_value = mock_attachment

        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            f"/api/reporting/report-version/{self.report_version.id}/attachments/1234",
        )

        mock_get_attachment.assert_called_with(self.report_version.id, 1234)
        assert response.json() == "this is a very fake url"

    def test_validates_report_version_id(self):
        assert_report_version_ownership_is_validated("get_report_attachments")
        assert_report_version_ownership_is_validated("get_report_attachment_url", file_id=1234)
        assert_report_version_ownership_is_validated("save_report_attachments", method="post")
