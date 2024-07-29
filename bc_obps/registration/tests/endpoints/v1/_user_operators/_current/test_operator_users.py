from registration.models.user_operator import UserOperator
from registration.tests.utils.bakers import operator_baker, user_baker, user_operator_baker
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy
from model_bakery import baker


class TestOperatorUsersEndpoint(CommonTestSetup):

    # AUTHORIZATION
    def test_unauthorized_roles_cannot_get_operator_users(self):
        response = TestUtils.mock_get_with_auth_role(
            self,
            'cas_pending',
            custom_reverse_lazy("get_operator_users"),
        )
        assert response.status_code == 401

        # unapproved industry users can't get
        user_operator_instance = user_operator_baker(
            {
                'status': UserOperator.Statuses.PENDING,
            }
        )
        user_operator_instance.user_id = self.user.user_guid
        user_operator_instance.save()

        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy("get_operator_users"),
        )
        assert response.status_code == 401

    def test_industry_users_can_get_users_associated_with_their_operator(self):
        operator = operator_baker()
        TestUtils.authorize_current_user_as_operator_user(self, operator)
        # Adding multiple users to the operator(using the same business_guid)
        users = user_baker(custom_properties={'business_guid': self.user.business_guid, '_quantity': 10})
        for user in users:
            baker.make(UserOperator, user=user, operator=operator)
        response = TestUtils.mock_get_with_auth_role(
            self,
            endpoint=custom_reverse_lazy("get_operator_users"),
            role_name="industry_user",
        )
        assert response.status_code == 200
        response_json = response.json()
        assert len(response_json) == 10
        for user in response_json:
            assert user.keys() == {'id', 'full_name'}
            assert user['id'] is not None
            assert user['full_name'] is not None

    def test_industry_users_cannot_get_users_not_associated_with_their_operator(self):
        operator = operator_baker()
        TestUtils.authorize_current_user_as_operator_user(self, operator)
        # Adding multiple users to a different operator
        users = user_baker(custom_properties={'business_guid': '00000000-0000-0000-0000-000000000000', '_quantity': 10})
        random_operator = operator_baker()
        for user in users:
            baker.make(UserOperator, user=user, operator=random_operator)
        response = TestUtils.mock_get_with_auth_role(
            self,
            endpoint=custom_reverse_lazy("get_operator_users"),
            role_name="industry_user",
        )
        assert response.status_code == 200
        response_json = response.json()
        assert len(response_json) == 0