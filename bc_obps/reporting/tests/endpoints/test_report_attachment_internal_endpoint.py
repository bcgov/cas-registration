from model_bakery.baker import make_recipe
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy
from reporting.models import ReportAttachment, ReportVersion


class TestReportAttachmentInternalEndpoints(CommonTestSetup):
    endpoint_under_test = custom_reverse_lazy("get_all_attachments")

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
        response = TestUtils.mock_get_with_auth_role(self, "cas_analyst", self.endpoint_under_test)

        # Assert the response
        assert response.status_code == 200
        assert response.json() == {
            "count": 2,
            "items": [
                {
                    "attachment_name": "test_attachment.txt",
                    "attachment_type": "verification_statement",
                    "id": attachment.id,
                    "operation": "test operation",
                    "operator": "test operator",
                    "report_version_id": report_version.id,
                    "reporting_year_id": report_version.report.reporting_year.reporting_year,
                },
                {
                    "attachment_name": "test_conf_req.txt",
                    "attachment_type": "confidentiality_request",
                    "id": attachment2.id,
                    "operation": "test operation",
                    "operator": "test operator",
                    "report_version_id": report_version.id,
                    "reporting_year_id": report_version.report.reporting_year.reporting_year,
                },
            ],
        }

    def test_numeric_filters_accept_free_text(self):
        report_version = make_recipe("reporting.tests.utils.report_version", status="Draft")
        make_recipe("reporting.tests.utils.report_attachment", report_version=report_version)
        ReportVersion.objects.filter(id=report_version.id).update(status="Submitted")
        reporting_year = report_version.report.reporting_year.reporting_year

        # Non-numeric input returns no rows instead of a 422
        for param in ["reporting_year_id", "report_version_id"]:
            response = TestUtils.mock_get_with_auth_role(
                self, "cas_analyst", f"{self.endpoint_under_test}?{param}=not-a-number"
            )
            assert response.status_code == 200
            assert response.json()["count"] == 0

        # Numeric input (full or partial) still filters
        for value in [reporting_year, str(reporting_year)[:3]]:
            response = TestUtils.mock_get_with_auth_role(
                self, "cas_analyst", f"{self.endpoint_under_test}?reporting_year_id={value}"
            )
            assert response.status_code == 200
            assert response.json()["count"] == 1

        response = TestUtils.mock_get_with_auth_role(
            self, "cas_analyst", f"{self.endpoint_under_test}?report_version_id={report_version.id}"
        )
        assert response.status_code == 200
        assert response.json()["count"] == 1
