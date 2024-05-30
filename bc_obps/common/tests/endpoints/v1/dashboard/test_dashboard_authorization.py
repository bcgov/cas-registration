from registration.tests.utils.helpers import CommonTestSetup
from registration.tests.utils.helpers import TestUtils
from common.constants import BASE_ENDPOINT

# make pythontests ARGS='common/tests/endpoints/v1/dashboard/test_dashboard_authorization.py' 
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
