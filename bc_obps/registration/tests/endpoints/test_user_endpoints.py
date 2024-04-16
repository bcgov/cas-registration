from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy


class TestUsersEndpoint(CommonTestSetup):
    def test_unauthorized_users_cannot_get(self):
        # /user
        response = TestUtils.mock_get_with_auth_role(self, "cas_pending", custom_reverse_lazy('get_user_by_guid'))
        assert response.status_code == 401

    # GET USER
    def test_get_user_by_guid(self):
        # Act
        response = TestUtils.mock_get_with_auth_role(self, 'industry_user', custom_reverse_lazy('get_user_by_guid'))
        content = response.json()
        # Assert
        assert response.status_code == 200

        # Additional Assertions
        assert 'first_name' in content and isinstance(content['first_name'], str) and content['first_name'] != ''
        assert 'last_name' in content and isinstance(content['last_name'], str) and content['last_name'] != ''
        assert (
            'position_title' in content
            and isinstance(content['position_title'], str)
            and content['position_title'] != ''
        )
        assert 'email' in content and isinstance(content['email'], str) and '@' in content['email']
        # Additional Assertion for user_guid
        assert 'user_guid' not in content
