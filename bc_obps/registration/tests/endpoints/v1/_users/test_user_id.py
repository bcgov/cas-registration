from registration.models import UserOperator
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.tests.utils.bakers import (
    operator_baker,
    user_baker,
    user_operator_baker,
)
from registration.utils import custom_reverse_lazy


class TestUserIdEndpoint(CommonTestSetup):
    def test_users_endpoint_unauthorized_roles_cannot_get(self):
        random_user = user_baker()
        # cas_pending can't get
        response = TestUtils.mock_get_with_auth_role(
            self,
            'cas_pending',
            custom_reverse_lazy("get_user", kwargs={"user_id": random_user.user_guid}),
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
            custom_reverse_lazy("get_user", kwargs={"user_id": random_user.user_guid}),
        )
        assert response.status_code == 401

    def test_get_user_with_invalid_user_id(self):
        response = TestUtils.mock_get_with_auth_role(
            self, endpoint=custom_reverse_lazy("get_user", kwargs={"user_id": '99999'}), role_name="cas_admin"
        )
        assert response.status_code == 422
        assert (
            response.json().get('detail')[0].get('msg')
            == 'Input should be a valid UUID, invalid length: expected length 32 for simple format, found 5'
        )

    def test_industry_admin_users_can_get_users_associated_with_their_operator(self):
        operator = operator_baker()
        user_operator = TestUtils.authorize_current_user_as_operator_user(self, operator)
        new_user_operator = user_operator_baker(
            {'operator': operator, 'user': user_baker({'business_guid': user_operator.user.business_guid})}
        )
        response = TestUtils.mock_get_with_auth_role(
            self,
            endpoint=custom_reverse_lazy("get_user", kwargs={"user_id": new_user_operator.user.pk}),
            role_name="industry_user",
        )
        assert response.status_code == 200
        response_json = response.json()
        assert response_json['first_name'] == new_user_operator.user.first_name
        assert response_json['last_name'] == new_user_operator.user.last_name
        assert response_json['email'] == new_user_operator.user.email
        assert response_json['phone_number'] == new_user_operator.user.phone_number
        assert response_json['position_title'] == new_user_operator.user.position_title
        assert response_json['selected_user'] == str(new_user_operator.user.pk)

    def test_industry_admin_users_cannot_get_users_associated_with_other_operators(self):
        operator = operator_baker()
        TestUtils.authorize_current_user_as_operator_user(self, operator)
        new_user_operator = user_operator_baker()
        response = TestUtils.mock_get_with_auth_role(
            self,
            endpoint=custom_reverse_lazy("get_user", kwargs={"user_id": new_user_operator.user.pk}),
            role_name="industry_user",
        )
        assert response.status_code == 401
        assert response.json()['message'] == 'Unauthorized.'
