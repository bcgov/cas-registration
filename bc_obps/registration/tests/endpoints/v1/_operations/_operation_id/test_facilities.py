from bc_obps.settings import NINJA_PAGINATION_PER_PAGE
from registration.models import Facility
from registration.tests.utils.bakers import facility_ownership_timeline_baker, operation_baker
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy


class TestFacilitiesEndpoint(CommonTestSetup):
    endpoint = CommonTestSetup.base_endpoint + "facilities"

    # AUTHORIZATION
    def test_unauthorized_roles_cannot_list_facilities(self):
        response = TestUtils.mock_get_with_auth_role(
            self,
            'cas_pending',
            custom_reverse_lazy("list_facilities", kwargs={'operation_id': '12345678-1234-5678-1234-567812345678'}),
        )
        assert response.status_code == 401

    # GET
    def test_facilities_endpoint_list_facilities_paginated(self):
        operation = operation_baker()
        facility_ownership_timeline_baker(operation_id=operation.id, _quantity=45)
        facilities_url = custom_reverse_lazy('list_facilities', kwargs={'operation_id': operation.id})
        # Get the default page 1 response
        response = TestUtils.mock_get_with_auth_role(self, "cas_admin", facilities_url)
        assert response.status_code == 200
        response_items_1 = response.json().get('items')
        response_count_1 = response.json().get('count')
        # save the id of the first paginated response item
        page_1_response_id = response_items_1[0].get('id')
        assert len(response_items_1) == NINJA_PAGINATION_PER_PAGE
        assert response_count_1 == 45  # total count of facilities
        # Get the page 2 response
        response = TestUtils.mock_get_with_auth_role(
            self,
            "cas_admin",
            facilities_url + "?page=2&sort_field=created_at&sort_order=desc",
        )
        assert response.status_code == 200
        response_items_2 = response.json().get('items')
        response_count_2 = response.json().get('count')
        # save the id of the first paginated response item
        page_2_response_id = response_items_2[0].get('id')
        assert len(response_items_2) == NINJA_PAGINATION_PER_PAGE
        # assert that the first item in the page 1 response is not the same as the first item in the page 2 response
        assert page_1_response_id != page_2_response_id
        assert response_count_2 == response_count_1  # total count of facilities should be the same

        # Get the page 2 response but with a different sort order
        response = TestUtils.mock_get_with_auth_role(
            self,
            "cas_admin",
            facilities_url + "?page=2&sort_field=created_at&sort_order=asc",
        )
        assert response.status_code == 200
        response_items_2_reverse = response.json().get('items')
        # save the id of the first paginated response item
        page_2_response_id_reverse = response_items_2_reverse[0].get('id')
        assert len(response_items_2_reverse) == NINJA_PAGINATION_PER_PAGE
        # assert that the first item in the page 2 response is not the same as the first item in the page 2 response with reversed order
        assert page_2_response_id != page_2_response_id_reverse

        # make sure sorting is working
        page_2_first_facility = Facility.objects.get(pk=page_2_response_id)
        page_2_first_facility_reverse = Facility.objects.get(pk=page_2_response_id_reverse)
        assert page_2_first_facility.created_at > page_2_first_facility_reverse.created_at

    def test_facilities_endpoint_list_facilities_with_filter(self):
        operation = operation_baker()
        facility_ownership_timeline_baker(operation_id=operation.id, _quantity=25)
        facilities_url = custom_reverse_lazy('list_facilities', kwargs={'operation_id': operation.id})

        # Get the default page 1 response
        response = TestUtils.mock_get_with_auth_role(
            self, "cas_admin", facilities_url + "?type=Large"
        )  # filtering Large LFOs
        assert response.status_code == 200
        response_items_1 = response.json().get('items')
        for item in response_items_1:
            assert item.get('type') == Facility.Types.LARGE_LFO

        # Test with a type filter that doesn't exist
        response = TestUtils.mock_get_with_auth_role(
            self, "cas_admin", facilities_url + "?type=a_type_that_does_not_exist"
        )
        assert response.status_code == 200
        assert response.json().get('count') == 0

        # Test with a name filter
        name_to_filter = response_items_1[0].get('name')  # get the name of the first item in the response to test with
        response = TestUtils.mock_get_with_auth_role(self, "cas_admin", facilities_url + f"?name={name_to_filter}")
        assert response.status_code == 200
        response_items_2 = response.json().get('items')
        assert len(response_items_2) == 1
        assert response.json().get('count') == 1
        assert response_items_2[0].get('name') == name_to_filter

        # Test with a name filter that doesn't exist
        response = TestUtils.mock_get_with_auth_role(
            self, "cas_admin", facilities_url + "?name=a_name_that_does_not_exist"
        )
        assert response.status_code == 200
        assert response.json().get('count') == 0

        # Test with multiple filters
        response = TestUtils.mock_get_with_auth_role(
            self, "cas_admin", facilities_url + f"?type=Large&name={name_to_filter}"
        )
        assert response.status_code == 200
        response_items_3 = response.json().get('items')
        assert len(response_items_3) == 1
        assert response.json().get('count') == 1
        assert response_items_3[0].get('name') == name_to_filter
        assert response_items_3[0].get('type') == Facility.Types.LARGE_LFO
