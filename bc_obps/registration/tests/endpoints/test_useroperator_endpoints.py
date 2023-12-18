from django.forms import model_to_dict
import pytest
import json
from model_bakery import baker
from django.test import Client
from localflavor.ca.models import CAPostalCodeField
from registration.models import (
    Operator,
    User,
    UserOperator,
)
from registration.utils import TestUtils

pytestmark = pytest.mark.django_db

# initialize the APIClient app
client = Client()

base_endpoint = "/api/registration/"

content_type_json = "application/json"

baker.generators.add(CAPostalCodeField, TestUtils.mock_postal_code)


class TestUserOperatorEndpoint:

    select_endpoint = base_endpoint + "select-operator"
    operator_endpoint = base_endpoint + "operators"

    def setup(self):
        self.user: User = baker.make(User)
        self.auth_header = {'user_guid': str(self.user.user_guid)}
        self.auth_header_dumps = json.dumps(self.auth_header)

    def test_unauthorized_users_cannot_get(self, client):
        # /is-approved-admin-user-operator
        response = TestUtils.mock_get_with_auth_role(
            self, 'cas_pending', f"{base_endpoint}is-approved-admin-user-operator/{self.user.user_guid}"
        )
        assert response.status_code == 401
        response = TestUtils.mock_get_with_auth_role(
            self, 'cas_admin', f"{base_endpoint}is-approved-admin-user-operator/{self.user.user_guid}"
        )
        assert response.status_code == 401
        response = TestUtils.mock_get_with_auth_role(
            self, 'cas_analyst', f"{base_endpoint}is-approved-admin-user-operator/{self.user.user_guid}"
        )
        assert response.status_code == 401

        # /select-operator/user-operator/{user_operator_id}
        user_operator = baker.make(UserOperator)
        response = TestUtils.mock_get_with_auth_role(
            self, 'cas_pending', f"{self.select_endpoint}/user-operator/{user_operator.id}"
        )
        assert response.status_code == 401

        # /operator-has-admin/{operator_id}
        operator = baker.make(Operator)
        response = TestUtils.mock_get_with_auth_role(
            self, 'cas_pending', f"{base_endpoint}operator-has-admin/{operator.id}"
        )
        assert response.status_code == 401

        # /user-operator-operator-id
        response = TestUtils.mock_get_with_auth_role(self, 'cas_pending', f"{base_endpoint}user-operator-operator-id")
        assert response.status_code == 401

        # user-operator-status-from-user
        response = TestUtils.mock_get_with_auth_role(self, 'cas_pending', f"{base_endpoint}user-operator-operator-id")
        assert response.status_code == 401
        response = TestUtils.mock_get_with_auth_role(self, 'cas_admin', f"{base_endpoint}user-operator-operator-id")
        assert response.status_code == 401
        response = TestUtils.mock_get_with_auth_role(self, 'cas_analyst', f"{base_endpoint}user-operator-operator-id")
        assert response.status_code == 401

    def test_unauthorized_users_cannot_post(self):
        # select-operator/request-access
        operator = baker.make(Operator)
        response = TestUtils.mock_post_with_auth_role(
            self,
            'cas_pending',
            content_type_json,
            {'operator_id': operator.id},
            f"{base_endpoint}select-operator/request-access",
        )
        assert response.status_code == 401
        response = TestUtils.mock_post_with_auth_role(
            self,
            'cas_admin',
            content_type_json,
            {'operator_id': operator.id},
            f"{base_endpoint}select-operator/request-access",
        )
        assert response.status_code == 401
        response = TestUtils.mock_post_with_auth_role(
            self,
            'cas_analyst',
            content_type_json,
            {'operator_id': operator.id},
            f"{base_endpoint}select-operator/request-access",
        )
        assert response.status_code == 401

        # /select-operator/request-admin-access
        response = TestUtils.mock_post_with_auth_role(
            self,
            'cas_pending',
            content_type_json,
            {'operator_id': operator.id},
            f"{base_endpoint}select-operator/request-access",
        )
        assert response.status_code == 401
        response = TestUtils.mock_post_with_auth_role(
            self,
            'cas_analyst',
            content_type_json,
            {'operator_id': operator.id},
            f"{base_endpoint}select-operator/request-access",
        )
        assert response.status_code == 401
        response = TestUtils.mock_post_with_auth_role(
            self,
            'cas_admin',
            content_type_json,
            {'operator_id': operator.id},
            f"{base_endpoint}select-operator/request-access",
        )
        assert response.status_code == 401

        # user-operator/operator
        mock_data = TestUtils.mock_UserOperatorOperatorIn()
        response = TestUtils.mock_post_with_auth_role(
            self, 'cas_pending', content_type_json, mock_data.json(), f"{base_endpoint}user-operator/operator"
        )
        assert response.status_code == 401
        response = TestUtils.mock_post_with_auth_role(
            self, 'cas_analyst', content_type_json, mock_data.json(), f"{base_endpoint}user-operator/operator"
        )
        assert response.status_code == 401
        response = TestUtils.mock_post_with_auth_role(
            self, 'cas_admin', content_type_json, mock_data.json(), f"{base_endpoint}user-operator/operator"
        )
        assert response.status_code == 401

        # user-operator/contact
        operator = baker.make(Operator)
        response = TestUtils.mock_post_with_auth_role(
            self,
            'cas_pending',
            content_type_json,
            TestUtils.mock_UserOperatorContactIn().json(),
            f"{base_endpoint}user-operator/contact",
        )
        assert response.status_code == 401
        response = TestUtils.mock_post_with_auth_role(
            self,
            'cas_admin',
            content_type_json,
            TestUtils.mock_UserOperatorContactIn().json(),
            f"{base_endpoint}user-operator/contact",
        )
        assert response.status_code == 401
        response = TestUtils.mock_post_with_auth_role(
            self,
            'cas_analyst',
            content_type_json,
            TestUtils.mock_UserOperatorContactIn().json(),
            f"{base_endpoint}user-operator/contact",
        )
        assert response.status_code == 401

    def test_unauthorized_users_cannot_put(self):
        # /select-operator/user-operator/{user_id}/update-status
        user = baker.make(User)
        response = TestUtils.mock_put_with_auth_role(
            self,
            'cas_pending',
            content_type_json,
            {'status': 'Approved'},
            f"{base_endpoint}select-operator/user-operator/{user.user_guid}/update-status",
        )
        assert response.status_code == 401
        user = baker.make(User)
        response = TestUtils.mock_put_with_auth_role(
            self,
            'industry_user',
            content_type_json,
            {'status': 'Approved'},
            f"{base_endpoint}select-operator/user-operator/{user.user_guid}/update-status",
        )

    def test_get_user_operator_status(self):
        user_operator = baker.make(UserOperator, user_id=self.user.user_guid, status=UserOperator.Statuses.APPROVED)
        response = TestUtils.mock_get_with_auth_role(
            self, 'industry_user', f"{base_endpoint}user-operator-status-from-user"
        )
        assert response.status_code == 200
        assert response.json()['status'] == user_operator.status

    def test_get_users_operators_list(self):
        operators = baker.make(Operator, _quantity=2)
        baker.make(
            UserOperator,
            user=self.user,
            operator=operators[0],
            role=UserOperator.Roles.ADMIN,
            status=UserOperator.Statuses.APPROVED,
        )
        baker.make(
            UserOperator,
            user=self.user,
            operator=operators[1],
            role=UserOperator.Roles.ADMIN,
            status=UserOperator.Statuses.APPROVED,
        )

        response = TestUtils.mock_get_with_auth_role(self, 'cas_admin', f"{base_endpoint}get-current-users-operators")

        assert len(json.loads(response.content)) == 2

    def test_put_update_user_status(self):
        user = baker.make(User)
        user_operator = baker.make(UserOperator, status=UserOperator.Statuses.PENDING, user_id=user.user_guid)

        response = TestUtils.mock_put_with_auth_role(
            self,
            'cas_admin',
            content_type_json,
            {"status": UserOperator.Statuses.APPROVED},
            f"{base_endpoint}select-operator/user-operator/{user_operator.user_id}/update-status",
        )

        assert response.status_code == 200

        response_content = json.loads(response.content.decode("utf-8"))
        parsed_list = json.loads(response_content)
        # the put_response content is returned as a list but there's only ever one object in the list
        parsed_object = parsed_list[0]

        assert parsed_object.get("fields").get("status") == UserOperator.Statuses.APPROVED
        assert parsed_object.get("fields").get("verified_by") == str(self.user.user_guid)

    def test_request_admin_access_with_valid_payload(self):
        operator = baker.make(Operator)
        response = TestUtils.mock_post_with_auth_role(
            self,
            'industry_user',
            content_type_json,
            {"operator_id": operator.id},
            f"{self.select_endpoint}/request-admin-access",
        )

        response_json = response.json()

        assert response.status_code == 201
        assert "user_operator_id" in response_json

        user_operator_exists = UserOperator.objects.filter(
            id=response_json["user_operator_id"],
            user=self.user,
            operator=operator,
            status=UserOperator.Statuses.DRAFT,
            role=UserOperator.Roles.ADMIN,
        ).exists()

        assert user_operator_exists, "UserOperator object was not created"

    def test_request_access_with_invalid_payload(self):
        invalid_payload = {"operator_id": 99999}  # Invalid operator ID

        response = TestUtils.mock_post_with_auth_role(
            self, 'industry_user', content_type_json, invalid_payload, f"{self.select_endpoint}/request-admin-access"
        )
        assert response.status_code == 404
        assert response.json() == {"detail": "Not Found"}

    def test_is_approved_admin_user_operator_with_approved_user(self):
        mock_user = baker.make(User)
        mock_user_operator = baker.make(UserOperator, role="admin", status="approved", user_id=mock_user.user_guid)
        response = TestUtils.mock_get_with_auth_role(
            self, 'industry_user_admin', f"{base_endpoint}is-approved-admin-user-operator/{mock_user_operator.user_id}"
        )
        assert response.status_code == 200
        assert response.json() == {"approved": True}

    def test_is_approved_admin_user_operator_without_approved_user(self):
        mock_user = baker.make(User)
        mock_user_operator = baker.make(UserOperator, role="admin", status="pending", user_id=mock_user.user_guid)
        response = TestUtils.mock_get_with_auth_role(
            self, 'industry_user', f"{base_endpoint}is-approved-admin-user-operator/{mock_user_operator.user_id}"
        )
        assert response.status_code == 200
        assert response.json() == {"approved": False}

    def test_request_subsequent_access_with_valid_payload(self):
        operator = baker.make(Operator)
        admin_user = baker.make(User, business_guid=self.user.business_guid)
        baker.make(
            UserOperator,
            user=admin_user,
            operator=operator,
            role=UserOperator.Roles.ADMIN,
            status=UserOperator.Statuses.APPROVED,
        )
        response = TestUtils.mock_post_with_auth_role(
            self,
            'industry_user',
            content_type_json,
            {"operator_id": operator.id},
            f"{self.select_endpoint}/request-access",
        )
        response_json = response.json()

        assert response.status_code == 201
        assert "user_operator_id" in response_json

        user_operator_exists = UserOperator.objects.filter(
            id=response_json["user_operator_id"],
            user=self.user,
            operator=operator,
            status=UserOperator.Statuses.PENDING,
        ).exists()

        assert user_operator_exists, "UserOperator object was not created"

    # GET USER OPERATOR ID 200
    def test_get_user_operator_operator_id(self):

        # Act
        operator = baker.make(Operator)
        TestUtils.authorize_current_user_as_operator_user(self, operator=operator)
        response = TestUtils.mock_get_with_auth_role(self, 'industry_user', f"{base_endpoint}user-operator-operator-id")

        response_json = response.json()

        # Assert
        assert response.status_code == 200

        # Additional Assertions
        assert "operator_id" in response_json

    # GET USER OPERATOR ID 404
    def test_get_user_operator_operator_id_with_invalid_user(self):

        # Act
        invalid_user = "98f255ed8d4644eeb2fe9f8d3d92c689"
        response = TestUtils.mock_get_with_auth_role(
            self, 'industry_user_admin', f"{base_endpoint}user-operator-operator-id"
        )

        # client.get(
        #     f"{base_endpoint}user-operator-operator-id",
        # )
        response_json = response.json()

        # Assert
        assert response.status_code == 404

        # Additional Assertions
        assert response_json == {"detail": "Not Found"}
