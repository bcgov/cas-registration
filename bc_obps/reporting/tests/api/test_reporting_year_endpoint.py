from registration.tests.utils.helpers import CommonTestSetup, TestUtils

client = TestUtils.client


class TestReportingYearEndpoint(CommonTestSetup):
    endpoint_under_test = "/api/reporting/reporting-year"

    def test_unauthenticated_users_can_get_reporting_year(self):
        response = TestUtils.mock_get_with_auth_role(self, "cas_pending", self.endpoint_under_test)
        assert response.status_code == 200
