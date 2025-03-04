from registration.models.operation import Operation
from registration.utils import custom_reverse_lazy
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from model_bakery import baker


class TestRegistrationPurposesEndpoint(CommonTestSetup):
    def test_users_can_get_registration_purposes(self):
        baker.make_recipe('registration.tests.utils.approved_user_operator', user=self.user)
        response = TestUtils.mock_get_with_auth_role(
            self, "industry_user", custom_reverse_lazy('get_registration_purposes')
        )
        assert response.status_code == 200
        assert len(response.json()) == len(Operation.Purposes)
