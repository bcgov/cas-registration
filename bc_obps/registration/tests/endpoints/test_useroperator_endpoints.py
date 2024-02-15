from typing import List
import pytest, json
from model_bakery import baker
from django.test import Client
from localflavor.ca.models import CAPostalCodeField
from registration.models import (
    BusinessRole,
    BusinessStructure,
    Contact,
    Operator,
    ParentOperator,
    User,
    UserOperator,
)
from registration.tests.utils.bakers import (
    address_baker,
    generate_random_bc_corporate_registry_number,
    operator_baker,
    user_baker,
    user_operator_baker,
    parent_operator_baker,
)
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.constants import PAGE_SIZE
from registration.utils import custom_reverse_lazy

baker.generators.add(CAPostalCodeField, TestUtils.mock_postal_code)


class TestUserOperatorEndpoint(CommonTestSetup):
    def test_user_operator_unauthorized_users_cannot_get(self):
        # /is-approved-admin-user-operator
        response = TestUtils.mock_get_with_auth_role(
            self,
            'cas_pending',
            custom_reverse_lazy('is_approved_admin_user_operator', kwargs={'user_guid': self.user.user_guid}),
        )
        assert response.status_code == 401
        response = TestUtils.mock_get_with_auth_role(
            self,
            'cas_admin',
            custom_reverse_lazy('is_approved_admin_user_operator', kwargs={'user_guid': self.user.user_guid}),
        )
        assert response.status_code == 401
        response = TestUtils.mock_get_with_auth_role(
            self,
            'cas_analyst',
            custom_reverse_lazy('is_approved_admin_user_operator', kwargs={'user_guid': self.user.user_guid}),
        )
        assert response.status_code == 401

        # /select-operator/user-operator/{user_operator_id}
        user_operator = user_operator_baker()
        response = TestUtils.mock_get_with_auth_role(
            self, 'cas_pending', custom_reverse_lazy('get_user_operator', kwargs={'user_operator_id': user_operator.id})
        )
        assert response.status_code == 401

        # /operator-has-admin/{operator_id}
        operator = operator_baker()
        response = TestUtils.mock_get_with_auth_role(
            self,
            'cas_pending',
            custom_reverse_lazy('get_user_operator_admin_exists', kwargs={'operator_id': operator.id}),
        )
        assert response.status_code == 401

        # user-operator-id
        response = TestUtils.mock_get_with_auth_role(self, 'cas_pending', custom_reverse_lazy('get_user_operator_id'))
        assert response.status_code == 401
        response = TestUtils.mock_get_with_auth_role(self, 'cas_admin', custom_reverse_lazy('get_user_operator_id'))
        assert response.status_code == 401
        response = TestUtils.mock_get_with_auth_role(self, 'cas_analyst', custom_reverse_lazy('get_user_operator_id'))
        assert response.status_code == 401

        # /user-operator-operator
        response = TestUtils.mock_get_with_auth_role(
            self, 'cas_pending', custom_reverse_lazy('get_user_operator_operator')
        )
        assert response.status_code == 401

        # user-operator-status-from-user
        response = TestUtils.mock_get_with_auth_role(
            self, 'cas_pending', custom_reverse_lazy('get_user_operator_operator')
        )
        assert response.status_code == 401
        response = TestUtils.mock_get_with_auth_role(
            self, 'cas_admin', custom_reverse_lazy('get_user_operator_operator')
        )
        assert response.status_code == 401
        response = TestUtils.mock_get_with_auth_role(
            self, 'cas_analyst', custom_reverse_lazy('get_user_operator_operator')
        )
        assert response.status_code == 401

    def test_user_operator_unauthorized_users_cannot_post(self):
        # select-operator/request-access
        operator = operator_baker()
        for role in ['cas_pending', 'cas_admin', 'cas_analyst']:
            response = TestUtils.mock_post_with_auth_role(
                self,
                role,
                self.content_type,
                {'operator_id': operator.id},
                custom_reverse_lazy('request_access'),
            )
            assert response.status_code == 401
        # /select-operator/request-admin-access
        for role in ['cas_pending', 'cas_admin', 'cas_analyst']:
            response = TestUtils.mock_post_with_auth_role(
                self,
                role,
                self.content_type,
                {'operator_id': operator.id},
                custom_reverse_lazy('request_admin_access'),
            )
            assert response.status_code == 401

        # user-operator/operator
        mock_data = TestUtils.mock_UserOperatorOperatorIn()
        mock_data.business_structure = mock_data.business_structure.pk  # a to bypass double validation by the schema
        response = TestUtils.mock_post_with_auth_role(
            self,
            'cas_pending',
            self.content_type,
            mock_data.json(),
            custom_reverse_lazy('create_operator_and_user_operator'),
        )
        assert response.status_code == 401
        response = TestUtils.mock_post_with_auth_role(
            self,
            'cas_analyst',
            self.content_type,
            mock_data.json(),
            custom_reverse_lazy('create_operator_and_user_operator'),
        )
        assert response.status_code == 401
        response = TestUtils.mock_post_with_auth_role(
            self,
            'cas_admin',
            self.content_type,
            mock_data.json(),
            custom_reverse_lazy('create_operator_and_user_operator'),
        )
        assert response.status_code == 401

    def test_unauthorized_users_cannot_put(self):
        # /select-operator/user-operator/update-status
        user = baker.make(User)
        response = TestUtils.mock_put_with_auth_role(
            self,
            'cas_pending',
            self.content_type,
            {'status': 'Approved', 'user_guid': user.user_guid},
            custom_reverse_lazy('update_user_operator_status'),
        )
        assert response.status_code == 401
        response = TestUtils.mock_put_with_auth_role(
            self,
            'industry_user',
            self.content_type,
            {'status': 'Approved', 'user_guid': user.user_guid},
            custom_reverse_lazy('update_user_operator_status'),
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
                self.content_type,
                mock_payload,
                custom_reverse_lazy('update_operator_and_user_operator', kwargs={'user_operator_id': 1}),
            )
            assert response.status_code == 401

    def test_get_user_operator(self):
        user_operator = user_operator_baker()
        user_operator.user_id = self.user.user_guid
        user_operator.save(update_fields=['user_id'])
        response = TestUtils.mock_get_with_auth_role(
            self, 'industry_user', custom_reverse_lazy('get_user_operator_from_user')
        )
        assert response.status_code == 200
        assert response.json()['status'] == user_operator.status
        assert response.json().get('is_new') is not None

    def test_get_user_operator_data_industry_user(self):
        operator = operator_baker()
        TestUtils.authorize_current_user_as_operator_user(self, operator=operator)
        user_operator_id_response = TestUtils.mock_get_with_auth_role(
            self, 'industry_user', custom_reverse_lazy('get_user_operator_id')
        )

        response_json = user_operator_id_response.json()
        user_operator_id = response_json.get("user_operator_id")

        response = TestUtils.mock_get_with_auth_role(
            self,
            'industry_user',
            custom_reverse_lazy('get_user_operator', kwargs={'user_operator_id': user_operator_id}),
        )
        assert response.status_code == 200
        assert response.json()['operator_id'] == operator.id

    def test_get_user_operator_data_industry_user_invalid_request(self):
        operator = operator_baker()
        user_operator = baker.make(UserOperator, operator=operator)

        response = TestUtils.mock_get_with_auth_role(
            self,
            'industry_user',
            custom_reverse_lazy('get_user_operator', kwargs={'user_operator_id': user_operator.id}),
        )
        # returns 404 because the user_operator does not belong to the current user
        assert response.status_code == 404

    def test_get_user_operator_data_internal_user(self):
        operator = operator_baker()
        user_operator = baker.make(UserOperator, operator=operator)

        response = TestUtils.mock_get_with_auth_role(
            self, 'cas_admin', custom_reverse_lazy('get_user_operator', kwargs={'user_operator_id': user_operator.id})
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
            self, 'industry_user', custom_reverse_lazy('get_user_operator_list_from_user')
        )

        assert len(json.loads(response.content)) == 1

    def test_get_user_operators_paginated(self):
        for i in range(60):
            baker.make(
                UserOperator,
                user=self.user,
                operator=baker.make(
                    Operator,
                    id=i,
                    bc_corporate_registry_number=generate_random_bc_corporate_registry_number(),
                    business_structure=BusinessStructure.objects.first(),
                    physical_address=address_baker(),
                    website='https://www.example-operator.com',
                ),
                role=UserOperator.Roles.ADMIN,
                status=UserOperator.Statuses.PENDING,
            )

        response = TestUtils.mock_get_with_auth_role(self, 'cas_admin', custom_reverse_lazy('list_user_operators'))
        assert response.status_code == 200
        response_data = response.json().get('data')
        # save the id of the first paginated response item
        page_1_response_id = response_data[0].get('id')
        assert len(response_data) == PAGE_SIZE
        # Get the page 2 response
        response = TestUtils.mock_get_with_auth_role(
            self,
            "cas_admin",
            custom_reverse_lazy('list_user_operators') + "?page=2&sort_field=created_at&sort_order=desc",
        )
        assert response.status_code == 200
        response_data = response.json().get('data')
        # save the id of the first paginated response item
        page_2_response_id = response_data[0].get('id')
        assert len(response_data) == PAGE_SIZE
        # assert that the first item in the page 1 response is not the same as the first item in the page 2 response
        assert page_1_response_id != page_2_response_id

        # Get page 2 again but with different sort order
        response = TestUtils.mock_get_with_auth_role(
            self,
            "cas_admin",
            custom_reverse_lazy('list_user_operators') + "?page=2&sort_field=created_at&sort_order=asc",
        )
        assert response.status_code == 200
        response_data = response.json().get('data')
        # save the id of the first paginated response item
        page_2_response_id_reverse = response_data[0].get('id')
        assert len(response_data) == PAGE_SIZE
        # assert that the first item in the page 2 response is not the same as the first item in the page 2 response with reversed order
        assert page_2_response_id != page_2_response_id_reverse

    def test_get_user_operators_check_response_returns_operators_with_no_approved_admins(self):
        operator = operator_baker()

        # Make two user operators tied to the same operator
        baker.make(
            UserOperator,
            user=user_baker(),
            operator=operator,
            role=UserOperator.Roles.ADMIN,
            status=UserOperator.Statuses.APPROVED,
        )

        baker.make(
            UserOperator,
            user=user_baker(),
            operator=operator,
            role=UserOperator.Roles.ADMIN,
            status=UserOperator.Statuses.PENDING,
        )

        response = TestUtils.mock_get_with_auth_role(self, "cas_admin", custom_reverse_lazy('list_user_operators'))
        assert response.status_code == 200
        response_data = response.json().get('data')

        # returns 0 since both user operators are tied to the same operator and one prime admin request is approved
        assert len(response_data) == 0

        # Now add user operator tied to a different operator
        baker.make(
            UserOperator,
            user=user_baker(),
            operator=operator_baker(),
            role=UserOperator.Roles.ADMIN,
            status=UserOperator.Statuses.PENDING,
        )

        response = TestUtils.mock_get_with_auth_role(self, "cas_admin", custom_reverse_lazy('list_user_operators'))
        assert response.status_code == 200
        response_data = response.json().get('data')
        # returns 1 since the user operator is tied to a different operator
        assert len(response_data) == 1

    def test_user_operator_put_cannot_update_status_when_operator_not_approved(self):
        user = baker.make(User)

        operator = operator_baker()
        operator.status = Operator.Statuses.PENDING
        operator.save(update_fields=['status'])
        user_operator = user_operator_baker()
        user_operator.user_id = user.user_guid
        user_operator.operator = operator
        user_operator.save(update_fields=['user_id', 'operator_id'])

        response_1 = TestUtils.mock_put_with_auth_role(
            self,
            'cas_admin',
            self.content_type,
            {"status": UserOperator.Statuses.APPROVED, "user_operator_id": user_operator.id},
            custom_reverse_lazy('update_user_operator_status'),
        )
        # make sure user can't change the status of a user_operator when operator is not approved
        assert response_1.status_code == 400
        response_1_json = response_1.json()
        assert response_1_json == {'message': 'Operator must be approved before approving users.'}

    def test_user_operator_put_can_update_status(self):

        operator = operator_baker({'status': Operator.Statuses.APPROVED, 'is_new': False})
        user_operator = user_operator_baker({'operator': operator})

        response_2 = TestUtils.mock_put_with_auth_role(
            self,
            'cas_admin',
            self.content_type,
            {"status": UserOperator.Statuses.APPROVED, "user_operator_id": user_operator.id},
            custom_reverse_lazy('update_user_operator_status'),
        )
        assert response_2.status_code == 200
        user_operator.refresh_from_db()  # refresh the user_operator object to get the updated status
        assert user_operator.status == UserOperator.Statuses.APPROVED
        assert user_operator.verified_by == self.user

    def test_user_operator_put_decline_rejects_everything(self):
        user = baker.make(User)
        operator = operator_baker()
        operator.status = Operator.Statuses.APPROVED
        operator.is_new = False
        operator.save(update_fields=['status', 'is_new'])
        user_operator = user_operator_baker()
        user_operator.user_id = user.user_guid
        user_operator.operator = operator
        user_operator.save(update_fields=['user_id', 'operator_id'])
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
            self.content_type,
            {"status": UserOperator.Statuses.DECLINED, "user_operator_id": user_operator.id},
            custom_reverse_lazy('update_user_operator_status'),
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
            self.content_type,
            {"operator_id": operator.id},
            custom_reverse_lazy('request_admin_access'),
        )

        response_json = response.json()

        assert response.status_code == 201
        assert "user_operator_id" in response_json

        user_operator_exists = UserOperator.objects.filter(
            id=response_json["user_operator_id"],
            user=self.user,
            operator=operator,
            status=UserOperator.Statuses.PENDING,
            role=UserOperator.Roles.ADMIN,
        ).exists()

        assert user_operator_exists, "UserOperator object was not created"

    def test_request_access_with_invalid_payload(self):
        invalid_payload = {"operator_id": 99999}  # Invalid operator ID

        response = TestUtils.mock_post_with_auth_role(
            self, 'industry_user', self.content_type, invalid_payload, custom_reverse_lazy('request_admin_access')
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
            self,
            'industry_user',
            custom_reverse_lazy('is_approved_admin_user_operator', kwargs={'user_guid': mock_user.user_guid}),
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
            self,
            'industry_user',
            custom_reverse_lazy('is_approved_admin_user_operator', kwargs={'user_guid': mock_user.user_guid}),
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
            self.content_type,
            {"operator_id": operator.id},
            custom_reverse_lazy('request_access'),
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
        response = TestUtils.mock_get_with_auth_role(self, 'industry_user', custom_reverse_lazy('get_user_operator_id'))

        response_json = response.json()

        # Assert
        assert response.status_code == 200

        # Additional Assertions
        assert "user_operator_id" in response_json

    # GET USER OPERATOR ID 404
    def test_get_user_operator_operator_id_with_invalid_user(self):
        # Act
        response = TestUtils.mock_get_with_auth_role(self, 'industry_user', custom_reverse_lazy('get_user_operator_id'))

        response_json = response.json()

        # Assert
        # user is invalid because they're not in the user operator table
        assert response.status_code == 404

        # Additional Assertions
        assert response_json == {"detail": "Not Found"}

    # GET USER OPERATOR OPERATOR ID 200
    def test_get_user_operator_operator(self):
        # Act
        operator = operator_baker()
        TestUtils.authorize_current_user_as_operator_user(self, operator=operator)
        response = TestUtils.mock_get_with_auth_role(
            self, 'industry_user', custom_reverse_lazy('get_user_operator_operator')
        )

        response_json = response.json()

        # Assert
        assert response.status_code == 200

        # Additional Assertions
        assert "operator_id" in response_json
        assert "status" in response_json

    # GET USER OPERATOR OPERATOR ID 404
    def test_get_user_operator_operator_with_invalid_user(self):
        # Act
        response = TestUtils.mock_get_with_auth_role(
            self, 'industry_user', custom_reverse_lazy('get_user_operator_operator')
        )

        response_json = response.json()

        # Assert
        # user is invalid because they're not in the user operator table
        assert response.status_code == 404

        # Additional Assertions
        assert response_json == {'message': 'User is not associated with any operator'}

    def test_duplicates_not_allowed(self):
        operator = operator_baker()

        # duplicate CRA business number
        payload_with_duplicate_cra_business_number = {
            "legal_name": "a Legal Name",
            "trade_name": "test trade name",
            "cra_business_number": operator.cra_business_number,
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
            self.content_type,
            payload_with_duplicate_cra_business_number,
            custom_reverse_lazy('create_operator_and_user_operator'),
        )
        assert post_response_duplicate_cra_business_number.status_code == 400
        assert post_response_duplicate_cra_business_number.json() == {
            'message': 'Operator with this CRA Business Number already exists.'
        }

        # duplicate legal name
        payload_with_duplicate_legal_name = {
            "legal_name": operator.legal_name,
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
            self.content_type,
            payload_with_duplicate_legal_name,
            custom_reverse_lazy('create_operator_and_user_operator'),
        )
        assert post_response_duplicate_legal_name.status_code == 400
        assert post_response_duplicate_legal_name.json() == {
            'message': 'Legal Name: Operator with this Legal name already exists.'
        }

        # duplicate BC corporate registry number
        payload_with_duplicate_bc_corporate_registry_number = {
            "legal_name": "a name",
            "cra_business_number": 963852741,
            "bc_corporate_registry_number": operator.bc_corporate_registry_number,
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
            self.content_type,
            payload_with_duplicate_bc_corporate_registry_number,
            custom_reverse_lazy('create_operator_and_user_operator'),
        )
        assert post_response_duplicate_bc_corporate_registry_number.status_code == 400
        assert post_response_duplicate_bc_corporate_registry_number.json() == {
            'message': 'Bc Corporate Registry Number: Operator with this Bc corporate registry number already exists.'
        }

    # PARENT OPERATORS
    def test_create_operator_and_user_operator_with_parent_operators(self):
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
            self.content_type,
            mock_payload_2,
            custom_reverse_lazy('create_operator_and_user_operator'),
        )
        assert post_response_2.status_code == 200

        user_operator_id = post_response_2.json().get("user_operator_id")
        assert user_operator_id is not None

        user_operator = UserOperator.objects.get(id=user_operator_id)
        assert user_operator.operator is not None
        assert user_operator.user == self.user
        assert user_operator.role == UserOperator.Roles.PENDING
        assert user_operator.status == UserOperator.Statuses.PENDING

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

    def test_edit_and_archive_parent_operators(self):

        child_operator = operator_baker()
        user_operator = baker.make(UserOperator, operator=child_operator, user=self.user)

        parent_operator_1 = parent_operator_baker()
        parent_operator_1.child_operator_id = child_operator.id
        parent_operator_1.operator_index = 1
        parent_operator_1.save(update_fields=["child_operator_id", "operator_index"])

        parent_operator_2 = parent_operator_baker()
        parent_operator_2.child_operator_id = child_operator.id
        parent_operator_2.operator_index = 2
        parent_operator_2.save(update_fields=["child_operator_id", "operator_index"])

        unrelated_parent_operator = parent_operator_baker()
        unrelated_parent_operator.legal_name = 'i should not be deleted'
        unrelated_parent_operator.operator_index = 1
        unrelated_parent_operator.save(update_fields=["legal_name", "operator_index"])

        mock_payload = {
            "legal_name": "New Operator",
            "trade_name": "New Operator Trade Name",
            "cra_business_number": 963852741,
            "bc_corporate_registry_number": "adh1234321",
            "business_structure": BusinessStructure.objects.first().pk,
            "physical_street_address": "test physical street address",
            "physical_municipality": "test physical municipality",
            "physical_province": "BC",
            "physical_postal_code": "H0H0H0",
            "mailing_address_same_as_physical": True,
            "operator_has_parent_operators": True,
            "parent_operators_array": [
                {
                    "po_legal_name": "test po legal name-EDITED",
                    "po_cra_business_number": 123456789,
                    "po_bc_corporate_registry_number": "poo7654321",
                    "po_business_structure": BusinessStructure.objects.first().pk,
                    "po_website": "https://testpo.com",
                    "po_physical_street_address": "test po physical street address",
                    "po_physical_municipality": "test po physical municipality",
                    "po_physical_province": "ON",
                    "po_physical_postal_code": "H0H0H0",
                    "po_mailing_address_same_as_physical": True,
                    "operator_index": 2,
                },
            ],
        }
        response = TestUtils.mock_put_with_auth_role(
            self,
            'industry_user',
            self.content_type,
            mock_payload,
            custom_reverse_lazy('update_operator_and_user_operator', kwargs={'user_operator_id': user_operator.id}),
        )
        assert response.status_code == 200

        parent_operators: List[ParentOperator] = child_operator.parent_operators.all()

        assert len(parent_operators) == 1  # archived records are not pulled

        # parent_operator_1 has been archived
        parent_operator_1.refresh_from_db()
        assert parent_operator_1.operator_index == 1
        assert parent_operator_1.archived_by is not None
        assert parent_operator_1.archived_at is not None

        # parent_operator_2 has been edited
        assert parent_operators[0].legal_name == "test po legal name-EDITED"
        assert parent_operators[0].operator_index == 2
        assert parent_operators[0].archived_by is None
        assert parent_operators[0].archived_at is None

        # unrelated_parent_operator has the same id as parent_operator_1 and should be left alone as it doesn't belong to the child operator
        unrelated_parent_operator.refresh_from_db()
        assert unrelated_parent_operator.legal_name == 'i should not be deleted'

    def remove_all_parent_operators(self):

        child_operator = operator_baker()
        user_operator = baker.make(UserOperator, operator=child_operator, user=self.user)

        parent_operator_1 = parent_operator_baker()
        parent_operator_1.child_operator_id = child_operator.id
        parent_operator_1.operator_index = 1
        parent_operator_1.save(update_fields=["child_operator_id", "operator_index"])

        parent_operator_2 = parent_operator_baker()
        parent_operator_2.child_operator_id = child_operator.id
        parent_operator_2.operator_index = 2
        parent_operator_2.save(update_fields=["child_operator_id", "operator_index"])

        unrelated_parent_operator = parent_operator_baker()
        unrelated_parent_operator.legal_name = 'i should not be deleted'
        unrelated_parent_operator.operator_index = 1
        unrelated_parent_operator.save(update_fields=["legal_name", "operator_index"])

        mock_payload = {
            "legal_name": "New Operator",
            "trade_name": "New Operator Trade Name",
            "cra_business_number": 963852741,
            "bc_corporate_registry_number": "adh1234321",
            "business_structure": BusinessStructure.objects.first().pk,
            "physical_street_address": "test physical street address",
            "physical_municipality": "test physical municipality",
            "physical_province": "BC",
            "physical_postal_code": "H0H0H0",
            "mailing_address_same_as_physical": True,
            "operator_has_parent_operators": True,
            "parent_operators_array": [
                {},
            ],
        }
        response = TestUtils.mock_put_with_auth_role(
            self,
            'industry_user',
            self.content_type,
            mock_payload,
            f"{self.user_operator_endpoint}/operator/{user_operator.id}",
        )
        assert response.status_code == 200

        parent_operators: List[ParentOperator] = child_operator.parent_operators.all()

        assert len(parent_operators) == 0  # archived records are not pulled

        # parent_operator_1 has been archived
        parent_operator_1.refresh_from_db()
        assert parent_operator_1.operator_index == 1
        assert parent_operator_1.archived_by is not None
        assert parent_operator_1.archived_at is not None

        # parent_operator_2 has been archived
        parent_operator_2.refresh_from_db()
        assert parent_operator_2.operator_index == 2
        assert parent_operator_2.archived_by is not None
        assert parent_operator_2.archived_at is not None

        # unrelated_parent_operator has the same id as parent_operator_1 and should be left alone as it doesn't belong to the child operator
        unrelated_parent_operator.refresh_from_db()
        assert unrelated_parent_operator.archived_by is None
        assert unrelated_parent_operator.archived_at is None

    ## STATUS
    def test_draft_status_changes_to_pending(self):

        operator = operator_baker()
        operator.created_by = self.user
        operator.status = 'Draft'
        operator.save(update_fields=["created_by", "status"])
        user_operator = baker.make(
            UserOperator, user=self.user, operator=operator, role=UserOperator.Roles.ADMIN, created_by=self.user
        )
        mock_payload = {
            "legal_name": "Put Operator Legal Name",
            "trade_name": "Put Operator Trade Name",
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
            self.content_type,
            mock_payload,
            custom_reverse_lazy('update_operator_and_user_operator', kwargs={'user_operator_id': user_operator.id}),
        )

        assert put_response.status_code == 200
        operator.refresh_from_db()
        assert operator.status == 'Pending'

    def test_put_user_operator_operator(self):
        operator = operator_baker()
        operator.created_by = self.user
        operator.save(update_fields=["created_by"])
        user_operator = baker.make(
            UserOperator, user=self.user, operator=operator, role=UserOperator.Roles.ADMIN, created_by=self.user
        )
        mock_payload = {
            "legal_name": "Put Operator Legal Name",
            "trade_name": "Put Operator Trade Name",
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
            self.content_type,
            mock_payload,
            custom_reverse_lazy('update_operator_and_user_operator', kwargs={'user_operator_id': user_operator.id}),
        )

        response_json = put_response.json()
        assert put_response.status_code == 200
        assert "user_operator_id" in response_json
        user_operator_id = response_json["user_operator_id"]
        user_operator = UserOperator.objects.get(id=user_operator_id)
        assert user_operator.user == self.user

        operator: Operator = user_operator.operator
        assert operator is not None
        assert operator.updated_by == self.user
        assert operator.updated_at is not None

    def test_put_user_operator_operator_malformed_data(self):
        operator = operator_baker()
        put_response = TestUtils.mock_put_with_auth_role(
            self,
            'industry_user',
            self.content_type,
            {"junk_data": "junk"},
            custom_reverse_lazy('update_operator_and_user_operator', kwargs={'user_operator_id': operator.id}),
        )

        assert put_response.status_code == 422

    def test_put_duplicates_not_allowed(self):
        operator_1 = operator_baker()
        operator_2 = operator_baker()

        user_operator = baker.make(UserOperator, user=self.user, operator=operator_2, role=UserOperator.Roles.ADMIN)

        # duplicate legal name
        payload_with_duplicate_legal_name = {
            "legal_name": operator_1.legal_name,
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
            self.content_type,
            payload_with_duplicate_legal_name,
            custom_reverse_lazy('update_operator_and_user_operator', kwargs={'user_operator_id': user_operator.id}),
        )
        assert put_response_duplicate_legal_name.status_code == 400
        assert put_response_duplicate_legal_name.json() == {
            'message': 'Legal Name: Operator with this Legal name already exists.'
        }
