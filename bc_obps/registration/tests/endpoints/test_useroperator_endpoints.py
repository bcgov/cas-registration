from typing import List
import json
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


class TestUserOperatorEndpoint(CommonTestSetup):
    # def test_user_operator_unauthorized_users_cannot_get(self):
    #     # /is-approved-admin-user-operator
    #     response = TestUtils.mock_get_with_auth_role(
    #         self,
    #         'cas_pending',
    #         custom_reverse_lazy('is_approved_admin_user_operator', kwargs={'user_guid': self.user.user_guid}),
    #     )
    #     assert response.status_code == 401
    #     response = TestUtils.mock_get_with_auth_role(
    #         self,
    #         'cas_admin',
    #         custom_reverse_lazy('is_approved_admin_user_operator', kwargs={'user_guid': self.user.user_guid}),
    #     )
    #     assert response.status_code == 401
    #     response = TestUtils.mock_get_with_auth_role(
    #         self,
    #         'cas_analyst',
    #         custom_reverse_lazy('is_approved_admin_user_operator', kwargs={'user_guid': self.user.user_guid}),
    #     )
    #     assert response.status_code == 401

    #     # /select-operator/user-operator/{user_operator_id}
    #     user_operator = user_operator_baker()
    #     response = TestUtils.mock_get_with_auth_role(
    #         self, 'cas_pending', custom_reverse_lazy('get_user_operator', kwargs={'user_operator_id': user_operator.id})
    #     )
    #     assert response.status_code == 401

    #     # /operator-has-admin/{operator_id}
    #     operator = operator_baker()
    #     response = TestUtils.mock_get_with_auth_role(
    #         self,
    #         'cas_pending',
    #         custom_reverse_lazy('get_user_operator_admin_exists', kwargs={'operator_id': operator.id}),
    #     )
    #     assert response.status_code == 401

    #     # user-operator-id
    #     response = TestUtils.mock_get_with_auth_role(self, 'cas_pending', custom_reverse_lazy('get_user_operator_id'))
    #     assert response.status_code == 401
    #     response = TestUtils.mock_get_with_auth_role(self, 'cas_admin', custom_reverse_lazy('get_user_operator_id'))
    #     assert response.status_code == 401
    #     response = TestUtils.mock_get_with_auth_role(self, 'cas_analyst', custom_reverse_lazy('get_user_operator_id'))
    #     assert response.status_code == 401

    #     # /user-operator-operator
    #     response = TestUtils.mock_get_with_auth_role(
    #         self, 'cas_pending', custom_reverse_lazy('get_user_operator_operator')
    #     )
    #     assert response.status_code == 401

    #     # user-operator-status-from-user
    #     response = TestUtils.mock_get_with_auth_role(
    #         self, 'cas_pending', custom_reverse_lazy('get_user_operator_operator')
    #     )
    #     assert response.status_code == 401
    #     response = TestUtils.mock_get_with_auth_role(
    #         self, 'cas_admin', custom_reverse_lazy('get_user_operator_operator')
    #     )
    #     assert response.status_code == 401
    #     response = TestUtils.mock_get_with_auth_role(
    #         self, 'cas_analyst', custom_reverse_lazy('get_user_operator_operator')
    #     )
    #     assert response.status_code == 401

    # def test_user_operator_unauthorized_users_cannot_post(self):
    #     # select-operator/request-access
    #     operator = operator_baker()
    #     for role in ['cas_pending', 'cas_admin', 'cas_analyst']:
    #         response = TestUtils.mock_post_with_auth_role(
    #             self,
    #             role,
    #             self.content_type,
    #             {'operator_id': operator.id},
    #             custom_reverse_lazy('request_access'),
    #         )
    #         assert response.status_code == 401
    #     # /select-operator/request-admin-access
    #     for role in ['cas_pending', 'cas_admin', 'cas_analyst']:
    #         response = TestUtils.mock_post_with_auth_role(
    #             self,
    #             role,
    #             self.content_type,
    #             {'operator_id': operator.id},
    #             custom_reverse_lazy('request_admin_access'),
    #         )
    #         assert response.status_code == 401

    #     # user-operator/operator
    #     mock_data = TestUtils.mock_UserOperatorOperatorIn()
    #     mock_data.business_structure = mock_data.business_structure.pk  # a to bypass double validation by the schema
    #     response = TestUtils.mock_post_with_auth_role(
    #         self,
    #         'cas_pending',
    #         self.content_type,
    #         mock_data.json(),
    #         custom_reverse_lazy('create_operator_and_user_operator'),
    #     )
    #     assert response.status_code == 401
    #     response = TestUtils.mock_post_with_auth_role(
    #         self,
    #         'cas_analyst',
    #         self.content_type,
    #         mock_data.json(),
    #         custom_reverse_lazy('create_operator_and_user_operator'),
    #     )
    #     assert response.status_code == 401
    #     response = TestUtils.mock_post_with_auth_role(
    #         self,
    #         'cas_admin',
    #         self.content_type,
    #         mock_data.json(),
    #         custom_reverse_lazy('create_operator_and_user_operator'),
    #     )
    #     assert response.status_code == 401

    def test_unauthorized_users_cannot_put(self):
        # user-operator/update-status
        user = baker.make(User)
        response = TestUtils.mock_put_with_auth_role(
            self,
            'cas_pending',
            self.content_type,
            {'status': 'Approved', 'user_guid': user.user_guid},
            custom_reverse_lazy('update_user_operator_status'),
        )
        assert response.status_code == 401

        # only industry_user admins can change statuses
        operator = operator_baker({'status': Operator.Statuses.APPROVED, 'is_new': False})
        user_operator = TestUtils.authorize_current_user_as_operator_user(self, operator=operator)
        user_operator.role = UserOperator.Roles.REPORTER
        user_operator.save()

        subsequent_user_operator = baker.make(UserOperator, operator=operator)

        response = TestUtils.mock_put_with_auth_role(
            self,
            'industry_user',
            self.content_type,
            {
                "role": UserOperator.Roles.REPORTER,
                "status": UserOperator.Statuses.APPROVED,
                "user_operator_id": subsequent_user_operator.id,
            },
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
        user_operator = user_operator_baker()
        for role in ['cas_pending', 'cas_admin', 'cas_analyst']:
            response = TestUtils.mock_put_with_auth_role(
                self,
                role,
                self.content_type,
                mock_payload,
                custom_reverse_lazy('update_operator_and_user_operator', kwargs={'user_operator_id': user_operator.id}),
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

    def test_get_operator_by_users_list(self):
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
        assert response_1_json == {'message': 'Operator must be approved before approving or declining users.'}

    def test_industry_user_can_update_status_of_a_user_operator(self):
        operator = operator_baker({'status': Operator.Statuses.APPROVED, 'is_new': False})
        TestUtils.authorize_current_user_as_operator_user(self, operator=operator)
        subsequent_user_operator = baker.make(UserOperator, operator=operator)
        response = TestUtils.mock_put_with_auth_role(
            self,
            'industry_user',
            self.content_type,
            {
                "role": UserOperator.Roles.REPORTER,
                "status": UserOperator.Statuses.APPROVED,
                "user_operator_id": subsequent_user_operator.id,
            },
            custom_reverse_lazy('update_user_operator_status'),
        )
        assert response.status_code == 200

    def test_industry_user_cannot_update_status_of_a_user_operator_from_a_different_operator(self):
        operator = operator_baker({'status': Operator.Statuses.APPROVED, 'is_new': False})
        TestUtils.authorize_current_user_as_operator_user(self, operator=operator)
        other_operator = operator_baker({'status': Operator.Statuses.APPROVED, 'is_new': False})
        other_user_operator = baker.make(UserOperator, operator=other_operator)
        response = TestUtils.mock_put_with_auth_role(
            self,
            'industry_user',
            self.content_type,
            {
                "role": UserOperator.Roles.REPORTER,
                "status": UserOperator.Statuses.APPROVED,
                "user_operator_id": other_user_operator.id,
            },
            custom_reverse_lazy('update_user_operator_status'),
        )
        assert response.status_code == 403

    def test_user_operator_put_can_update_status(self):
        operator = operator_baker({'status': Operator.Statuses.APPROVED, 'is_new': False})
        user_operator = user_operator_baker({'operator': operator})

        response_2 = TestUtils.mock_put_with_auth_role(
            self,
            'cas_admin',
            self.content_type,
            {
                "role": UserOperator.Roles.REPORTER,
                "status": UserOperator.Statuses.APPROVED,
                "user_operator_id": user_operator.id,
            },
            custom_reverse_lazy('update_user_operator_status'),
        )
        assert response_2.status_code == 200
        user_operator.refresh_from_db()  # refresh the user_operator object to get the updated status
        assert user_operator.status == UserOperator.Statuses.APPROVED
        assert user_operator.role == UserOperator.Roles.REPORTER
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
        assert user_operator.role == UserOperator.Roles.PENDING
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
            role=UserOperator.Roles.PENDING,
        ).exists()

        assert user_operator_exists, "UserOperator object was not created"

    def test_request_access_with_invalid_payload(self):
        invalid_payload = {"operator_id": 99999}  # Invalid operator ID

        response = TestUtils.mock_post_with_auth_role(
            self, 'industry_user', self.content_type, invalid_payload, custom_reverse_lazy('request_admin_access')
        )
        assert response.status_code == 422
        assert response.json().get('detail')[0].get('msg') == 'value is not a valid uuid'

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

    # /user-operator-from-user ignores DECLINED records
    def test_get_user_operator(self):
        user_operator = user_operator_baker()
        user_operator.user_id = self.user.user_guid
        user_operator.status = UserOperator.Statuses.DECLINED
        user_operator.save(update_fields=['user_id', 'status'])
        response = TestUtils.mock_get_with_auth_role(
            self, 'industry_user', custom_reverse_lazy('get_user_operator_from_user')
        )
        assert response.status_code == 404

    # /GET operator-access-declined
    def test_get_user_operator(self):
        user_operator = user_operator_baker()
        user_operator.user_id = self.user.user_guid
        user_operator.status = UserOperator.Statuses.DECLINED
        user_operator.save(update_fields=['user_id', 'status'])
        response = TestUtils.mock_get_with_auth_role(
            self,
            'industry_user',
            custom_reverse_lazy('operator_access_declined', kwargs={'operator_id': user_operator.operator_id}),
        )
        response_json = response.json()
        assert response.status_code == 200
        print(response_json)
        assert response_json == True

    # /user-operator-list-from-user ignores DECLINED records
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
        assert post_response_duplicate_legal_name.status_code == 422
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
        assert post_response_duplicate_bc_corporate_registry_number.status_code == 422
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
        user_operator = baker.make(
            UserOperator, operator=child_operator, user=self.user, role='admin', status='Approved'
        )

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
            UserOperator,
            user=self.user,
            operator=operator,
            role=UserOperator.Roles.ADMIN,
            created_by=self.user,
            status=UserOperator.Statuses.APPROVED,
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
            UserOperator,
            user=self.user,
            operator=operator,
            role=UserOperator.Roles.ADMIN,
            created_by=self.user,
            status=UserOperator.Statuses.APPROVED,
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
            "operator_has_parent_operators": False,
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
        assert mock_payload == {
            "legal_name": operator.legal_name,
            "trade_name": operator.trade_name,
            "cra_business_number": operator.cra_business_number,
            "bc_corporate_registry_number": operator.bc_corporate_registry_number,
            "business_structure": operator.business_structure.pk,
            "physical_street_address": operator.physical_address.street_address,
            "physical_municipality": operator.physical_address.municipality,
            "physical_province": operator.physical_address.province,
            "physical_postal_code": operator.physical_address.postal_code,
            "mailing_address_same_as_physical": operator.mailing_address_id == operator.physical_address_id,
            "mailing_street_address": operator.mailing_address.street_address,
            "mailing_municipality": operator.mailing_address.municipality,
            "mailing_province": operator.mailing_address.province,
            "mailing_postal_code": operator.mailing_address.postal_code,
            "operator_has_parent_operators": operator.parent_operators.exists(),
            "parent_operators_array": list(operator.parent_operators.all()),
        }

    def test_put_user_operator_operator_with_an_existing_cra_business_number(self):
        self.user.role = 'industry_user'
        existing_operator = operator_baker()
        new_operator = operator_baker({'created_by': self.user})
        user_operator = baker.make(
            UserOperator,
            user=self.user,
            operator=new_operator,
            role=UserOperator.Roles.ADMIN,
            created_by=self.user,
            status=UserOperator.Statuses.APPROVED,
        )
        mock_payload = {
            "legal_name": "Put Operator Legal Name",
            "trade_name": "Put Operator Trade Name",
            "cra_business_number": existing_operator.cra_business_number,
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
            "operator_has_parent_operators": False,
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
        assert put_response.status_code == 400
        assert response_json == {"message": "Operator with this CRA Business Number already exists."}

    def test_put_user_operator_operator_unauthorized(self):
        operator = operator_baker()
        operator.created_by = self.user
        operator.save(update_fields=["created_by"])
        mock_payload = {
            "legal_name": "Unauthorized",
            "trade_name": "Unauthorized",
            "cra_business_number": 678123654,
            "bc_corporate_registry_number": "jkl1234321",
            "business_structure": BusinessStructure.objects.first().pk,
            "physical_street_address": "add",
            "physical_municipality": "add",
            "physical_province": "BC",
            "physical_postal_code": "H0H0H0",
            "mailing_address_same_as_physical": True,
            "operator_has_parent_operators": False,
        }
        user_operator = baker.make(
            UserOperator, user=self.user, operator=operator, role=UserOperator.Roles.REPORTER, created_by=self.user
        )
        # Test REPORTER 401
        put_response = TestUtils.mock_put_with_auth_role(
            self,
            'industry_user',
            self.content_type,
            mock_payload,
            custom_reverse_lazy('update_operator_and_user_operator', kwargs={'user_operator_id': user_operator.id}),
        )
        user_operator.role = UserOperator.Roles.PENDING
        user_operator.save(update_fields=["role"])
        # Test PENDING 401
        put_response = TestUtils.mock_put_with_auth_role(
            self,
            'industry_user',
            self.content_type,
            mock_payload,
            custom_reverse_lazy('update_operator_and_user_operator', kwargs={'user_operator_id': user_operator.id}),
        )

        assert put_response.status_code == 401

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

        user_operator = baker.make(
            UserOperator,
            user=self.user,
            operator=operator_2,
            role=UserOperator.Roles.ADMIN,
            status=UserOperator.Statuses.APPROVED,
        )

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
        assert put_response_duplicate_legal_name.status_code == 422
        assert put_response_duplicate_legal_name.json() == {
            'message': 'Legal Name: Operator with this Legal name already exists.'
        }
