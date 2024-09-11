from registration.constants import PAGE_SIZE
from registration.tests.utils.helpers import CommonTestSetup, TestUtils

from registration.tests.utils.bakers import operator_baker
from registration.utils import custom_reverse_lazy


class TestOperatorsEndpoint(CommonTestSetup):
    endpoint = CommonTestSetup.base_endpoint + "v2/operators"

    # AUTHORIZATION

    def test_unauthorized_roles_cannot_list_operators_v2(self):
        response = TestUtils.mock_get_with_auth_role(self, 'cas_pending', custom_reverse_lazy("list_operators_v2"))
        assert response.status_code == 401

    def test_operators_endpoint_list_operators_v2_paginated(self):
        # Create 60 operators with unique corp numbers
        for i in range(60):
            operator_baker()
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
            custom_reverse_lazy('list_operators_v2') + "?page=2&sort_field=created_at&sort_order=desc",
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
            custom_reverse_lazy('list_operators_v2') + "?page=2&sort_field=created_at&sort_order=asc",
        )
        assert response.status_code == 200
        response_data = response.json().get('items')
        # save the id of the first paginated response item
        page_2_response_id_reverse = response_data[0].get('id')
        assert len(response_data) == PAGE_SIZE
        # assert that the first item in the page 2 response is not the same as the first item in the page 2 response with reversed order
        assert page_2_response_id != page_2_response_id_reverse

    def test_operators_endpoint_list_operators_v2_with_filter(self):
        operator_baker({"legal_name": 'gouda'})
        operator_baker({"cra_business_number": '118675309'})
        for i in range(60):
            operator_baker()

        # Get the default page 1 response
        response = TestUtils.mock_get_with_auth_role(
            self, "cas_admin", custom_reverse_lazy('list_operators_v2') + "?legal_name=gouda"
        )
        assert response.status_code == 200
        response_data = response.json().get('items')
        assert len(response_data) == 1
        for item in response_data:
            assert item.get('legal_name') == 'gouda'

        # Test with a status filter that doesn't exist
        response = TestUtils.mock_get_with_auth_role(
            self, "cas_admin", custom_reverse_lazy('list_operators_v2') + "?legal_name=havarti"
        )
        assert response.status_code == 200
        response_data = response.json().get('items')
        assert len(response_data) == 0

        # Test with a cra_business_number filter
        response = TestUtils.mock_get_with_auth_role(
            self, "cas_admin", custom_reverse_lazy('list_operators_v2') + "?cra_business_number=118675309"
        )
        assert response.status_code == 200
        response_data = response.json().get('items')
        assert len(response_data) == 1

        # Test with a cra_business_number filter that doesn't exist
        response = TestUtils.mock_get_with_auth_role(
            self, "cas_admin", custom_reverse_lazy('list_operators_v2') + "?cra_business_number=backrolls"
        )
        assert response.status_code == 200
        response_data = response.json().get('items')
        assert len(response_data) == 0

        # Test with multiple filters (with business structure obj.first (BC Corp))
        response = TestUtils.mock_get_with_auth_role(
            self,
            "cas_admin",
            custom_reverse_lazy('list_operators_v2') + "?cra_business_number=118675309&business_structure=BC",
        )
        assert response.status_code == 200
        response_data = response.json().get('items')
        assert len(response_data) == 1
