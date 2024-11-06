from registration.constants import PAGE_SIZE
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.tests.utils.bakers import operator_baker
from registration.utils import custom_reverse_lazy


class TestOperatorsEndpoint(CommonTestSetup):
    endpoint = custom_reverse_lazy("list_operators_v2")

    def test_operators_endpoint_list_operators_v2_paginated(self):
        # Create 60 operators with unique corp numbers
        for i in range(60):
            operator_baker()
        # Get the default response data for page 1
        response = TestUtils.mock_get_with_auth_role(self, "cas_admin")
        assert response.status_code == 200
        response_data = response.json().get('items')
        # id for comparing difference in sort responses
        page_1_id = response_data[0].get('id')
        assert PAGE_SIZE == len(response_data)
        # Get the page 2
        response = TestUtils.mock_get_with_auth_role(
            self,
            "cas_admin",
            self.endpoint + "?page=2&sort_field=created_at&sort_order=desc",
        )
        assert response.status_code == 200
        response_data = response.json().get('items')
        # save the id of the first response item
        page_2_id = response_data[0].get('id')
        assert PAGE_SIZE == len(response_data)
        # assert that the first item in the page 1 is not the same as the first item in the page 2
        assert page_1_id != page_2_id

        # Get the page 2 response but with a different sort order
        response = TestUtils.mock_get_with_auth_role(
            self,
            "cas_admin",
            self.endpoint + "?page=2&sort_field=created_at&sort_order=asc",
        )
        assert response.status_code == 200
        response_data = response.json().get('items')
        # save the id of the first response item
        page_2_id_reverse = response_data[0].get('id')
        assert len(response_data) == PAGE_SIZE
        # assert that the first item in the page 2 response is not the same as the first item in the page 2 response with reversed order
        assert page_2_id != page_2_id_reverse

    def test_operators_endpoint_list_operators_v2_with_filter(self):
        operator_baker({"legal_name": 'Pecorino Romano'})
        operator_baker({"cra_business_number": '118675309'})
        for i in range(60):
            operator_baker()

        # Get the default page 1 response
        response = TestUtils.mock_get_with_auth_role(self, "cas_admin", self.endpoint + "?legal_name=Pecorino Romano")
        assert response.status_code == 200
        response_data = response.json().get('items')
        assert len(response_data) == 1
        assert response_data[0].get('legal_name') == 'Pecorino Romano'

        # Test with a status filter that doesn't exist
        response = TestUtils.mock_get_with_auth_role(
            self, "cas_admin", self.endpoint + "?legal_name=Parmegiano Reggiano"
        )
        assert response.status_code == 200
        response_data = response.json().get('items')
        assert len(response_data) == 0

        # Test with a cra_business_number filter
        response = TestUtils.mock_get_with_auth_role(
            self, "cas_admin", self.endpoint + "?cra_business_number=118675309"
        )
        assert response.status_code == 200
        response_data = response.json().get('items')
        assert len(response_data) == 1
        assert response_data[0].get('cra_business_number') == 118675309

        # Test with a cra_business_number filter that doesn't exist
        response = TestUtils.mock_get_with_auth_role(
            self, "cas_admin", self.endpoint + "?cra_business_number=backrolls"
        )
        assert response.status_code == 200
        response_data = response.json().get('items')
        assert len(response_data) == 0

        # Test with multiple filters (with business structure obj.first (BC Corp))
        response = TestUtils.mock_get_with_auth_role(
            self,
            "cas_admin",
            self.endpoint + "?cra_business_number=118675309&business_structure=BC",
        )
        assert response.status_code == 200
        response_data = response.json().get('items')
        assert len(response_data) == 1
        assert response_data[0].get('cra_business_number') == 118675309
        assert response_data[0].get('business_structure') == 'BC Corporation'
