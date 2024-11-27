from django.core.files.base import ContentFile
from model_bakery.baker import make_recipe
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from reporting.models.report_attachment import ReportAttachment


class TestReportAttachmentsIntegration(CommonTestSetup):
    def setup_method(self):
        self.report_version = make_recipe("reporting.tests.utils.report_version")
        self.endpoint_under_test = f"/api/reporting/report-version/{self.report_version.id}/attachments"

        super().setup_method()
        TestUtils.authorize_current_user_as_operator_user(self, operator=self.report_version.report.operator)

    def test_save_attachments_endpoint_end_to_end(self):
        form = {
            "files": [ContentFile(bytes("testtesttesttest", encoding='utf-8'), "testfile.pdf")],
            "file_types": ["verification_statement"],
        }

        TestUtils.save_app_role(self, "industry_user")
        response = TestUtils.client.post(self.endpoint_under_test, data=form, HTTP_AUTHORIZATION=self.auth_header_dumps)

        assert response.json() == [
            {
                'id': ReportAttachment.objects.last().id,
                'attachment_type': 'verification_statement',
                'attachment_name': 'testfile.pdf',
            }
        ]
