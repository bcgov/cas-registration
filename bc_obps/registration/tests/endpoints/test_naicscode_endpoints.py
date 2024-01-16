import pytest
from registration.tests.utils.helpers import CommonTestSetup, TestUtils

pytestmark = pytest.mark.django_db

base_endpoint = "/api/registration/"


class TestNaicsCodeEndpoint(CommonTestSetup):
    endpoint = base_endpoint + "naics_codes"

    def test_unauthorized_users_cannot_get(self):
        response = TestUtils.mock_get_with_auth_role(self, "cas_pending")
        assert response.status_code == 401

    def test_get_method_for_200_status(self):
        roles = ["cas_analyst", "cas_admin", "industry_user"]
        for role in roles:
            response = TestUtils.mock_get_with_auth_role(self, role)
            assert response.status_code == 200

    def test_get_method_with_mock_data(self):
        response = TestUtils.mock_get_with_auth_role(self, "cas_analyst")
        assert response.status_code == 200
