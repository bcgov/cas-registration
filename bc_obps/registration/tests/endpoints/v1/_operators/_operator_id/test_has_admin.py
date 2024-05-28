from model_bakery import baker
from localflavor.ca.models import CAPostalCodeField
from registration.tests.utils.bakers import operator_baker
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy

baker.generators.add(CAPostalCodeField, TestUtils.mock_postal_code)


class TestOperatorHasAdminEndpoint(CommonTestSetup):
    endpoint = CommonTestSetup.base_endpoint + "operators"

    def test_unauthorized_users_cannot_get(self):
        # operator/has-admin/{operator_id}
        operator = operator_baker()
        response = TestUtils.mock_get_with_auth_role(
            self,
            'cas_pending',
            custom_reverse_lazy('get_user_operator_has_admin', kwargs={'operator_id': operator.id}),
        )
        assert response.status_code == 401
