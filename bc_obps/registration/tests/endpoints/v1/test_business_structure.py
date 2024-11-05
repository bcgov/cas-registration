from registration.models import BusinessStructure
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy


class TestBusinessStructureEndpoint(CommonTestSetup):
    def test_users_can_get_business_structure(self):
        response = TestUtils.mock_get_with_auth_role(
            self, "industry_user", custom_reverse_lazy("list_business_structures")
        )
        assert response.status_code == 200
        assert len(response.json()) == BusinessStructure.objects.count()
        # Check that we only get the business structures name
        assert list(response.json()[0].keys()) == ["name"]
