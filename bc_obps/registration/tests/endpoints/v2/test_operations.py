from registration.tests.constants import MOCK_DATA_URL
from registration.constants import PAGE_SIZE
from model_bakery import baker
from localflavor.ca.models import CAPostalCodeField
from registration.models import (
    NaicsCode,
    Operation,
)
from registration.tests.utils.helpers import CommonTestSetup, TestUtils

from registration.tests.utils.bakers import operator_baker
from registration.utils import custom_reverse_lazy
import json

baker.generators.add(CAPostalCodeField, TestUtils.mock_postal_code)

fake_timestamp_from_past = '2024-01-09 14:13:08.888903-0800'
fake_timestamp_from_past_str_format = '%Y-%m-%d %H:%M:%S.%f%z'


class TestOperationsEndpoint(CommonTestSetup):
    endpoint = custom_reverse_lazy("list_operations_v2")

    # AUTHORIZATION

    def test_unauthorized_roles_cannot_list_operations_v2(self):
        response = TestUtils.mock_get_with_auth_role(self, 'cas_pending', self.endpoint)
        assert response.status_code == 401

    def test_operations_endpoint_list_operations_v2_paginated(self):
        operator1 = operator_baker()
        baker.make(
            Operation,
            operator_id=operator1.id,
            status=Operation.Statuses.PENDING,
            naics_code=baker.make(NaicsCode, naics_code=123456, naics_description='desc'),
            _quantity=60,
        )
        # Get the default page 1 response
        response = TestUtils.mock_get_with_auth_role(self, "cas_admin")
        assert response.status_code == 200
        response_data = response.json().get('items')
        # save the id of the first paginated response item
        page_1_response_id = response_data[0].get('id')
        assert len(response_data) == PAGE_SIZE
        # Get the page 2 response
        response = TestUtils.mock_get_with_auth_role(
            self,
            "cas_admin",
            self.endpoint + "?page=2&sort_field=created_at&sort_order=desc",
        )
        assert response.status_code == 200
        response_data = response.json().get('items')
        # save the id of the first paginated response item
        page_2_response_id = response_data[0].get('id')
        assert len(response_data) == PAGE_SIZE
        # assert that the first item in the page 1 response is not the same as the first item in the page 2 response
        assert page_1_response_id != page_2_response_id

        # Get the page 2 response but with a different sort order
        response = TestUtils.mock_get_with_auth_role(
            self,
            "cas_admin",
            self.endpoint + "?page=2&sort_field=created_at&sort_order=asc",
        )
        assert response.status_code == 200
        response_data = response.json().get('items')
        # save the id of the first paginated response item
        page_2_response_id_reverse = response_data[0].get('id')
        assert len(response_data) == PAGE_SIZE
        # assert that the first item in the page 2 response is not the same as the first item in the page 2 response with reversed order
        assert page_2_response_id != page_2_response_id_reverse

    def test_operations_endpoint_list_operations_v2_with_filter(self):
        operator1 = operator_baker()
        operator2 = operator_baker()

        baker.make(
            Operation,
            operator_id=operator1.id,
            name='Springfield Nuclear Power Plant',
            naics_code=baker.make(NaicsCode, naics_code=123456, naics_description='desc'),
            type='Gouda',
            status=Operation.Statuses.PENDING,
            _quantity=10,
        )
        baker.make(
            Operation,
            operator_id=operator2.id,
            name='Krusty Burger',
            naics_code=baker.make(NaicsCode, naics_code=123456, naics_description='desc'),
            type='Cheddar',
            status=Operation.Statuses.PENDING,
            _quantity=10,
        )
        baker.make(
            Operation,
            operator_id=operator2.id,
            name='Kwik-E-Mart',
            status=Operation.Statuses.DECLINED,
            bcghg_id=23219990023,
            naics_code=baker.make(NaicsCode, naics_code=123456, naics_description='desc'),
            type="Brie",
        )

        # Get the default page 1 response
        response = TestUtils.mock_get_with_auth_role(self, "cas_admin", self.endpoint + "?type=gouda")
        assert response.status_code == 200
        response_data = response.json().get('items')
        assert len(response_data) == 10
        for item in response_data:
            assert item.get('type') == 'Gouda'

        # Test with a status filter that doesn't exist
        response = TestUtils.mock_get_with_auth_role(self, "cas_admin", self.endpoint + "?type=havarti")
        assert response.status_code == 200
        response_data = response.json().get('items')
        assert len(response_data) == 0

        # Test with a name filter
        response = TestUtils.mock_get_with_auth_role(self, "cas_admin", self.endpoint + "?name=kwik-e-mart")
        assert response.status_code == 200
        response_data = response.json().get('items')
        assert len(response_data) == 1

        # Test with a name filter that doesn't exist
        response = TestUtils.mock_get_with_auth_role(self, "cas_admin", self.endpoint + "?name=abc")
        assert response.status_code == 200
        response_data = response.json().get('items')
        assert len(response_data) == 0

        # Test with multiple filters
        response = TestUtils.mock_get_with_auth_role(
            self,
            "cas_admin",
            self.endpoint + "?name=kwik&status=dec&bcghg_id=23219990023&type=brie",
        )
        assert response.status_code == 200
        response_data = response.json().get('items')
        assert len(response_data) == 1


class TestOperationsCurrentEndpoint(CommonTestSetup):
    endpoint = CommonTestSetup.base_endpoint + "operations"

    # AUTHORIZATION

    def test_unauthorized_roles_cannot_get_current_operations(self):
        # IRC users and unapproved industry users can't get
        for role in ['cas_pending', 'cas_admin', 'cas_analyst', 'industry_user']:
            response = TestUtils.mock_get_with_auth_role(
                self, role, custom_reverse_lazy("list_current_users_operations")
            )
            assert response.status_code == 401

    # GET
    def test_get_current_users_operations(self):
        approved_user_operator = baker.make_recipe('utils.approved_user_operator', user=self.user)
        operation = baker.make_recipe('utils.operation', operator=approved_user_operator.operator)

        # operation for a different user_operator
        baker.make_recipe('utils.operation')

        response = TestUtils.mock_get_with_auth_role(
            self, 'industry_user', custom_reverse_lazy("list_current_users_operations")
        )
        assert response.status_code == 200
        assert len(response.json()) == 1
        assert response.json()[0].get('name') == operation.name
        assert response.json()[0].get('id') == str(operation.id)


class TestPostOperationsEndpoint(CommonTestSetup):
    endpoint = CommonTestSetup.base_endpoint + "operations"
    mock_payload = {
        "registration_purpose": "Reporting Operation",
        "regulated_products": [1],
        "name": "op name",
        "type": "SFO",
        "naics_code_id": 1,
        "secondary_naics_code_id": 2,
        "tertiary_naics_code_id": 3,
        "activities": [1],
        "boundary_map": MOCK_DATA_URL,
        "process_flow_diagram": MOCK_DATA_URL,
    }

    # AUTHORIZATION

    def test_unauthorized_roles_cannot_post(self):
        # IRC users and unapproved industry users can't post
        for role in ['cas_pending', 'cas_admin', 'cas_analyst', 'industry_user']:
            response = TestUtils.mock_post_with_auth_role(
                self, role, json.dumps(self.mock_payload), custom_reverse_lazy("register_create_operation_information")
            )
            assert response.status_code == 401

    # GET
    def test_user_can_post_operation_success(self):
        baker.make_recipe('utils.approved_user_operator', user=self.user)
        response = TestUtils.mock_post_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            self.mock_payload,
            custom_reverse_lazy("register_create_operation_information"),
        )
        assert response.status_code == 200
        assert response.json().get('name') == "op name"
        assert response.json().get('id') is not None
