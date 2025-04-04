from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy
from model_bakery.baker import make_recipe


class TestUserEndpoint(CommonTestSetup):
    def test_update_user_role(self):
        # Act

        user = make_recipe('registration.tests.utils.cas_analyst')

        response = TestUtils.mock_patch_with_auth_role(
            self,
            'cas_admin',
            self.content_type,
            {'archive': False, 'app_role': 'cas_director'},
            custom_reverse_lazy(
                "update_user_role",
                kwargs={'user_id': user.user_guid},
            ),
        )

        # Assert
        assert response.status_code == 200
        response_json = response.json()
        assert sorted(response_json.keys()) == sorted(['first_name', 'last_name', 'app_role', 'archived_at'])
        assert response_json['app_role'] == 'cas_director'
        assert response_json['archived_at'] is None
        user.refresh_from_db()
        assert user.app_role.role_name == 'cas_director'
        assert user.archived_at is None
