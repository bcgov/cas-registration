from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy
from unittest.mock import patch, MagicMock
from model_bakery.baker import make_recipe


class TestGetInternalUsersEndpoint(CommonTestSetup):
    @patch(
        "service.data_access_service.user_service.UserDataAccessService.get_internal_users_including_archived",
        autospec=True,
    )
    def test_returns_data_as_provided_by_the_service(self, mock_get_internal_users_including_archived: MagicMock):
        """
        Testing that the API endpoint fetches the internal user data.
        """
        # Arrange: Mock users returned by the service
        internal_users = make_recipe('registration.tests.utils.cas_admin', _quantity=2)
        internal_users += make_recipe('registration.tests.utils.cas_director', _quantity=2)

        mock_get_internal_users_including_archived.return_value = internal_users
        response = TestUtils.mock_get_with_auth_role(
            self,
            "cas_admin",
            custom_reverse_lazy("get_internal_users"),
        )

        # Assert: Verify the response status
        assert response.status_code == 200

        # Assert: Validate the response structure and data
        response_json = response.json()
        assert len(response_json) == 4
        # assert response_json.keys() == {'count', 'items'}
        assert sorted(response_json[0].keys()) == sorted(['role', 'id', 'name', 'email', 'archived_at'])

    def test_unauthorized_user_cannot_get(self):
        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy("get_internal_users"),
        )

        assert response.status_code == 401
