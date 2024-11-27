from model_bakery.baker import make_recipe
from registration.tests.utils.helpers import CommonTestSetup, TestUtils


class TestReportNonAttributableEndpoints(CommonTestSetup):
    def setup_method(self):
        report_version = make_recipe("reporting.tests.utils.report_version")
        self.facility_report = make_recipe("reporting.tests.utils.facility_report", report_version=report_version)
        self.report_operation = make_recipe("reporting.tests.utils.report_operation", report_version=report_version)

        self.endpoint_under_test = f"/api/reporting/report-version/{self.facility_report.report_version_id}/facilities/{self.facility_report.facility_id}/allocate-emissions"
        return super().setup_method()

    def test_get_returns_the_right_data_when_empty(self):
        TestUtils.authorize_current_user_as_operator_user(
            self, operator=self.facility_report.report_version.report.operator
        )
        response = TestUtils.mock_get_with_auth_role(self, "industry_user", self.endpoint_under_test)
        assert response.json() == {'report_product_emission_allocations': [], 'facility_total_emissions': 0}
