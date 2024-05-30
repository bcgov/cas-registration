from registration.tests.utils.helpers import CommonTestSetup
from registration.tests.utils.helpers import TestUtils
from common.constants import BASE_ENDPOINT

class TestDashboardDataEndpointAuthorization(CommonTestSetup):
    endpoint = BASE_ENDPOINT + "dashboard-data?dashboard=bciers"
   
    # AUTHORIZATION
    def test_unauthorized_users_cannot_get_dashboard_data(self):
        response = TestUtils.mock_get_with_auth_role(self, "cas_pending")
        assert response.status_code == 401

    def test_authorized_users_can_get_dashboard_data(self):
        roles = ["cas_analyst", "cas_admin", "industry_user"]
        for role in roles:
            response = TestUtils.mock_get_with_auth_role(self, role)
            assert response.status_code == 200

    # CLIENT ERROR
    def test_missing_dashboard_parameter(self):
        response = TestUtils.mock_get_with_auth_role(self, "industry_user", endpoint=BASE_ENDPOINT + "dashboard-data")
        assert response.status_code == 422