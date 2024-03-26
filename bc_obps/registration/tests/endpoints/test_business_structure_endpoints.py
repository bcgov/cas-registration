from registration.models import BusinessStructure
from registration.tests.utils.helpers import CommonTestSetup, TestUtils


class TestBusinessStructureEndpoint(CommonTestSetup):
    endpoint = CommonTestSetup.base_registration_endpoint + "business_structures"

    # AUTHORIZATION
    def test_unauthorized_users_cannot_get_business_structure(self):
        response = TestUtils.mock_get_with_auth_role(self, "cas_pending")
        assert response.status_code == 401

    def test_authorized_users_can_get_business_structure(self):
        roles = ["cas_analyst", "cas_admin", "industry_user"]
        for role in roles:
            response = TestUtils.mock_get_with_auth_role(self, role)
            assert response.status_code == 200
            assert len(response.json()) == BusinessStructure.objects.count()
            # Check that we only get the business structures name
            assert list(response.json()[0].keys()) == ["name"]
