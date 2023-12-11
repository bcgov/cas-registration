from django.forms import model_to_dict
import pytest
import json
from model_bakery import baker
from registration.models import (
    NaicsCode,
    User,
)
from registration.utils import TestUtils

pytestmark = pytest.mark.django_db

base_endpoint = "/api/registration/"

content_type_json = "application/json"


class TestNaicsCodeEndpoint:

    endpoint = base_endpoint + "naics_codes"

    def setup(self):
        self.user: User = baker.make(User)
        self.auth_header = {'user_guid': str(self.user.user_guid)}
        self.auth_header_dumps = json.dumps(self.auth_header)

    def test_unauthorized_users_cannot_get(self):
        response = TestUtils.mock_get_with_auth_role(self, "cas_pending")
        assert response.status_code == 401

    def test_get_method_for_200_status(self):
        response = TestUtils.mock_get_with_auth_role(self, "industry_user")
        assert response.status_code == 200
        response = TestUtils.mock_get_with_auth_role(self, "industry_user_admin")
        assert response.status_code == 200
        response = TestUtils.mock_get_with_auth_role(self, "cas_admin")
        assert response.status_code == 200
        response = TestUtils.mock_get_with_auth_role(self, "cas_analyst")
        assert response.status_code == 200

    def test_get_method_with_mock_data(self):
        baker.make(NaicsCode, _quantity=2)
        response = TestUtils.mock_get_with_auth_role(self, "cas_analyst")
        assert response.status_code == 200
        assert len(json.loads(response.content)) == 2
