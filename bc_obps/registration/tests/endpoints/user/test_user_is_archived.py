from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy
from model_bakery.baker import make_recipe


class TestUserIsArchivedEndpoint(CommonTestSetup):
    def test_check_is_user_archived(self):
        # Act

        make_recipe('registration.tests.utils.cas_analyst')

        response = TestUtils.mock_get_with_auth_role(self, 'cas_admin', custom_reverse_lazy("check_is_user_archived"))

        # Assert
        assert response.status_code == 200
        assert response.json() is False
