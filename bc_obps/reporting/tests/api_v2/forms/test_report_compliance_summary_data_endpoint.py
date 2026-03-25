from model_bakery.baker import make_recipe
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from reporting.tests.utils.report_access_validation import assert_report_version_ownership_is_validated


class TestComplianceSummaryFormV2Endpoints(CommonTestSetup):
    def setup_method(self):
        self.report_version = make_recipe(
            "reporting.tests.utils.report_version", report__reporting_year__reporting_year=1222
        )
        self.report_operation = make_recipe(
            "reporting.tests.utils.report_operation", report_version=self.report_version
        )
        self.facility_report = make_recipe(
            "reporting.tests.utils.facility_report",
            report_version=self.report_version,
            facility_type="test facility type",
        )
        self.endpoint_under_test = f"/api/reporting/v2/report-version/{self.report_version.id}/forms/compliance-data"
        return super().setup_method()

    def test_get_returns_the_right_data(self):
        TestUtils.authorize_current_user_as_operator_user(self, operator=self.report_version.report.operator)
        response = TestUtils.mock_get_with_auth_role(self, "industry_user", self.endpoint_under_test)
        data = response.json()

        assert response.status_code == 200, data

        assert data["report_data"] == {
            "report_version_id": self.report_version.id,
            "reporting_year": 1222,
        }

        assert data["payload"]["is_operation_opted_out"] is False

        assert "facility_data" in data
        assert "operation_data" in data
        assert "payload" in data

    def test_validates_report_version_id(self):
        assert_report_version_ownership_is_validated("get_compliance_summary_form_data")
