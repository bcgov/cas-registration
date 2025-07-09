from reporting.schema.report_sign_off import ReportSignOffIn
from reporting.tests.utils.report_access_validation import assert_report_version_ownership_is_validated
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy
from unittest.mock import patch, MagicMock
from model_bakery.baker import make_recipe


class TestSubmitEndpoint(CommonTestSetup):
    def test_validates_report_version_id(self):
        assert_report_version_ownership_is_validated("submit_report_version", "post")

    @patch(
        "reporting.service.report_submission_service.ReportSubmissionService.submit_report",
        autospec=True,
    )
    def test_returns_data_as_provided_by_the_service(self, mock_submit_report: MagicMock):
        """
        Testing that the API endpoint calls the service and return 200 and a version_id.
        """

        report_version = make_recipe("reporting.tests.utils.report_version")
        mock_submit_report.return_value = report_version
        TestUtils.authorize_current_user_as_operator_user(self, operator=report_version.report.operator)

        payload = ReportSignOffIn(
            acknowledgement_of_review=True,
            acknowledgement_of_certification=True,
            acknowledgement_of_records=True,
            acknowledgement_of_information=True,
            acknowledgement_of_errors=True,
            acknowledgement_of_possible_costs=True,
            acknowledgement_of_new_version=True,
            acknowledgement_of_corrections=True,
            signature='signature',
        )

        response = TestUtils.mock_post_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            payload.model_dump(),
            custom_reverse_lazy("submit_report_version", kwargs={"version_id": report_version.id}),
        )

        assert response.status_code == 200
        assert response.json() == report_version.id
