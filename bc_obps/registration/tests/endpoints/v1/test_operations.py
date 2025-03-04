import pytest
from model_bakery import baker
from localflavor.ca.models import CAPostalCodeField
from registration.models import (
    BcObpsRegulatedOperation,
    NaicsCode,
    Operation,
    UserOperator,
)
from registration.tests.utils.helpers import CommonTestSetup, TestUtils

from registration.tests.utils.bakers import operation_baker, operator_baker, user_operator_baker
from registration.constants import PAGE_SIZE
from registration.utils import custom_reverse_lazy

baker.generators.add(CAPostalCodeField, TestUtils.mock_postal_code)

fake_timestamp_from_past = '2024-01-09 14:13:08.888903-0800'
fake_timestamp_from_past_str_format = '%Y-%m-%d %H:%M:%S.%f%z'


class TestOperationsEndpoint(CommonTestSetup):
    endpoint = custom_reverse_lazy("v1_list_operations")

    # GET
    @pytest.mark.skip(
        "Test is failing due to the implementation of the Rls, but we don't have this functionality in Reg2 so we can skip it"
    )
    def test_get_all_operations_endpoint_based_on_role(self):
        pending_operation = operation_baker()
        pending_operation.status = Operation.Statuses.PENDING
        pending_operation.save(update_fields=['status'])
        operation_baker()  # this operation is not started

        # IRC users can get all operations excluding ones with a not started status
        for role in ['cas_admin', 'cas_analyst']:
            response = TestUtils.mock_get_with_auth_role(self, role)
            assert response.status_code == 200
            response_json = response.json()
            assert response_json.get('row_count') == 1
            response_data = response_json.get('data')[0]
            assert response_data.keys() == {  # Make sure the response has the expected keys based on the schema
                'id',
                'name',
                'bcghg_id',
                'status',
                'operator',
                'submission_date',
                'bc_obps_regulated_operation',
            }
            for key in response_data.keys():
                if key == 'operator':
                    assert response_data.get(key) == pending_operation.operator.legal_name
                elif key == 'id':
                    assert response_data.get(key) == str(
                        getattr(pending_operation, key)
                    )  # string representation of UUID
                else:
                    assert response_data.get(key) == getattr(pending_operation, key)

        # industry users can only get their own company's operations, and only if they're approved
        user_operator_instance = user_operator_baker()
        user_operator_instance.status = UserOperator.Statuses.APPROVED
        user_operator_instance.user_id = self.user.user_guid
        user_operator_instance.save(update_fields=['user', 'status'])
        users_operation = operation_baker(
            user_operator_instance.operator.id
        )  # operation that belongs to the user's operator
        response = TestUtils.mock_get_with_auth_role(self, "industry_user")
        assert response.status_code == 200
        response_json = response.json()
        assert response_json.get('row_count') == 1
        response_data = response_json.get('data')[0]
        assert response_data.keys() == {  # Make sure the response has the expected keys based on the schema
            'id',
            'name',
            'bcghg_id',
            'status',
            'operator',
            'submission_date',
            'bc_obps_regulated_operation',
        }
        for key in response_data.keys():
            if key == 'operator':
                assert response_data.get(key) == users_operation.operator.legal_name
            elif key == 'id':
                assert response_data.get(key) == str(getattr(users_operation, key))
            else:
                assert response_data.get(key) == getattr(users_operation, key)

    @pytest.mark.skip(
        "Test is failing due to the implementation of the Rls, but we don't have this functionality in Reg2 so we can skip it"
    )
    def test_operations_endpoint_get_method_with_mock_data(self):
        # IRC users can get all operations except ones with a not Started status
        operator1 = operator_baker()
        operator2 = operator_baker()
        baker.make(
            Operation,
            operator_id=operator1.id,
            status=Operation.Statuses.PENDING,
            naics_code=baker.make(NaicsCode, naics_code=123456, naics_description='desc'),
            _quantity=30,
        )
        baker.make(
            Operation,
            operator_id=operator2.id,
            status=Operation.Statuses.APPROVED,
            naics_code=baker.make(NaicsCode, naics_code=123456, naics_description='desc'),
            _quantity=30,
        )
        baker.make(
            Operation,
            operator_id=operator2.id,
            status=Operation.Statuses.NOT_STARTED,
            naics_code=baker.make(NaicsCode, naics_code=123456, naics_description='desc'),
        )
        for role in ['cas_admin', 'cas_analyst']:
            response = TestUtils.mock_get_with_auth_role(self, role)
            assert response.status_code == 200
            response_data = response.json().get('data')
            assert len(response_data) == PAGE_SIZE

        # industry users can only see their own company's operations, and only if they're approved
        baker.make(
            UserOperator, user_id=self.user.user_guid, status=UserOperator.Statuses.APPROVED, operator_id=operator1.id
        )
        response = TestUtils.mock_get_with_auth_role(self, "industry_user")
        assert response.status_code == 200
        response_data = response.json().get('data')
        assert len(response_data) == PAGE_SIZE

    def test_operations_endpoint_get_ignores_declined_user_operators(self):
        # Endpoint ignores user_operator records with a 'DECLINED' status
        operator1 = operator_baker()
        operator2 = operator_baker()
        baker.make_recipe(
            'registration.tests.utils.operation', operator_id=operator1.id, status=Operation.Statuses.PENDING
        )
        baker.make_recipe(
            'registration.tests.utils.operation', operator_id=operator2.id, status=Operation.Statuses.APPROVED
        )
        baker.make_recipe(
            'registration.tests.utils.operation', operator_id=operator2.id, status=Operation.Statuses.NOT_STARTED
        )
        baker.make(
            UserOperator, user_id=self.user.user_guid, status=UserOperator.Statuses.DECLINED, operator_id=operator1.id
        )
        baker.make(
            UserOperator, user_id=self.user.user_guid, status=UserOperator.Statuses.APPROVED, operator_id=operator2.id
        )
        response = TestUtils.mock_get_with_auth_role(self, "industry_user")
        assert response.status_code == 200
        response_data = response.json().get('data')
        assert len(response_data) == 2

    def test_operations_endpoint_get_method_paginated(self):
        operator1 = operator_baker()
        baker.make_recipe(
            'registration.tests.utils.operation',
            operator_id=operator1.id,
            status=Operation.Statuses.PENDING,
            _quantity=60,
        )
        # Get the default page 1 response
        response = TestUtils.mock_get_with_auth_role(self, "cas_admin")
        assert response.status_code == 200
        response_data = response.json().get('data')
        # save the id of the first paginated response item
        page_1_response_id = response_data[0].get('id')
        assert len(response_data) == PAGE_SIZE
        # Get the page 2 response
        response = TestUtils.mock_get_with_auth_role(
            self,
            "cas_admin",
            custom_reverse_lazy('v1_list_operations') + "?page=2&sort_field=id&sort_order=desc",
        )
        assert response.status_code == 200
        response_data = response.json().get('data')
        # save the id of the first paginated response item
        page_2_response_id = response_data[0].get('id')
        assert len(response_data) == PAGE_SIZE
        # assert that the first item in the page 1 response is not the same as the first item in the page 2 response
        assert page_1_response_id != page_2_response_id

        # Get the page 2 response but with a different sort order
        response = TestUtils.mock_get_with_auth_role(
            self,
            "cas_admin",
            custom_reverse_lazy('v1_list_operations') + "?page=2&sort_field=id&sort_order=asc",
        )
        assert response.status_code == 200
        response_data = response.json().get('data')
        # save the id of the first paginated response item
        page_2_response_id_reverse = response_data[0].get('id')
        assert len(response_data) == PAGE_SIZE
        # assert that the first item in the page 2 response is not the same as the first item in the page 2 response with reversed order
        assert page_2_response_id != page_2_response_id_reverse

    def test_operations_endpoint_get_method_with_filter(self):
        operator1 = operator_baker()
        operator2 = operator_baker()
        baker.make(
            BcObpsRegulatedOperation,
            id='21-0001',
        )
        baker.make_recipe(
            'registration.tests.utils.operation',
            operator_id=operator1.id,
            name='Springfield Nuclear Power Plant',
            status=Operation.Statuses.PENDING,
            _quantity=10,
        )
        baker.make_recipe(
            'registration.tests.utils.operation',
            operator_id=operator2.id,
            name='Krusty Burger',
            status=Operation.Statuses.APPROVED,
            _quantity=10,
        )
        baker.make_recipe(
            'registration.tests.utils.operation',
            operator_id=operator2.id,
            name='Kwik-E-Mart',
            status=Operation.Statuses.DECLINED,
            bcghg_id=baker.make_recipe('registration.tests.utils.bcghg_id'),
            bc_obps_regulated_operation_id='21-0001',
        )

        # Get the default page 1 response
        response = TestUtils.mock_get_with_auth_role(
            self, "cas_admin", custom_reverse_lazy('v1_list_operations') + "?status=approved"
        )

        assert response.status_code == 200
        response_data = response.json().get('data')
        assert len(response_data) == 10
        for item in response_data:
            assert item.get('status') == 'Approved'

        # Test with a status filter that doesn't exist
        response = TestUtils.mock_get_with_auth_role(
            self, "cas_admin", custom_reverse_lazy('v1_list_operations') + "?status=abc"
        )

        assert response.status_code == 200
        response_data = response.json().get('data')
        assert len(response_data) == 0

        # Test with a name filter
        response = TestUtils.mock_get_with_auth_role(
            self, "cas_admin", custom_reverse_lazy('v1_list_operations') + "?name=kwik-e-mart"
        )

        assert response.status_code == 200
        response_data = response.json().get('data')
        assert len(response_data) == 1

        # Test with a name filter that doesn't exist
        response = TestUtils.mock_get_with_auth_role(
            self, "cas_admin", custom_reverse_lazy('v1_list_operations') + "?name=abc"
        )

        assert response.status_code == 200
        response_data = response.json().get('data')
        assert len(response_data) == 0

        # Test with multiple filters
        response = TestUtils.mock_get_with_auth_role(
            self,
            "cas_admin",
            custom_reverse_lazy('v1_list_operations')
            + "?name=kwik&status=dec&bcghg_id=23219990023&bc_obps_regulated_operation=0001",
        )

        assert response.status_code == 200
        response_data = response.json().get('data')
        assert len(response_data) == 1

    # POST
    def test_authorized_roles_can_post_new_operation(self):
        operator = operator_baker()
        TestUtils.authorize_current_user_as_operator_user(self, operator)
        mock_operation = TestUtils.mock_create_operation_payload()
        post_response = TestUtils.mock_post_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            mock_operation,
            custom_reverse_lazy("v1_create_operation"),
        )

        assert post_response.status_code == 201
        assert post_response.json().get('name') == "Springfield Nuclear Power Plant"
        assert post_response.json().get('id') is not None
        # check that the default status of pending was applied
        get_response = TestUtils.mock_get_with_auth_role(self, "industry_user").json()
        get_response_data = get_response.get('data')[0]
        assert 'status' in get_response_data and get_response_data['status'] == 'Not Started'

    def test_post_new_operation_ignores_declined_user_operator_records(self):
        operator = operator_baker()
        operator2 = operator_baker()
        baker.make(
            UserOperator, user_id=self.user.user_guid, status=UserOperator.Statuses.DECLINED, operator_id=operator2.id
        )
        TestUtils.authorize_current_user_as_operator_user(self, operator)
        mock_operation = TestUtils.mock_create_operation_v1_payload()
        post_response = TestUtils.mock_post_with_auth_role(self, "industry_user", self.content_type, mock_operation)
        assert post_response.status_code == 201
        assert post_response.json().get('name') == "Springfield Nuclear Power Plant"
        assert post_response.json().get('id') is not None
        # check that the default status of pending was applied
        get_response = TestUtils.mock_get_with_auth_role(self, "industry_user").json()
        get_response_data = get_response.get('data')[0]
        assert 'status' in get_response_data and get_response_data['status'] == 'Not Started'
        post_response = TestUtils.mock_post_with_auth_role(
            self, "industry_user", self.content_type, mock_operation, endpoint=None
        )
        assert post_response.status_code == 201

    def test_post_new_malformed_operation(self):
        TestUtils.authorize_current_user_as_operator_user(self, operator_baker())
        response = TestUtils.mock_post_with_auth_role(
            self, "industry_user", self.content_type, {"garbage": "i am bad data"}
        )
        assert response.status_code == 422

    def test_post_existing_operation_with_same_bcghg_id(self):
        operation_instance = operation_baker()
        bcghg_id = baker.make_recipe('registration.tests.utils.bcghg_id')
        operation_instance.bcghg_id = bcghg_id
        operation_instance.save(update_fields=['bcghg_id'])
        mock_operation2 = TestUtils.mock_create_operation_v1_payload()
        mock_operation2['bcghg_id'] = bcghg_id.id
        operator = operator_baker()
        TestUtils.authorize_current_user_as_operator_user(self, operator)
        post_response = TestUtils.mock_post_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            mock_operation2,
            custom_reverse_lazy("v1_create_operation"),
        )

        assert post_response.status_code == 400
        assert post_response.json().get('message') == "Operation with this BCGHG ID already exists."

    # PUT
    def test_only_approved_industry_users_can_create_operations(self):
        operator = operator_baker()
        user_operator = user_operator_baker(
            {'user': self.user, 'operator': operator, 'status': UserOperator.Statuses.PENDING}
        )
        mock_create_operation = TestUtils.mock_create_operation_payload()

        # PENDING user
        post_response_1 = TestUtils.mock_post_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            mock_create_operation,
            custom_reverse_lazy("v1_create_operation"),
        )
        assert post_response_1.status_code == 401

        # DECLINED user
        user_operator.status = UserOperator.Statuses.DECLINED
        user_operator.save(update_fields=['status'])
        post_response_2 = TestUtils.mock_post_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            mock_create_operation,
            custom_reverse_lazy("v1_create_operation"),
        )
        assert post_response_2.status_code == 401

        # APPROVED user
        user_operator.status = UserOperator.Statuses.APPROVED
        user_operator.save(update_fields=['status'])
        post_response_3 = TestUtils.mock_post_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            mock_create_operation,
            custom_reverse_lazy("v1_create_operation"),
        )
        assert post_response_3.status_code == 201
