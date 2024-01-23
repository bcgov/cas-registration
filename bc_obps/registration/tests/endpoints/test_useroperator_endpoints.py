from typing import List
import pytest, json
from model_bakery import baker
from django.test import Client
from localflavor.ca.models import CAPostalCodeField
from registration.models import (
    Address,
    BusinessRole,
    BusinessStructure,
    Contact,
    Operator,
    ParentOperator,
    User,
    UserOperator,
)
from registration.tests.utils.bakers import operator_baker, user_operator_baker
from registration.tests.utils.helpers import CommonTestSetup, TestUtils

pytestmark = pytest.mark.django_db

# initialize the APIClient app
client = Client()

base_endpoint = "/api/registration/"

content_type_json = "application/json"

baker.generators.add(CAPostalCodeField, TestUtils.mock_postal_code)


class TestUserOperatorEndpoint(CommonTestSetup):
    select_endpoint = base_endpoint + "select-operator"
    operator_endpoint = base_endpoint + "operators"
    user_operator_endpoint = base_endpoint + "user-operator"

    def test_user_operator_unauthorized_users_cannot_get(self):
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
        user_operator = user_operator_baker()
        response = TestUtils.mock_get_with_auth_role(
            self, 'cas_pending', f"{self.select_endpoint}/user-operator/{user_operator.id}"
        )
        assert response.status_code == 401

        # /operator-has-admin/{operator_id}
        operator = operator_baker()
        response = TestUtils.mock_get_with_auth_role(
            self, 'cas_pending', f"{base_endpoint}operator-has-admin/{operator.id}"
        )
        assert response.status_code == 401

        # user-operator-id
        response = TestUtils.mock_get_with_auth_role(self, 'cas_pending', f"{base_endpoint}user-operator-id")
        assert response.status_code == 401
        response = TestUtils.mock_get_with_auth_role(self, 'cas_admin', f"{base_endpoint}user-operator-id")
        assert response.status_code == 401
        response = TestUtils.mock_get_with_auth_role(self, 'cas_analyst', f"{base_endpoint}user-operator-id")
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

    def test_user_operator_unauthorized_users_cannot_post(self):
        # select-operator/request-access
        operator = operator_baker()
        for role in ['cas_pending', 'cas_admin', 'cas_analyst']:
            response = TestUtils.mock_post_with_auth_role(
                self,
                role,
                content_type_json,
                {'operator_id': operator.id},
                f"{self.select_endpoint}/request-access",
            )
            assert response.status_code == 401
        # /select-operator/request-admin-access
        for role in ['cas_pending', 'cas_admin', 'cas_analyst']:
            response = TestUtils.mock_post_with_auth_role(
                self,
                role,
                content_type_json,
                {'operator_id': operator.id},
                f"{self.select_endpoint}/request-admin-access",
            )
            assert response.status_code == 401

        # user-operator/operator
        mock_data = TestUtils.mock_UserOperatorOperatorIn()
        mock_data.business_structure = mock_data.business_structure.pk  # a to bypass double validation by the schema
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
        for role in ['cas_pending', 'cas_admin', 'cas_analyst']:
            response = TestUtils.mock_post_with_auth_role(
                self,
                role,
                content_type_json,
                TestUtils.mock_UserOperatorContactIn().json(),
                f"{base_endpoint}user-operator/contact",
            )
            assert response.status_code == 401

    def test_unauthorized_users_cannot_put(self):
        # /select-operator/user-operator/update-status
        user = baker.make(User)
        response = TestUtils.mock_put_with_auth_role(
            self,
            'cas_pending',
            content_type_json,
            {'status': 'Approved', 'user_guid': user.user_guid},
            f"{base_endpoint}select-operator/user-operator/update-status",
        )
        assert response.status_code == 401
        response = TestUtils.mock_put_with_auth_role(
            self,
            'industry_user',
            content_type_json,
            {'status': 'Approved', 'user_guid': user.user_guid},
            f"{base_endpoint}select-operator/user-operator/update-status",
        )
        assert response.status_code == 401

        # user-operator/operator/{user_operator_operator_id}

        mock_payload = {
            "legal_name": "Operation 1 Legal Name",
            "cra_business_number": 987654321,
            "bc_corporate_registry_number": "abc1234321",
            "business_structure": BusinessStructure.objects.first().pk,
            "physical_street_address": "test physical street address",
            "physical_municipality": "test physical municipality",
            "physical_province": "test physical province",
            "physical_postal_code": "test physical postal code",
            "mailing_address_same_as_physical": True,
            "operator_has_parent_operators": False,
            "parent_operators_array": [],
        }
        for role in ['cas_pending', 'cas_admin', 'cas_analyst']:
            response = TestUtils.mock_put_with_auth_role(
                self,
                role,
                content_type_json,
                mock_payload,
                f"{base_endpoint}user-operator/operator/1",
            )
            assert response.status_code == 401

    def test_get_user_operator_status(self):
        user_operator = user_operator_baker()
        user_operator.user_id = self.user.user_guid
        user_operator.save(update_fields=['user_id'])
        response = TestUtils.mock_get_with_auth_role(
            self, 'industry_user', f"{base_endpoint}user-operator-status-from-user"
        )
        assert response.status_code == 200
        assert response.json()['status'] == user_operator.status

    def test_get_user_operator_data_industry_user(self):
        operator = baker.make(Operator, mailing_address=baker.make(Address), physical_address=baker.make(Address))
        TestUtils.authorize_current_user_as_operator_user(self, operator=operator)
        user_operator_id_response = TestUtils.mock_get_with_auth_role(
            self, 'industry_user', f"{base_endpoint}user-operator-id"
        )

        response_json = user_operator_id_response.json()
        user_operator_id = response_json.get("user_operator_id")

        response = TestUtils.mock_get_with_auth_role(
            self, 'industry_user', f"{base_endpoint}select-operator/user-operator/{user_operator_id}"
        )
        assert response.status_code == 200
        assert response.json()['operator_id'] == operator.id

    def test_get_user_operator_data_industry_user_invalid_request(self):
        operator = baker.make(Operator, mailing_address=baker.make(Address), physical_address=baker.make(Address))
        user_operator = baker.make(UserOperator, operator=operator)

        response = TestUtils.mock_get_with_auth_role(
            self, 'industry_user', f"{base_endpoint}select-operator/user-operator/{user_operator.id}"
        )
        # returns 404 because the user_operator does not belong to the current user
        assert response.status_code == 404

    def test_get_user_operator_data_internal_user(self):
        operator = baker.make(Operator, mailing_address=baker.make(Address), physical_address=baker.make(Address))
        user_operator = baker.make(UserOperator, operator=operator)

        response = TestUtils.mock_get_with_auth_role(
            self, 'cas_admin', f"{base_endpoint}select-operator/user-operator/{user_operator.id}"
        )
        assert response.status_code == 200
        assert response.json()['operator_id'] == operator.id

    def test_get_users_operators_list(self):
        baker.make(
            UserOperator,
            user=self.user,
            operator=operator_baker(),
            role=UserOperator.Roles.ADMIN,
            status=UserOperator.Statuses.APPROVED,
        )

        response = TestUtils.mock_get_with_auth_role(
            self, 'industry_user', f"{base_endpoint}user-operator-list-from-user"
        )

        assert len(json.loads(response.content)) == 1

    def test_user_operator_put_update_user_status(self):
        user = baker.make(User)
        user_operator = user_operator_baker()
        user_operator.user_id = user.user_guid
        user_operator.operator = baker.make(
            Operator, status=Operator.Statuses.PENDING, bc_corporate_registry_number="abc1234567", _fill_optional=True
        )
        user_operator.save(update_fields=['user_id', 'operator'])

        response_1 = TestUtils.mock_put_with_auth_role(
            self,
            'cas_admin',
            content_type_json,
            {"status": UserOperator.Statuses.APPROVED, "user_operator_id": user_operator.id},
            f"{base_endpoint}select-operator/user-operator/update-status",
        )

        # make sure user can't change the status of a user_operator when operator is not approved
        assert response_1.status_code == 400
        response_1_json = response_1.json()
        assert response_1_json == {'message': 'Operator must be approved before approving users.'}

        # Change operator status to approved
        user_operator.operator = baker.make(
            Operator, status=Operator.Statuses.APPROVED, bc_corporate_registry_number="efg1234567", _fill_optional=True
        )
        user_operator.save()
        response_2 = TestUtils.mock_put_with_auth_role(
            self,
            'cas_admin',
            content_type_json,
            {"status": UserOperator.Statuses.APPROVED, "user_operator_id": user_operator.id},
            f"{base_endpoint}select-operator/user-operator/update-status",
        )
        assert response_2.status_code == 200
        user_operator.refresh_from_db()  # refresh the user_operator object to get the updated status
        assert user_operator.status == UserOperator.Statuses.APPROVED
        assert user_operator.verified_by == self.user

        # Assigning contacts to the operator of the user_operator
        contacts = baker.make(
            Contact,
            _quantity=2,
            created_by=user_operator.user,
            business_role=BusinessRole.objects.get(role_name='Senior Officer'),
        )
        user_operator.operator.contacts.set(contacts)
        # Now decline the user_operator and make sure the contacts are deleted
        response_3 = TestUtils.mock_put_with_auth_role(
            self,
            'cas_admin',
            content_type_json,
            {"status": UserOperator.Statuses.DECLINED, "user_operator_id": user_operator.id},
            f"{base_endpoint}select-operator/user-operator/update-status",
        )
        assert response_3.status_code == 200
        user_operator.refresh_from_db()  # refresh the user_operator object to get the updated status
        assert user_operator.status == UserOperator.Statuses.DECLINED
        assert user_operator.verified_by == self.user
        assert user_operator.operator.contacts.count() == 0
        assert Contact.objects.count() == 0

    def test_request_admin_access_with_valid_payload(self):
        operator = operator_baker()
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
        mock_user_operator = user_operator_baker()
        mock_user_operator.user_id = mock_user.user_guid
        mock_user_operator.role = UserOperator.Roles.ADMIN
        mock_user_operator.status = UserOperator.Statuses.APPROVED
        mock_user_operator.save(update_fields=['user_id', 'role', 'status'])
        response = TestUtils.mock_get_with_auth_role(
            self, 'industry_user', f"{base_endpoint}is-approved-admin-user-operator/{mock_user_operator.user_id}"
        )
        assert response.status_code == 200
        assert response.json() == {"approved": True}

    def test_is_approved_admin_user_operator_without_approved_user(self):
        mock_user = baker.make(User)
        mock_user_operator = user_operator_baker()
        mock_user_operator.user_id = mock_user.user_guid
        mock_user_operator.role = UserOperator.Roles.ADMIN
        mock_user_operator.status = UserOperator.Statuses.PENDING
        mock_user_operator.save(update_fields=['user_id', 'role', 'status'])
        response = TestUtils.mock_get_with_auth_role(
            self, 'industry_user', f"{base_endpoint}is-approved-admin-user-operator/{mock_user_operator.user_id}"
        )
        assert response.status_code == 200
        assert response.json() == {"approved": False}

    def test_request_subsequent_access_with_valid_payload(self):
        operator = operator_baker()
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
        operator = operator_baker()
        TestUtils.authorize_current_user_as_operator_user(self, operator=operator)
        response = TestUtils.mock_get_with_auth_role(self, 'industry_user', f"{base_endpoint}user-operator-id")

        response_json = response.json()

        # Assert
        assert response.status_code == 200

        # Additional Assertions
        assert "user_operator_id" in response_json

    # GET USER OPERATOR ID 404
    def test_get_user_operator_operator_id_with_invalid_user(self):
        # Act
        response = TestUtils.mock_get_with_auth_role(self, 'industry_user', f"{base_endpoint}user-operator-id")

        response_json = response.json()

        # Assert
        # user is invalid because they're not in the user operator table
        assert response.status_code == 404

        # Additional Assertions
        assert response_json == {"detail": "Not Found"}

    # GET USER OPERATOR OPERATOR ID 200
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

    # GET USER OPERATOR OPERATOR ID 404
    def test_get_user_operator_operator_id_with_invalid_user(self):
        # Act
        response = TestUtils.mock_get_with_auth_role(self, 'industry_user', f"{base_endpoint}user-operator-operator-id")

        response_json = response.json()

        # Assert
        # user is invalid because they're not in the user operator table
        assert response.status_code == 404

        # Additional Assertions
        assert response_json == {"detail": "Not Found"}

    def test_duplicates_not_allowed(self):
        baker.make(
            Operator, legal_name='Legal Name', bc_corporate_registry_number="aaa1234321", cra_business_number=55555
        )

        # duplicate CRA business number
        payload_with_duplicate_cra_business_number = {
            "legal_name": "a Legal Name",
            "trade_name": "test trade name",
            "cra_business_number": 55555,
            "bc_corporate_registry_number": "adh1234321",
            "business_structure": BusinessStructure.objects.first().pk,
            "physical_street_address": "test physical street address",
            "physical_municipality": "test physical municipality",
            "physical_province": "BC",
            "physical_postal_code": "H0H0H0",
            "mailing_address_same_as_physical": True,
            "operator_has_parent_operators": False,
        }
        post_response_duplicate_cra_business_number = TestUtils.mock_post_with_auth_role(
            self,
            'industry_user',
            content_type_json,
            payload_with_duplicate_cra_business_number,
            f"{self.user_operator_endpoint}/operator",
        )
        assert post_response_duplicate_cra_business_number.status_code == 400
        assert post_response_duplicate_cra_business_number.json() == {
            'message': 'Operator with this CRA Business Number already exists.'
        }

        # duplicate legal name
        payload_with_duplicate_legal_name = {
            "legal_name": "Legal Name",
            "cra_business_number": 963852741,
            "bc_corporate_registry_number": "adh1234321",
            "business_structure": BusinessStructure.objects.first().pk,
            "physical_street_address": "test physical street address",
            "physical_municipality": "test physical municipality",
            "physical_province": "BC",
            "physical_postal_code": "H0H0H0",
            "mailing_address_same_as_physical": True,
            "operator_has_parent_operators": False,
        }
        post_response_duplicate_legal_name = TestUtils.mock_post_with_auth_role(
            self,
            'industry_user',
            content_type_json,
            payload_with_duplicate_legal_name,
            f"{self.user_operator_endpoint}/operator",
        )
        assert post_response_duplicate_legal_name.status_code == 400
        assert post_response_duplicate_legal_name.json() == {
            'message': 'Legal Name: Operator with this Legal name already exists.'
        }

        # duplicate BC corporate registry number
        payload_with_duplicate_bc_corporate_registry_number = {
            "legal_name": "a name",
            "cra_business_number": 963852741,
            "bc_corporate_registry_number": "aaa1234321",
            "business_structure": BusinessStructure.objects.first().pk,
            "physical_street_address": "test physical street address",
            "physical_municipality": "test physical municipality",
            "physical_province": "BC",
            "physical_postal_code": "H0H0H0",
            "mailing_address_same_as_physical": True,
            "operator_has_parent_operators": False,
        }
        post_response_duplicate_bc_corporate_registry_number = TestUtils.mock_post_with_auth_role(
            self,
            'industry_user',
            content_type_json,
            payload_with_duplicate_bc_corporate_registry_number,
            f"{self.user_operator_endpoint}/operator",
        )
        assert post_response_duplicate_bc_corporate_registry_number.status_code == 400
        assert post_response_duplicate_bc_corporate_registry_number.json() == {
            'message': 'Bc Corporate Registry Number: Operator with this Bc corporate registry number already exists.'
        }

    def test_create_operator_and_user_operator_with_parent_operators(self):
        baker.make(BusinessStructure, name="BC Corporation")

        mock_payload_2 = {
            "legal_name": "New Operator",
            "trade_name": "New Operator Trade Name",
            "cra_business_number": 963852741,
            "bc_corporate_registry_number": "adh1234321",
            "business_structure": BusinessStructure.objects.first().pk,
            "physical_street_address": "test physical street address",
            "physical_municipality": "test physical municipality",
            "physical_province": "BC",
            "physical_postal_code": "H0H0H0",
            "mailing_address_same_as_physical": False,
            "mailing_street_address": "test mailing street address",
            "mailing_municipality": "test mailing municipality",
            "mailing_province": "BC",
            "mailing_postal_code": "H0H0H0",
            "operator_has_parent_operators": True,
            "parent_operators_array": [
                {
                    "po_legal_name": "test po legal name",
                    "po_trade_name": "test po trade name",
                    "po_cra_business_number": 123456789,
                    "po_bc_corporate_registry_number": "poo7654321",
                    "po_business_structure": BusinessStructure.objects.first().pk,
                    "po_website": "https://testpo.com",
                    "po_physical_street_address": "test po physical street address",
                    "po_physical_municipality": "test po physical municipality",
                    "po_physical_province": "ON",
                    "po_physical_postal_code": "H0H0H0",
                    "po_mailing_address_same_as_physical": True,
                },
                {
                    "po_legal_name": "test po legal name 2",
                    "po_trade_name": "test po trade name 2",
                    "po_cra_business_number": 123456789,
                    "po_bc_corporate_registry_number": "opo7654321",
                    "po_business_structure": BusinessStructure.objects.first().pk,
                    "po_physical_street_address": "test po physical street address 2",
                    "po_physical_municipality": "test po physical municipality 2",
                    "po_physical_province": "ON",
                    "po_physical_postal_code": "H0H0H0",
                    "po_mailing_address_same_as_physical": False,
                    "po_mailing_street_address": "test po mailing street address 2",
                    "po_mailing_municipality": "test po mailing municipality 2",
                    "po_mailing_province": "ON",
                    "po_mailing_postal_code": "H0H0H0",
                },
            ],
        }

        post_response_2 = TestUtils.mock_post_with_auth_role(
            self,
            'industry_user',
            content_type_json,
            mock_payload_2,
            f"{self.user_operator_endpoint}/operator",
        )
        assert post_response_2.status_code == 200

        user_operator_id = post_response_2.json().get("user_operator_id")
        assert user_operator_id is not None

        user_operator = UserOperator.objects.get(id=user_operator_id)
        assert user_operator.operator is not None
        assert user_operator.user == self.user
        assert user_operator.role == UserOperator.Roles.ADMIN
        assert user_operator.status == UserOperator.Statuses.DRAFT

        operator: Operator = user_operator.operator
        assert {
            "legal_name": operator.legal_name,
            "cra_business_number": operator.cra_business_number,
            "bc_corporate_registry_number": operator.bc_corporate_registry_number,
            "business_structure": operator.business_structure.pk,
            "website": None,
            "physical_street_address": operator.physical_address.street_address,
            "physical_municipality": operator.physical_address.municipality,
            "physical_province": operator.physical_address.province,
            "physical_postal_code": operator.physical_address.postal_code,
            "mailing_street_address": operator.mailing_address.street_address,
            "mailing_municipality": operator.mailing_address.municipality,
            "mailing_province": operator.mailing_address.province,
            "mailing_postal_code": operator.mailing_address.postal_code,
        } == {
            "legal_name": "New Operator",
            "cra_business_number": 963852741,
            "bc_corporate_registry_number": "adh1234321",
            "business_structure": BusinessStructure.objects.first().pk,
            "website": None,
            "physical_street_address": "test physical street address",
            "physical_municipality": "test physical municipality",
            "physical_province": "BC",
            "physical_postal_code": "H0H0H0",
            "mailing_street_address": "test mailing street address",
            "mailing_municipality": "test mailing municipality",
            "mailing_province": "BC",
            "mailing_postal_code": "H0H0H0",
        }

        parent_operators: List[ParentOperator] = operator.parent_operators.all()
        assert len(parent_operators) == 2
        # Assert that the parent operator 1 is the same as the first object in the parent_operators_array
        assert {
            "legal_name": parent_operators[0].legal_name,
            "trade_name": parent_operators[0].trade_name,
            "cra_business_number": parent_operators[0].cra_business_number,
            "bc_corporate_registry_number": parent_operators[0].bc_corporate_registry_number,
            "business_structure": parent_operators[0].business_structure.pk,
            "website": parent_operators[0].website,
            "physical_street_address": parent_operators[0].physical_address.street_address,
            "physical_municipality": parent_operators[0].physical_address.municipality,
            "physical_province": parent_operators[0].physical_address.province,
            "physical_postal_code": parent_operators[0].physical_address.postal_code,
            "mailing_street_address": parent_operators[0].mailing_address.street_address,
            "mailing_municipality": parent_operators[0].mailing_address.municipality,
            "mailing_province": parent_operators[0].mailing_address.province,
            "mailing_postal_code": parent_operators[0].mailing_address.postal_code,
        } == {
            "legal_name": "test po legal name",
            "trade_name": "test po trade name",
            "cra_business_number": 123456789,
            "bc_corporate_registry_number": "poo7654321",
            "business_structure": BusinessStructure.objects.first().pk,
            "website": "https://testpo.com",
            "physical_street_address": "test po physical street address",
            "physical_municipality": "test po physical municipality",
            "physical_province": "ON",
            "physical_postal_code": "H0H0H0",
            "mailing_street_address": "test po physical street address",
            "mailing_municipality": "test po physical municipality",
            "mailing_province": "ON",
            "mailing_postal_code": "H0H0H0",
        }

        # Assert that the parent operator 2 is the same as the second object in the parent_operators_array
        assert {
            "legal_name": parent_operators[1].legal_name,
            "trade_name": parent_operators[1].trade_name,
            "cra_business_number": parent_operators[1].cra_business_number,
            "bc_corporate_registry_number": parent_operators[1].bc_corporate_registry_number,
            "business_structure": parent_operators[1].business_structure.pk,
            "website": None,
            "physical_street_address": parent_operators[1].physical_address.street_address,
            "physical_municipality": parent_operators[1].physical_address.municipality,
            "physical_province": parent_operators[1].physical_address.province,
            "physical_postal_code": parent_operators[1].physical_address.postal_code,
            "mailing_street_address": parent_operators[1].mailing_address.street_address,
            "mailing_municipality": parent_operators[1].mailing_address.municipality,
            "mailing_province": parent_operators[1].mailing_address.province,
            "mailing_postal_code": parent_operators[1].mailing_address.postal_code,
        } == {
            "legal_name": "test po legal name 2",
            "trade_name": "test po trade name 2",
            "cra_business_number": 123456789,
            "bc_corporate_registry_number": "opo7654321",
            "business_structure": BusinessStructure.objects.first().pk,
            "website": None,
            "physical_street_address": "test po physical street address 2",
            "physical_municipality": "test po physical municipality 2",
            "physical_province": "ON",
            "physical_postal_code": "H0H0H0",
            "mailing_street_address": "test po mailing street address 2",
            "mailing_municipality": "test po mailing municipality 2",
            "mailing_province": "ON",
            "mailing_postal_code": "H0H0H0",
        }

        # Assert that the parent operator 1 and 2 have the correct operator index
        assert parent_operators[0].operator_index == 1
        assert parent_operators[1].operator_index == 2

    def test_put_user_operator_operator(self):
        operator = baker.make(Operator, bc_corporate_registry_number="hij1234567", created_by=self.user)
        user_operator = baker.make(
            UserOperator, user=self.user, operator=operator, role=UserOperator.Roles.ADMIN, created_by=self.user
        )
        baker.make(BusinessStructure, name='BC Corporation')

        mock_payload = {
            "legal_name": "Put Operator Legal Name",
            "cra_business_number": 963852741,
            "bc_corporate_registry_number": "abc1234321",
            "business_structure": BusinessStructure.objects.first().pk,
            "physical_street_address": "test physical street address",
            "physical_municipality": "test physical municipality",
            "physical_province": "BC",
            "physical_postal_code": "H0H0H0",
            "mailing_address_same_as_physical": False,
            "mailing_street_address": "test mailing street address",
            "mailing_municipality": "test mailing municipality",
            "mailing_province": "BC",
            "mailing_postal_code": "V0V0V0",
            "operator_has_parent_operators": True,
            "parent_operators_array": [],
        }
        put_response = TestUtils.mock_put_with_auth_role(
            self,
            'industry_user',
            content_type_json,
            mock_payload,
            f"{base_endpoint}user-operator/operator/{user_operator.id}",
        )

        response_json = put_response.json()
        assert put_response.status_code == 200
        assert "user_operator_id" in response_json
        user_operator_id = response_json["user_operator_id"]
        user_operator = UserOperator.objects.get(id=user_operator_id)
        assert user_operator.user == self.user
        assert user_operator.updated_by == self.user
        assert user_operator.updated_at is not None

        operator: Operator = user_operator.operator
        assert operator is not None
        assert operator.updated_by == self.user
        assert operator.updated_at is not None

    def test_put_user_operator_operator_malformed_data(self):
        operator = baker.make(Operator, bc_corporate_registry_number="lnm1234567")
        put_response = TestUtils.mock_put_with_auth_role(
            self,
            'industry_user',
            content_type_json,
            {"junk_data": "junk"},
            f"{base_endpoint}user-operator/operator/{operator.id}",
        )

        assert put_response.status_code == 422

    def test_put_duplicates_not_allowed(self):
        baker.make(
            Operator, legal_name='Legal Name', bc_corporate_registry_number="aaa1234321", cra_business_number=55555
        )

        operator = baker.make(Operator, bc_corporate_registry_number="yyy1234321")

        user_operator = baker.make(UserOperator, user=self.user, operator=operator, role=UserOperator.Roles.ADMIN)

        # duplicate CRA business number
        # payload_with_duplicate_cra_business_number = {
        #     "legal_name": "a Name",
        #     "cra_business_number": 55555,
        #     "bc_corporate_registry_number": "adh1234321",
        #     "business_structure": BusinessStructure.objects.first().pk,
        #     "physical_street_address": "test physical street address",
        #     "physical_municipality": "test physical municipality",
        #     "physical_province": "BC",
        #     "physical_postal_code": "H0H0H0",
        #     "mailing_address_same_as_physical": True,
        #     "operator_has_parent_operators": False,
        # }
        # put_response_duplicate_cra_business_number = TestUtils.mock_put_with_auth_role(
        #     self,
        #     'industry_user',
        #     content_type_json,
        #     payload_with_duplicate_cra_business_number,
        #     f"{base_endpoint}user-operator/operator/{user_operator.id}",
        # )
        # assert put_response_duplicate_cra_business_number.status_code == 400
        # assert put_response_duplicate_cra_business_number.json() == {
        #     'message': 'Operator with this CRA Business Number already exists.'
        # }

        # duplicate legal name
        payload_with_duplicate_bc_corporate_registry_number = {
            "legal_name": "Legal Name",
            "cra_business_number": 963852741,
            "bc_corporate_registry_number": "adh1234321",
            "business_structure": BusinessStructure.objects.first().pk,
            "physical_street_address": "test physical street address",
            "physical_municipality": "test physical municipality",
            "physical_province": "BC",
            "physical_postal_code": "H0H0H0",
            "mailing_address_same_as_physical": True,
            "operator_has_parent_operators": False,
        }
        put_response_duplicate_legal_name = TestUtils.mock_put_with_auth_role(
            self,
            'industry_user',
            content_type_json,
            payload_with_duplicate_bc_corporate_registry_number,
            f"{base_endpoint}user-operator/operator/{user_operator.id}",
        )
        assert put_response_duplicate_legal_name.status_code == 400
        assert put_response_duplicate_legal_name.json() == {
            'message': 'Legal Name: Operator with this Legal name already exists.'
        }

        # duplicate BC corporate registry number
        # payload_with_duplicate_bc_corporate_registry_number = {
        #     "legal_name": "a name",
        #     "cra_business_number": 963852741,
        #     "bc_corporate_registry_number": "aaa1234321",
        #     "business_structure": BusinessStructure.objects.first().pk,
        #     "physical_street_address": "test physical street address",
        #     "physical_municipality": "test physical municipality",
        #     "physical_province": "BC",
        #     "physical_postal_code": "H0H0H0",
        #     "mailing_address_same_as_physical": True,
        #     "operator_has_parent_operators": False,
        # }
        # put_response_duplicate_bc_corporate_registry_number = TestUtils.mock_put_with_auth_role(
        #     self,
        #     'industry_user',
        #     content_type_json,
        #     payload_with_duplicate_bc_corporate_registry_number,
        #     f"{base_endpoint}user-operator/operator/{user_operator.id}",
        # )
        # assert put_response_duplicate_bc_corporate_registry_number.status_code == 400
        # assert put_response_duplicate_bc_corporate_registry_number.json() == {
        #     'message': 'Bc Corporate Registry Number: Operator with this Bc corporate registry number already exists.'
        # }
