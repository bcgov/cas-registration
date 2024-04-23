from model_bakery import baker
from localflavor.ca.models import CAPostalCodeField
from registration.models import (
    UserOperator,
)
from registration.tests.utils.bakers import (
    operator_baker,
    user_operator_baker,
)
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy


class TestUserOperatorEndpoint(CommonTestSetup):
    def test_get_user_operator_data_industry_user_invalid_request(self):
        operator = operator_baker()
        TestUtils.authorize_current_user_as_operator_user(self, operator=operator)
        random_user_operator = user_operator_baker()

        response = TestUtils.mock_get_with_auth_role(
            self,
            'industry_user',
            custom_reverse_lazy('get_user_operator', kwargs={'user_operator_id': random_user_operator.id}),
        )
        # returns 401 because the user_operator does not belong to the current user
        assert response.status_code == 403

    def test_get_user_operator_data_internal_user(self):
        operator = operator_baker()
        user_operator = baker.make(UserOperator, operator=operator)

        response = TestUtils.mock_get_with_auth_role(
            self, 'cas_admin', custom_reverse_lazy('get_user_operator', kwargs={'user_operator_id': user_operator.id})
        )
        assert response.status_code == 200
        assert response.json()['operator_id'] == str(operator.id)  # String representation of the UUID
