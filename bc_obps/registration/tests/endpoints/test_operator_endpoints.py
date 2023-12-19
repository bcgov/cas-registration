from django.forms import model_to_dict
import pytest
import json
from model_bakery import baker
from django.test import Client
from localflavor.ca.models import CAPostalCodeField
from registration.models import Operator, User, UserOperator
from registration.utils import TestUtils

pytestmark = pytest.mark.django_db

# initialize the APIClient app
client = Client()

base_endpoint = "/api/registration/"

content_type_json = "application/json"

baker.generators.add(CAPostalCodeField, TestUtils.mock_postal_code)


class TestOperatorsEndpoint:
    endpoint = base_endpoint + "operators"

    def setup(self):
        self.operator = baker.make(Operator, legal_name="Test Operator legal name", cra_business_number=123456789)
        self.user: User = baker.make(User)
        self.auth_header = {'user_guid': str(self.user.user_guid)}
        self.auth_header_dumps = json.dumps(self.auth_header)

    def test_unauthorized_users_cannot_get(self, client):
        # /operators
        # any logged in user regardless of role can access this endpoint, so they'll only be unauthorized if they're not logged in
        response = client.get(self.endpoint)
        assert response.status_code == 401

        # operators/operator_id
        operator = baker.make(Operator)
        response = TestUtils.mock_get_with_auth_role(self, 'cas_pending', self.endpoint + "/" + str(operator.id))
        assert response.status_code == 401

    def test_get_operators_no_parameters(self):
        response = TestUtils.mock_get_with_auth_role(self, 'industry_user')
        assert response.status_code == 404
        assert response.json() == {"message": "No parameters provided"}

    def test_get_operators_by_legal_name(self):
        response = TestUtils.mock_get_with_auth_role(
            self, 'industry_user', self.endpoint + "?legal_name=Test Operator legal name"
        )
        assert response.status_code == 200
        assert response.json() == model_to_dict(self.operator)

    def test_get_operators_by_cra_number(self):
        response = TestUtils.mock_get_with_auth_role(
            self, 'industry_user', self.endpoint + "?cra_business_number=123456789"
        )
        assert response.status_code == 200
        assert response.json() == model_to_dict(self.operator)

    def test_get_operators_no_matching_operator_legal_name(self):
        response = TestUtils.mock_get_with_auth_role(
            self, 'industry_user', self.endpoint + "?legal_name=Test Operator legal name 2"
        )
        assert response.status_code == 404
        assert response.json() == {"message": "No matching operator found. Retry or add operator."}

    def test_get_operators_no_matching_operator_cra_number(self):
        response = TestUtils.mock_get_with_auth_role(
            self, 'industry_user', self.endpoint + "?cra_business_number=987654321"
        )
        assert response.status_code == 404
        assert response.json() == {"message": "No matching operator found. Retry or add operator."}

    def test_get_list_user_operators_status(self):
        operator = baker.make(Operator)
        user = baker.make(User)
        # user operator prime
        baker.make(
            UserOperator,
            user=user,
            operator=operator,
            role=UserOperator.Roles.ADMIN,
            status=UserOperator.Statuses.APPROVED,
        )
        baker.make(UserOperator, operator=operator, _quantity=1)

        response = TestUtils.mock_get_with_auth_role(self, 'cas_admin', f"{self.endpoint}/{operator.id}/user-operators")

        assert len(json.loads(response.content)) == 2

    # brianna this is moved from user_operator tests
    def test_select_operator_with_valid_id(self, client):
        operator = baker.make(Operator)
        response = TestUtils.mock_get_with_auth_role(self, "cas_analyst", self.endpoint + "/" + str(operator.id))
        assert response.status_code == 200
        assert response.json() == model_to_dict(operator)

    def test_select_operator_with_invalid_id(self):
        invalid_operator_id = 99999  # Invalid operator ID

        response = TestUtils.mock_get_with_auth_role(
            self, "cas_analyst", self.endpoint + "/" + str(invalid_operator_id)
        )
        assert response.status_code == 404
        assert response.json() == {'message': 'No matching operator found'}
