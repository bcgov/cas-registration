from model_bakery import baker
from localflavor.ca.models import CAPostalCodeField
from registration.tests.utils.bakers import (
    operator_baker,
)
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy


class TestUserOperatorEndpoint(CommonTestSetup):
    def test_get_user_operator_data_industry_user(self):
        operator = operator_baker()
        TestUtils.authorize_current_user_as_operator_user(self, operator=operator)
        user_operator_id_response = TestUtils.mock_get_with_auth_role(
            self, 'industry_user', custom_reverse_lazy('get_user_operator_id')
        )

        response_json = user_operator_id_response.json()
        user_operator_id = response_json.get("user_operator_id")

        response = TestUtils.mock_get_with_auth_role(
            self,
            'industry_user',
            custom_reverse_lazy('get_user_operator', kwargs={'user_operator_id': user_operator_id}),
        )
        assert response.status_code == 200
        assert response.json()['operator_id'] == str(operator.id)  # String representation of the UUID
