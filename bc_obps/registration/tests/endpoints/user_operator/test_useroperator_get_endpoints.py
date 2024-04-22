from typing import List
import json
from common.enums import AccessRequestStates, AccessRequestTypes
from common.service.email.email_service import EmailService
from model_bakery import baker
from localflavor.ca.models import CAPostalCodeField
from registration.models import (
    BusinessRole,
    BusinessStructure,
    Contact,
    Operator,
    ParentOperator,
    User,
    UserOperator,
    AppRole,
)
from registration.tests.utils.bakers import (
    address_baker,
    generate_random_bc_corporate_registry_number,
    generate_random_cra_business_number,
    operator_baker,
    user_baker,
    user_operator_baker,
    parent_operator_baker,
)
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.constants import PAGE_SIZE
from registration.utils import custom_reverse_lazy

baker.generators.add(CAPostalCodeField, TestUtils.mock_postal_code)


class TestUserOperatorGetEndpoint(CommonTestSetup):
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
        assert response.json()['operator_id'] == str(operator.id)  # String representation of the UUID

    def test_get_user_operator_data_industry_user_invalid_request(self):
        operator = operator_baker()
        TestUtils.authorize_current_user_as_operator_user(self, operator=operator)
        random_user_operator = user_operator_baker()

        response = TestUtils.mock_get_with_auth_role(
            self,
            'industry_user',
            custom_reverse_lazy('get_user_operator', kwargs={'user_operator_id': random_user_operator.id}),
        )
        # returns 401 because the user_operator does not belong to the current user
        assert response.status_code == 403

    def test_get_user_operator_data_internal_user(self):
        operator = operator_baker()
        user_operator = baker.make(UserOperator, operator=operator)

        response = TestUtils.mock_get_with_auth_role(
            self, 'cas_admin', custom_reverse_lazy('get_user_operator', kwargs={'user_operator_id': user_operator.id})
        )
        assert response.status_code == 200
        assert response.json()['operator_id'] == str(operator.id)  # String representation of the UUID

    def test_get_an_operators_user_operators_by_users_list(self):
        operator = operator_baker()
        # two UserOperator with the same operator
        baker.make(
            UserOperator,
            user=self.user,
            operator=operator,
            role=UserOperator.Roles.ADMIN,
            status=UserOperator.Statuses.APPROVED,
        )
        baker.make(
            UserOperator,
            user=baker.make(User, business_guid=self.user.business_guid),
            operator=operator,
            role=UserOperator.Roles.ADMIN,
            status=UserOperator.Statuses.APPROVED,
        )
        # a UserOperator with a different operator
        baker.make(
            UserOperator,
            user=user_baker(),
            operator=operator_baker(),
            role=UserOperator.Roles.ADMIN,
            status=UserOperator.Statuses.APPROVED,
        )

        response = TestUtils.mock_get_with_auth_role(
            self, 'industry_user', custom_reverse_lazy('get_user_operator_list_from_user')
        )

        assert len(json.loads(response.content)) == 2

    def test_get_user_operators_paginated(self):
        for i in range(60):
            baker.make(
                UserOperator,
                user=self.user,
                operator=baker.make(
                    Operator,
                    id=i,
                    bc_corporate_registry_number=generate_random_bc_corporate_registry_number(),
                    cra_business_number=generate_random_cra_business_number(),
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

    def test_get_user_operator_list_for_cas_users_when_operator_has_approved_admin(self):
        operator = operator_baker()
        admin_user = baker.make(User, app_role=AppRole.objects.get(role_name='industry_user'))
        # admin A approved by CAS
        baker.make(
            UserOperator,
            operator=operator,
            role=UserOperator.Roles.ADMIN,
            status=UserOperator.Statuses.APPROVED,
            verified_by=baker.make(User, app_role=AppRole.objects.get(role_name='cas_admin')),
        )
        # admin B approved by admin A
        baker.make(
            UserOperator,
            operator=operator,
            role=UserOperator.Roles.ADMIN,
            status=UserOperator.Statuses.APPROVED,
            verified_by=admin_user,
        )
        # pending admin request
        baker.make(UserOperator, operator=operator, role=UserOperator.Roles.ADMIN, status=UserOperator.Statuses.PENDING)
        # no role pending request
        baker.make(
            UserOperator, operator=operator, role=UserOperator.Roles.PENDING, status=UserOperator.Statuses.PENDING
        )
        # pending reporter request
        baker.make(
            UserOperator, operator=operator, role=UserOperator.Roles.REPORTER, status=UserOperator.Statuses.PENDING
        )

        response = TestUtils.mock_get_with_auth_role(self, "cas_admin", custom_reverse_lazy('list_user_operators'))
        assert response.status_code == 200
        response_data = response.json().get('data')

        # returns 1 since CAS users only see access requests they approved
        assert len(response_data) == 1

    def test_get_user_operator_list_for_cas_users_when_operator_does_not_have_an_admin(self):
        operator = operator_baker()
        # unapproved admin request #1
        baker.make(UserOperator, operator=operator, role=UserOperator.Roles.ADMIN, status=UserOperator.Statuses.PENDING)
        # unapproved admin request #2
        baker.make(UserOperator, operator=operator, role=UserOperator.Roles.ADMIN, status=UserOperator.Statuses.PENDING)
        # second access request
        baker.make(
            UserOperator, operator=operator, role=UserOperator.Roles.PENDING, status=UserOperator.Statuses.PENDING
        )

        response = TestUtils.mock_get_with_auth_role(self, "cas_admin", custom_reverse_lazy('list_user_operators'))
        assert response.status_code == 200
        response_data = response.json().get('data')

        # returns 3 since CAS sees all requests if there isn't an approved admin
        assert len(response_data) == 3

    def test_is_approved_admin_user_operator_with_approved_user(self):
        # self is an approved user_operator (this endpoint requires approval to access)
        user_operator_baker({'user': self.user, 'status': UserOperator.Statuses.APPROVED})

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
        # self is an approved user_operator (this endpoint requires approval to access)
        user_operator_baker({'user': self.user, 'status': UserOperator.Statuses.APPROVED})
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

    # /user-operator/user-operator-from-user ignores DECLINED records
    def test_get_user_operator_declined(self):
        user_operator = user_operator_baker()
        user_operator.user_id = self.user.user_guid
        user_operator.status = UserOperator.Statuses.DECLINED
        user_operator.save(update_fields=['user_id', 'status'])
        response = TestUtils.mock_get_with_auth_role(
            self, 'industry_user', custom_reverse_lazy('get_user_operator_from_user')
        )
        assert response.status_code == 404

    # /user-operator/user-operator-list-from-user ignores DECLINED records
    def test_get_user_operator(self):
        operator = operator_baker()
        operator.status = 'Approved'
        operator.save(update_fields=["created_by", "status"])
        # Approved user_operator record for the operator
        baker.make(
            UserOperator,
            user=self.user,
            operator=operator,
            role=UserOperator.Roles.ADMIN,
            created_by=self.user,
            status=UserOperator.Statuses.APPROVED,
        )
        # Declined user_operator record for the same operator
        baker.make(UserOperator, operator=operator, status=UserOperator.Statuses.DECLINED)
        response = TestUtils.mock_get_with_auth_role(
            self, 'industry_user', custom_reverse_lazy('get_user_operator_list_from_user')
        )
        response_json = response.json()
        assert response.status_code == 200
        assert len(response_json) == 1

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
        assert response_json == {"message": "Not Found"}

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

    # GET USER OPERATOR OPERATOR ID 401
    def test_get_user_operator_operator_with_invalid_user(self):
        # Act
        response = TestUtils.mock_get_with_auth_role(
            self, 'industry_user', custom_reverse_lazy('get_user_operator_operator')
        )

        # User_operator must be approved to see their operator info
        assert response.status_code == 401
