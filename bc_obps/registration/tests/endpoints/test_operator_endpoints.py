from django.forms import model_to_dict
import pytest
import json
from typing import List
from model_bakery import baker
from django.test import Client
from localflavor.ca.models import CAPostalCodeField
from registration.models import Operator, User, UserOperator
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.enums.enums import Roles

pytestmark = pytest.mark.django_db

# initialize the APIClient app
client = Client()

base_endpoint = "/api/registration/"

content_type_json = "application/json"

baker.generators.add(CAPostalCodeField, TestUtils.mock_postal_code)


class TestOperatorsEndpoint(CommonTestSetup):
    endpoint = base_endpoint + "operators"

    def setup(self):
        super().setup()
        self.operator = baker.make(Operator, legal_name="Test Operator legal name", cra_business_number=123456789)

    def test_unauthorized_users_cannot_get(self):
        # /operators
        # any logged in user regardless of role can access this endpoint, so they'll only be unauthorized if they're not logged in
        response = client.get(self.endpoint)
        assert response.status_code == 401

        # operators/operator_id
        operator = baker.make(Operator)
        response = TestUtils.mock_get_with_auth_role(self, 'cas_pending', self.endpoint + "/" + str(operator.id))
        assert response.status_code == 401

    def test_unauthorized_users_cannot_put(self):
        # /operators/{operator_id}

        operator = baker.make(Operator)
        response = TestUtils.mock_put_with_auth_role(
            self,
            'cas_pending',
            content_type_json,
            {'status': Operator.Statuses.APPROVED},
            self.endpoint + "/" + str(operator.id),
        )
        assert response.status_code == 401

        response = TestUtils.mock_put_with_auth_role(
            self,
            'industry_user',
            content_type_json,
            {'status': Operator.Statuses.APPROVED},
            self.endpoint + "/" + str(operator.id),
        )
        assert response.status_code == 401

        response = TestUtils.mock_put_with_auth_role(
            self,
            'industry_user_admin',
            content_type_json,
            {'status': Operator.Statuses.APPROVED},
            self.endpoint + "/" + str(operator.id),
        )
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
        response_dict: dict = response.json()
        for key in response_dict.keys():
            # exclude audit fields
            if key not in ["created_at", "created_by", "updated_at", "updated_by", "archived_at", "archived_by"]:
                assert response_dict[key] == model_to_dict(self.operator)[key]

    def test_get_search_operators_by_legal_name(self):
        response = TestUtils.mock_get_with_auth_role(
            self, Roles.INDUSTRY_USER.value, self.endpoint + "/legal-name?search_value=Test Operator legal name"
        )
        assert response.status_code == 200
        response_dict: dict = response.json()
        assert len(response_dict) == 1
        for key in response_dict[0].keys():
            # exclude audit fields
            if key not in ["created_at", "created_by", "updated_at", "updated_by", "archived_at", "archived_by"]:
                assert response_dict[0][key] == model_to_dict(self.operator)[key]

    def test_get_search_operators_by_legal_name_no_value(self):
        response = TestUtils.mock_get_with_auth_role(self, 'industry_user', self.endpoint + "/legal-name?search_value=")
        assert response.status_code == 404
        assert response.json() == {"message": "No parameters provided"}

    def test_get_operators_by_cra_number(self):
        response = TestUtils.mock_get_with_auth_role(
            self, 'industry_user', self.endpoint + "?cra_business_number=123456789"
        )
        assert response.status_code == 200
        response_dict: dict = response.json()
        for key in response_dict.keys():
            # exclude audit fields
            if key not in ["created_at", "created_by", "updated_at", "updated_by", "archived_at", "archived_by"]:
                assert response_dict[key] == model_to_dict(self.operator)[key]

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

    def test_select_operator_with_valid_id(self):
        operator = baker.make(Operator)
        response = TestUtils.mock_get_with_auth_role(self, "cas_analyst", self.endpoint + "/" + str(operator.id))
        assert response.status_code == 200
        response_dict: dict = response.json()
        for key in response_dict.keys():
            # exclude audit fields
            if key not in ["created_at", "created_by", "updated_at", "updated_by", "archived_at", "archived_by"]:
                assert response_dict[key] == model_to_dict(operator)[key]

    def test_select_operator_with_invalid_id(self):
        invalid_operator_id = 99999  # Invalid operator ID

        response = TestUtils.mock_get_with_auth_role(
            self, "cas_analyst", self.endpoint + "/" + str(invalid_operator_id)
        )
        assert response.status_code == 404
        assert response.json() == {'message': 'No matching operator found'}

    def test_put_approve_operator(self):
        operator = baker.make(Operator, status=Operator.Statuses.PENDING, is_new=True)

        response = TestUtils.mock_put_with_auth_role(
            self,
            'cas_admin',
            content_type_json,
            {"status": Operator.Statuses.APPROVED},
            self.endpoint + "/" + str(operator.id),
        )

        assert response.status_code == 200

        assert response.json().get('status') == Operator.Statuses.APPROVED
        assert response.json().get('is_new') == False
        assert response.json().get("verified_by") == str(self.user.user_guid)

    def test_put_request_changes_to_operator(self):
        operator = baker.make(Operator, status=Operator.Statuses.PENDING)

        response = TestUtils.mock_put_with_auth_role(
            self,
            'cas_admin',
            content_type_json,
            {"status": Operator.Statuses.CHANGES},
            self.endpoint + "/" + str(operator.id),
        )

        assert response.status_code == 200

        assert response.json().get('status') == Operator.Statuses.CHANGES
        assert response.json().get('is_new') == True
        assert response.json().get("verified_by") == None
