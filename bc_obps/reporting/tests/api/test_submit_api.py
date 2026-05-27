from reporting.schema.report_sign_off import ReportSignOffIn
from reporting.tests.utils.report_access_validation import assert_report_version_ownership_is_validated
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy
from unittest.mock import patch, MagicMock
from model_bakery.baker import make_recipe


class TestSubmitEndpoint(CommonTestSetup):
    def setup_method(self):
        super().setup_method()

        self.operator = make_recipe("registration.tests.utils.operator")

        self.operation = make_recipe(
            "registration.tests.utils.operation",
            operator=self.operator,
        )

        self.report = make_recipe(
            "reporting.tests.utils.report",
            operation=self.operation,
        )

        self.report_version = make_recipe(
            "reporting.tests.utils.report_version",
            report=self.report,
        )

        self.report_operation = make_recipe(
            "reporting.tests.utils.report_operation",
            report_version=self.report_version,
        )

    def test_validates_report_version_id(self):
        assert_report_version_ownership_is_validated("submit_report_version", "post")

    @staticmethod
    def _valid_payload() -> ReportSignOffIn:
        return ReportSignOffIn(
            acknowledgement_of_review=True,
            acknowledgement_of_certification=True,
            acknowledgement_of_records=True,
            acknowledgement_of_information=True,
            acknowledgement_of_errors=True,
            acknowledgement_of_possible_costs=True,
            acknowledgement_of_new_version=True,
            acknowledgement_of_corrections=True,
            signature="signature",
        )

    @patch(
        "reporting.service.report_submission_service.ReportSubmissionService.submit_report",
        autospec=True,
    )
    def test_returns_data_as_provided_by_the_service(self, mock_submit_report: MagicMock):
        """
        Testing that the API endpoint calls the service and return 200 and a version_id.
        """

        submitted_report_version = make_recipe("reporting.tests.utils.report_version")
        mock_submit_report.return_value = submitted_report_version

        TestUtils.authorize_current_user_as_operator_user(
            self,
            operator=self.report_version.report.operator,
        )

        response = TestUtils.mock_post_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            self._valid_payload().model_dump(),
            custom_reverse_lazy(
                "submit_report_version",
                kwargs={"version_id": self.report_version.id},
            ),
        )

        assert response.status_code == 200
        assert response.json() == submitted_report_version.id

    @patch(
        "reporting.service.report_submission_service.ReportSubmissionService.submit_report",
        autospec=True,
    )
    def test_returns_422_when_required_acknowledgements_are_missing(
        self,
        mock_submit_report: MagicMock,
    ):
        TestUtils.authorize_current_user_as_operator_user(
            self,
            operator=self.report_version.report.operator,
        )

        payload = self._valid_payload()
        payload.acknowledgement_of_review = False

        response = TestUtils.mock_post_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            payload.model_dump(),
            custom_reverse_lazy(
                "submit_report_version",
                kwargs={"version_id": self.report_version.id},
            ),
        )

        error = response.json()["errors"][0]

        assert response.status_code == 422
        assert error["key"] == "generic_error"
        assert error["error"]["severity"] == "Error"
        assert error["error"]["message"] == ("All required acknowledgements must be checked to submit the report.")
        assert error["error"]["key"] == "generic_error"
        assert error["error"]["context"] == {"section": "sign_off"}

        mock_submit_report.assert_not_called()
