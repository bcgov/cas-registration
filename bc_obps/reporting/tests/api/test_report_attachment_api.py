from unittest.mock import ANY, call, patch, MagicMock
from django.core.files.base import ContentFile
from model_bakery.baker import make_recipe, prepare
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from reporting.models.report_attachment import ReportAttachment


class TestReportAttachmentEndpoints(CommonTestSetup):
    def setup_method(self):
        self.report_version = make_recipe("reporting.tests.utils.report_version")
        self.endpoint_under_test = f"/api/reporting/report-version/{self.report_version.id}/attachments"

        super().setup_method()
        TestUtils.authorize_current_user_as_operator_user(self, operator=self.report_version.report.operator)

    @patch("reporting.api.report_attachments.get_report_attachments", autospec=True)
    @patch("reporting.service.report_attachment_service.ReportAttachmentService.set_attachment", autospec=True)
    def test_save_attachments_calls_the_attachments_service_and_returns_the_get_method(
        self, mock_set_attachments: MagicMock, mock_get_method: MagicMock
    ):
        mock_get_method.return_value = [{'attachment_name': 'success', 'attachment_type': 'success', 'id': 123}]

        form = {
            "files": [
                ContentFile(bytes("testtesttesttest", encoding='utf-8'), "testfile.pdf"),
                ContentFile(bytes("testtesttesttest", encoding='utf-8'), "testfile2.txt"),
            ],
            "file_types": ["sometype", "someothertype"],
        }

        TestUtils.save_app_role(self, "industry_user")
        response = TestUtils.client.post(self.endpoint_under_test, data=form, HTTP_AUTHORIZATION=self.auth_header_dumps)

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
        assert response.json() == [{'attachment_name': 'success', 'attachment_type': 'success', 'id': 123}]

    @patch("reporting.api.report_attachments.get_report_attachments", autospec=True)
    @patch("reporting.service.report_attachment_service.ReportAttachmentService.set_attachment", autospec=True)
    def test_save_attachments_error_if_bad_form_data(self, mock_set_attachments: MagicMock, mock_get_method: MagicMock):
        TestUtils.save_app_role(self, "industry_user")

        form = {
            "files": [
                ContentFile(bytes("testtesttesttest", encoding='utf-8'), "testfile.pdf"),
                ContentFile(bytes("testtesttesttest", encoding='utf-8'), "testfile2.txt"),
            ],
            "file_types": ["sometype"],  # missing a file type for the second file
        }

        response = TestUtils.client.post(self.endpoint_under_test, data=form, HTTP_AUTHORIZATION=self.auth_header_dumps)

        assert response.status_code == 400
        mock_set_attachments.assert_not_called()
        mock_get_method.assert_not_called()

    @patch("reporting.service.report_attachment_service.ReportAttachmentService.get_attachments", autospec=True)
    def test_get_attachments(self, mock_get_attachments: MagicMock):

        r = prepare(ReportAttachment, id=12, attachment_name="test1", attachment_type="something")
        r2 = prepare(ReportAttachment, id=1211, attachment_name="abcde", attachment_type="a_type")

        mock_get_attachments.return_value = [r, r2]

        response = TestUtils.mock_get_with_auth_role(self, "industry_user", self.endpoint_under_test)
        assert response.json() == [
            {
                'attachment_name': 'test1',
                'attachment_type': 'something',
                'id': 12,
            },
            {
                'attachment_name': 'abcde',
                'attachment_type': 'a_type',
                'id': 1211,
            },
        ]

        mock_get_attachments.assert_called_once_with(self.report_version.id)
