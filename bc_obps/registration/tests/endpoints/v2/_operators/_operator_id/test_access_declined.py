from model_bakery import baker
from localflavor.ca.models import CAPostalCodeField
from registration.tests.utils.bakers import user_operator_baker
from registration.models import UserOperator
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy


baker.generators.add(CAPostalCodeField, TestUtils.mock_postal_code)


class TestOperatorIsDeclinedEndpoint(CommonTestSetup):
    def test_operator_access_declined(self):
        user_operator = user_operator_baker()
        user_operator.user_id = self.user.user_guid
        user_operator.status = UserOperator.Statuses.DECLINED
        user_operator.save(update_fields=['user_id', 'status'])
        response = TestUtils.mock_get_with_auth_role(
            self,
            'industry_user',
            custom_reverse_lazy(
                'v1_get_user_operator_access_declined', kwargs={'operator_id': user_operator.operator_id}
            ),
        )
        response_json = response.json()
        assert response.status_code == 200
        assert response_json is True
