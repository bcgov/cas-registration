from model_bakery.baker import make_recipe
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from reporting.models import ReportAttachment, ReportVersion


class TestReportAttachmentInternalEndpoints(CommonTestSetup):
    def setup_method(self):
        self.report_version = make_recipe("reporting.tests.utils.report_version")
        self.endpoint_under_test = "/api/reporting/attachments"

        super().setup_method()
        TestUtils.save_app_role(self, "cas_analyst")

    def test_gets_only_submitted_attachments(self):
        # Create a report version with attachments
        report_version = make_recipe(
            "reporting.tests.utils.report_version",
            status="Draft",
            report__operation__name="test operation",
            report__operator__legal_name="test operator",
        )

        attachment = make_recipe(
            "reporting.tests.utils.report_attachment",
            report_version=report_version,
            attachment_type=ReportAttachment.ReportAttachmentType.VERIFICATION_STATEMENT,
            attachment_name="test_attachment.txt",
        )
        attachment2 = make_recipe(
            "reporting.tests.utils.report_attachment",
            report_version=report_version,
            attachment_type=ReportAttachment.ReportAttachmentType.CONFIDENTIALITY_REQUEST,
            attachment_name="test_conf_req.txt",
        )

        report_version2 = make_recipe(
            "reporting.tests.utils.report_version",
            status="Draft",
            report__operation__name="test operation 2",
            report__operator__legal_name="test operator 2",
        )
        make_recipe(
            "reporting.tests.utils.report_attachment",
            report_version=report_version2,
            attachment_type=ReportAttachment.ReportAttachmentType.CONFIDENTIALITY_REQUEST,
            attachment_name="test_conf_req2.txt",
        )

        ReportVersion.objects.filter(id=report_version.id).update(status="Submitted")

        # Call the endpoint
        response = TestUtils.client.get(self.endpoint_under_test, HTTP_AUTHORIZATION=self.auth_header_dumps)

        # Assert the response
        assert response.status_code == 200
        assert response.json() == {
            "count": 2,
            "items": [
                {
                    "attachment_name": "test_conf_req.txt",
                    "attachment_type": "confidentiality_request",
                    "id": attachment2.id,
                    "operation": "test operation",
                    "operator": "test operator",
                    "report_version_id": report_version.id,
                },
                {
                    "attachment_name": "test_attachment.txt",
                    "attachment_type": "verification_statement",
                    "id": attachment.id,
                    "operation": "test operation",
                    "operator": "test operator",
                    "report_version_id": report_version.id,
                },
            ],
        }
