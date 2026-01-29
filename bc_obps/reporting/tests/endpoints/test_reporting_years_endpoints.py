from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from datetime import datetime
import time_machine


class TestReportingYearsEndpoint(CommonTestSetup):

    def test_get_current_reporting_year(self):
        endpoint_to_test = "/api/reporting/reporting-year"

        # arbitrarily chose role cas_analyst
        response = TestUtils.mock_get_with_auth_role(self, 'cas_analyst', endpoint_to_test)
        assert response.status_code == 200

    def test_get_all_reporting_years_no_filter(self):
        endpoint_to_test = "/api/reporting/reporting-years"

        response = TestUtils.mock_get_with_auth_role(self, 'cas_director', endpoint_to_test)
        assert response.status_code == 200
        response_json = response.json()
        returned_years = [item["reporting_year"] for item in response_json]
        assert [year in returned_years for year in [2023, 2024, 2025, 2026]]

    def test_get_all_reporting_years_exclude_past(self):
        endpoint_to_test = "/api/reporting/reporting-years?exclude_past=true"

        response = TestUtils.mock_get_with_auth_role(self, 'cas_director', endpoint_to_test)
        assert response.status_code == 200
        response_json = response.json()
        returned_years = [item["reporting_year"] for item in response_json]
        assert 2023 not in returned_years
        with time_machine.travel(datetime(2025, 1, 1)):
            current_year = datetime.now().year
        assert current_year in returned_years
