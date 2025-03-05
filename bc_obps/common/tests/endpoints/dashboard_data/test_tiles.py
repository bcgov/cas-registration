from registration.tests.utils.helpers import CommonTestSetup
from registration.tests.utils.helpers import TestUtils
from registration.utils import custom_reverse_lazy


class TestDashboardDataEndpointAuthorization(CommonTestSetup):
    def test_missing_dashboard_parameter(self):
        response = TestUtils.mock_get_with_auth_role(self, "industry_user", custom_reverse_lazy("list_dashboard_data"))
        assert response.status_code == 422
