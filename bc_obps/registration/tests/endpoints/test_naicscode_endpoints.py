from registration.models import NaicsCode
from registration.tests.utils.helpers import CommonTestSetup, TestUtils


class TestNaicsCodeEndpoint(CommonTestSetup):
    endpoint = CommonTestSetup.base_registration_endpoint + "naics_codes"

    # AUTHORIZATION
    def test_unauthorized_users_cannot_get_naics_codes(self):
        response = TestUtils.mock_get_with_auth_role(self, "cas_pending")
        assert response.status_code == 401

    def test_authorized_users_can_get_naics_codes(self):
        roles = ["cas_analyst", "cas_admin", "industry_user"]
        for role in roles:
            response = TestUtils.mock_get_with_auth_role(self, role)
            assert response.status_code == 200
            assert len(response.json()) == NaicsCode.objects.count()
            # # Check that we only get the "id", "naics_code" and "naics_description"
            assert list(response.json()[0].keys()) == ["id", "naics_code", "naics_description"]
