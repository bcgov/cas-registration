from model_bakery.baker import make_recipe
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy


class TestGetReportVersionEndpoint(CommonTestSetup):
    def setup_method(self):
        self.report_version = make_recipe("reporting.tests.utils.report_version")
        self.report_operation = make_recipe(
            "reporting.tests.utils.report_operation", report_version=self.report_version
        )
        super().setup_method()
        TestUtils.authorize_current_user_as_operator_user(self, operator=self.report_version.report.operator)

    def test_returns_version_number_and_operation_name(self):
        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy("get_report_version", kwargs={"version_id": self.report_version.id}),
        )

        assert response.status_code == 200
        data = response.json()
        assert data["version_number"] == 1
        assert data["operation_name"] == self.report_operation.operation_name

    def test_version_number_increments_for_subsequent_versions(self):
        report = self.report_version.report
        self.report_version.status = "Submitted"
        self.report_version.save(update_fields=["status"])
        second_version = make_recipe("reporting.tests.utils.report_version", report=report)
        make_recipe("reporting.tests.utils.report_operation", report_version=second_version)

        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy("get_report_version", kwargs={"version_id": second_version.id}),
        )

        assert response.status_code == 200
        assert response.json()["version_number"] == 2
