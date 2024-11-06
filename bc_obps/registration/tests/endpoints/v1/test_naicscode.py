from registration.models import NaicsCode
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy


class TestNaicsCodeEndpoint(CommonTestSetup):
    def test_users_can_get_naics_codes(self):
        response = TestUtils.mock_get_with_auth_role(self, "industry_user", custom_reverse_lazy("list_naics_codes"))
        assert response.status_code == 200
        assert len(response.json()) == NaicsCode.objects.count()
        assert list(response.json()[0].keys()) == ["id", "naics_code", "naics_description"]
