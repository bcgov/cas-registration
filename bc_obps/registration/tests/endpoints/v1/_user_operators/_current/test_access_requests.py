from model_bakery import baker
from registration.models import (
    BusinessStructure,
    Operator,
    User,
    UserOperator,
    AppRole,
)
from registration.tests.utils.bakers import (
    address_baker,
    generate_random_bc_corporate_registry_number,
    generate_random_cra_business_number,
    operator_baker,
)
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.constants import PAGE_SIZE
from registration.utils import custom_reverse_lazy


class TestAccessRequestsEndpoint(CommonTestSetup):
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
        response = TestUtils.mock_get_with_auth_role(self, 'cas_admin', custom_reverse_lazy('v1_list_user_operators'))
        assert response.status_code == 200
        response_data = response.json().get('data')
        # save the id of the first paginated response item
        page_1_response_id = response_data[0].get('id')
        assert len(response_data) == PAGE_SIZE
        # Get the page 2 response
        response = TestUtils.mock_get_with_auth_role(
            self,
            "cas_admin",
            custom_reverse_lazy('v1_list_user_operators') + "?page=2&sort_field=id&sort_order=desc",
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
            custom_reverse_lazy('v1_list_user_operators') + "?page=2&sort_field=id&sort_order=asc",
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

        response = TestUtils.mock_get_with_auth_role(self, "cas_admin", custom_reverse_lazy('v1_list_user_operators'))
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

        response = TestUtils.mock_get_with_auth_role(self, "cas_admin", custom_reverse_lazy('v1_list_user_operators'))
        assert response.status_code == 200
        response_data = response.json().get('data')

        # returns 3 since CAS sees all requests if there isn't an approved admin
        assert len(response_data) == 3
