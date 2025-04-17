from unittest.mock import ANY, call, patch, MagicMock
from django.core.files.base import ContentFile
from model_bakery.baker import make_recipe, prepare
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

    @patch("reporting.api.report_attachments.get_report_attachments", autospec=True)
    @patch(
        "reporting.service.report_attachment_service.ReportAttachmentService.set_attachment",
        autospec=True,
    )
    def test_save_attachments_calls_the_attachments_service_and_returns_the_get_method(
        self, mock_set_attachments: MagicMock, mock_get_method: MagicMock
    ):
        mock_get_method.return_value = [{"attachment_name": "success", "attachment_type": "success", "id": 123}]

        form = {
            "files": [
                ContentFile(bytes("testtesttesttest", encoding="utf-8"), "testfile.pdf"),
                ContentFile(bytes("testtesttesttest", encoding="utf-8"), "testfile2.txt"),
            ],
            "file_types": ["sometype", "someothertype"],
        }

        TestUtils.save_app_role(self, "industry_user")
        response = TestUtils.client.post(
            self.endpoint_under_test,
            data=form,
            HTTP_AUTHORIZATION=self.auth_header_dumps,
        )

        mock_set_attachments.assert_has_calls(
            [
                call(self.report_version.id, self.user.user_guid, "sometype", ANY),
                call(self.report_version.id, self.user.user_guid, "someothertype", ANY),
            ]
        )

        assert mock_set_attachments.mock_calls[0].args[3].name == "testfile.pdf"
        assert mock_set_attachments.mock_calls[1].args[3].name == "testfile2.txt"

        mock_get_method.assert_called_once()
        assert response.status_code == 200
        assert response.json() == [{"attachment_name": "success", "attachment_type": "success", "id": 123}]

    @patch("reporting.api.report_attachments.get_report_attachments", autospec=True)
    @patch(
        "reporting.service.report_attachment_service.ReportAttachmentService.set_attachment",
        autospec=True,
    )
    def test_save_attachments_error_if_bad_form_data(self, mock_set_attachments: MagicMock, mock_get_method: MagicMock):
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
        mock_set_attachments.assert_not_called()
        mock_get_method.assert_not_called()

    @patch(
        "reporting.service.report_attachment_service.ReportAttachmentService.get_attachments",
        autospec=True,
    )
    def test_get_attachments(self, mock_get_attachments: MagicMock):
        r = prepare(
            ReportAttachment,
            id=12,
            attachment_name="test1",
            attachment_type="something",
        )
        r2 = prepare(ReportAttachment, id=1211, attachment_name="abcde", attachment_type="a_type")

        mock_get_attachments.return_value = [r, r2]

        response = TestUtils.mock_get_with_auth_role(self, "industry_user", self.endpoint_under_test)
        assert response.json() == [
            {
                "attachment_name": "test1",
                "attachment_type": "something",
                "id": 12,
            },
            {
                "attachment_name": "abcde",
                "attachment_type": "a_type",
                "id": 1211,
            },
        ]

        mock_get_attachments.assert_called_once_with(self.report_version.id)

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

    
    @patch("reporting.api.report_attachments.get_report_attachments", autospec=True)
    @patch(
        "reporting.service.report_attachment_service.ReportAttachmentService.save_attachment_confirmations",
        autospec=True,
    )
    @patch(
        "reporting.service.report_attachment_service.ReportAttachmentService.set_attachment",
        autospec=True,
    )
    def test_save_attachments_calls_service_and_saves_confirmations(
        self,
        mock_set_attachments: MagicMock,
        mock_save_confirmations: MagicMock,
        mock_get_method: MagicMock,
    ):
        # Arrange
        mock_get_method.return_value = [
            {"attachment_name": "success", "attachment_type": "success", "id": 123}
        ]
        form = {
            "files": [
                ContentFile(b"test1", "a.pdf"),
                ContentFile(b"test2", "b.txt"),
            ],
            "file_types": ["type1", "type2"],
            # include dummy confirmation flags
            "confirm_supplementary_existing_attachments_relevant": "true",
            "confirm_supplementary_required_attachments_uploaded": "true",
        }

        TestUtils.save_app_role(self, "industry_user")

        # Act
        response = TestUtils.client.post(
            self.endpoint_under_test,
            data=form,
            HTTP_AUTHORIZATION=self.auth_header_dumps,
        )

        # Assert set_attachment called for each file
        mock_set_attachments.assert_has_calls([
            call(self.report_version.id, self.user.user_guid, "type1", ANY),
            call(self.report_version.id, self.user.user_guid, "type2", ANY),
        ])
        # Assert confirmations saved once with parsed booleans
        mock_save_confirmations.assert_called_once_with(
            self.report_version.id,
            confirm_required_uploaded=True,
            confirm_existing_relevant=True,
        )
        # Assert GET method called and correct response
        mock_get_method.assert_called_once()
        assert response.status_code == 200
        assert response.json() == [
            {"attachment_name": "success", "attachment_type": "success", "id": 123}
        ]

    def test_validates_report_version_id(self):
        assert_report_version_ownership_is_validated("get_report_attachments")
        assert_report_version_ownership_is_validated("get_report_attachment_url", file_id=1234)
        assert_report_version_ownership_is_validated("save_report_attachments", method="post")
