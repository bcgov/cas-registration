from model_bakery.baker import make_recipe
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from reporting.models.report_attachment import ReportAttachment


class TestReportAttachmentInternalEndpoints(CommonTestSetup):
    def setup_method(self):
        self.report_version = make_recipe("reporting.tests.utils.report_version")
        self.endpoint_under_test = "/api/reporting/attachments"

        super().setup_method()
        TestUtils.save_app_role(self, "cas_analyst")

    def test_gets_only_submitted_attachments(self):

        # Create a report version with attachments
        report_version = make_recipe("reporting.tests.utils.report_version", status="Submitted")
        make_recipe(
            "reporting.tests.utils.report_attachment",
            report_version=report_version,
            attachment_type=ReportAttachment.ReportAttachmentType.VERIFICATION_STATEMENT,
            attachment_name="test_attachment.txt",
        )

        # Call the endpoint
        response = TestUtils.client.get(self.endpoint_under_test, HTTP_AUTHORIZATION=self.auth_header_dumps)

        # Assert the response
        assert response.status_code == 200
        assert response == "abc"
