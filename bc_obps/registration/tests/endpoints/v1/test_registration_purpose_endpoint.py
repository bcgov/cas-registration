from registration.models.registration_purpose import RegistrationPurpose
from registration.utils import custom_reverse_lazy
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from model_bakery import baker


class TestRegistrationPurposesEndpoint(CommonTestSetup):

    # AUTHORIZATION
    def test_unauthorized_users_cannot_get_registration_purposes(self):
        response = TestUtils.mock_get_with_auth_role(
            self, 'cas_pending', custom_reverse_lazy('get_registration_purposes')
        )
        assert response.status_code == 401

    def test_authorized_users_can_get_registration_purposes(self):
        roles = ["cas_analyst", "cas_admin", "industry_user"]
        baker.make_recipe('utils.approved_user_operator', user=self.user)
        for role in roles:
            response = TestUtils.mock_get_with_auth_role(self, role, custom_reverse_lazy('get_registration_purposes'))
            assert response.status_code == 200
            assert len(response.json()) == len(RegistrationPurpose.Purposes)
