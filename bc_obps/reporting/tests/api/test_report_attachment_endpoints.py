from unittest.mock import patch, MagicMock
from django.core.files.base import ContentFile
from django.core.files.uploadedfile import SimpleUploadedFile
from model_bakery.baker import make_recipe
from registration.tests.utils.helpers import CommonTestSetup, TestUtils


class TestReportAttachmentEndpoints(CommonTestSetup):
    def setup_method(self):
        self.report_version = make_recipe("reporting.tests.utils.report_version")
        self.endpoint_under_test = f"/api/reporting/report-version/{self.report_version.id}/attachments"
        return super().setup_method()

    def test_save_attachments_endpoint_end_to_end(self):
        TestUtils.authorize_current_user_as_operator_user(self, operator=self.report_version.report.operator)
        TestUtils.save_app_role(self, "industry_user")

        form = {
            "files": [ContentFile(bytes("testtesttesttest", encoding='utf-8'), "testfile.pdf")],
            "file_types": ["verification_statement"],
        }

        response = TestUtils.client.post(self.endpoint_under_test, data=form, HTTP_AUTHORIZATION=self.auth_header_dumps)
        assert response.json() == {'report_products': [], 'allowed_products': []}

    @patch("reporting.api.report_attachments.load_report_attachments")
    @patch("reporting.service.report_attachment_service.ReportAttachmentService.set_attachment")
    def test_save_attachments_calls_the_attachments_service_and_returns_the_get_method(
        self, mock_set_attachments: MagicMock, mock_get_method: MagicMock
    ):
        mock_get_method.return_value = [{'attachment_name': 'success', 'attachment_type': 'success', 'id': 123}]

        TestUtils.authorize_current_user_as_operator_user(self, operator=self.report_version.report.operator)
        TestUtils.save_app_role(self, "industry_user")

        form = {
            "files": [
                ContentFile(bytes("testtesttesttest", encoding='utf-8'), "testfile.pdf"),
                ContentFile(bytes("testtesttesttest", encoding='utf-8'), "testfile2.txt"),
            ],
            "file_types": ["sometype", "someothertype"],
        }

        response = TestUtils.client.post(self.endpoint_under_test, data=form, HTTP_AUTHORIZATION=self.auth_header_dumps)

        assert len(mock_set_attachments.mock_calls) == 2
        assert mock_set_attachments.mock_calls[0].args[0] == self.report_version.id
        assert mock_set_attachments.mock_calls[0].args[1] == self.user.user_guid
        assert mock_set_attachments.mock_calls[0].args[2] == "sometype"
        assert mock_set_attachments.mock_calls[0].args[3].name == "testfile.pdf"

        assert mock_set_attachments.mock_calls[1].args[0] == self.report_version.id
        assert mock_set_attachments.mock_calls[1].args[1] == self.user.user_guid
        assert mock_set_attachments.mock_calls[1].args[2] == "someothertype"
        assert mock_set_attachments.mock_calls[1].args[3].name == "testfile2.txt"

        mock_get_method.assert_called_once()
        assert response.status_code == 200
        assert response.json() == [{'attachment_name': 'success', 'attachment_type': 'success', 'id': 123}]

    def test_save_attachments_error_if_bad_form_data(self):
        TestUtils.authorize_current_user_as_operator_user(self, operator=self.report_version.report.operator)
        TestUtils.save_app_role(self, "industry_user")

        form = {
            "files": [
                ContentFile(bytes("testtesttesttest", encoding='utf-8'), "testfile.pdf"),
                ContentFile(bytes("testtesttesttest", encoding='utf-8'), "testfile2.txt"),
            ],
            "file_types": ["sometype"],  # missing a file type for the second file
        }

        response = TestUtils.client.post(self.endpoint_under_test, data=form, HTTP_AUTHORIZATION=self.auth_header_dumps)

        assert response.status_code == 422

    def test_get_attachments(self):

        file = SimpleUploadedFile("testfile_is_here")

        TestUtils.mock_get_with_auth_role(self, "industry_user", self.endpoint_under_test)

        assert file == {}
