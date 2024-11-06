from registration.models import Activity
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy


class TestActivitiesEndpoint(CommonTestSetup):
    def test_users_can_get_activities(self):
        response = TestUtils.mock_get_with_auth_role(
            self, "industry_user", custom_reverse_lazy("list_reporting_activities")
        )
        assert response.status_code == 200
        assert len(response.json()) == Activity.objects.count()
        assert response.json()[0]["name"] is not None
        assert response.json()[0]["id"] is not None
        assert response.json()[0]["applicable_to"] is not None
