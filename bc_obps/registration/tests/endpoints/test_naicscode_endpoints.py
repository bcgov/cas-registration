import pytest
import json
from model_bakery import baker
from registration.models import NaicsCode
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.tests.utils.bakers import app_role_baker

pytestmark = pytest.mark.django_db

base_endpoint = "/api/registration/"

# NOTE: We need to use the app_role_baker fixture to create the app roles and we don't need to add it to any other tests after this
# If we create any other endpoint test file that comes before this one, we will need to add the app_role_baker fixture to the top of that file
@pytest.mark.usefixtures('app_role_baker')
class TestNaicsCodeEndpoint(CommonTestSetup):

    endpoint = base_endpoint + "naics_codes"

    def test_unauthorized_users_cannot_get(self):
        response = TestUtils.mock_get_with_auth_role(self, "cas_pending")
        assert response.status_code == 401

    def test_get_method_for_200_status(self):
        roles = ["cas_analyst", "cas_admin", "industry_user", "industry_user_admin"]
        for role in roles:
            response = TestUtils.mock_get_with_auth_role(self, role)
            assert response.status_code == 200

    def test_get_method_with_mock_data(self):
        baker.make(NaicsCode, _quantity=2)
        response = TestUtils.mock_get_with_auth_role(self, "cas_analyst")
        assert response.status_code == 200
        assert len(json.loads(response.content)) == 2
