from registration.models.facility_designated_operation_timeline import FacilityDesignatedOperationTimeline
from bc_obps.settings import NINJA_PAGINATION_PER_PAGE
from registration.models import Facility
from registration.tests.utils.bakers import (
    operation_baker,
    operator_baker,
)
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy
from model_bakery import baker


class TestFacilitiesEndpoint(CommonTestSetup):
    # GET
    def test_facilities_endpoint_list_facilities_paginated(self):

        timeline = baker.make_recipe('utils.facility_designated_operation_timeline', _quantity=45)

        facilities_url = custom_reverse_lazy(
            'list_facilities_by_operation_id', kwargs={'operation_id': timeline[0].operation.id}
        )
        # Get the default page 1 response
        response = TestUtils.mock_get_with_auth_role(self, "cas_admin", facilities_url)
        assert response.status_code == 200
        response_items_1 = response.json().get('items')
        response_count_1 = response.json().get('count')
        # save the id of the first paginated response item
        page_1_response_id = response_items_1[0].get('id')
        assert len(response_items_1) == NINJA_PAGINATION_PER_PAGE
        assert response_count_1 == 45  # total count of facilities
        # make sure key fields are present
        assert response_items_1[0].keys() == {
            'id',
            'status',
            'facility__name',
            'facility__type',
            'facility__bcghg_id__id',
            'facility__id',
            'facility__latitude_of_largest_emissions',
            'facility__longitude_of_largest_emissions',
        }

        # Get the page 2 response
        response = TestUtils.mock_get_with_auth_role(
            self,
            "cas_admin",
            facilities_url + "?page=2&sort_field=id&sort_order=desc",
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
            facilities_url + "?page=2&sort_field=id&sort_order=asc",
        )
        assert response.status_code == 200
        response_items_2_reverse = response.json().get('items')
        # save the id of the first paginated response item
        page_2_response_id_reverse = response_items_2_reverse[0].get('id')
        assert len(response_items_2_reverse) == NINJA_PAGINATION_PER_PAGE
        # assert that the first item in the page 2 response is not the same as the first item in the page 2 response with reversed order
        assert page_2_response_id != page_2_response_id_reverse

        # make sure sorting is working
        page_2_first_facility = FacilityDesignatedOperationTimeline.objects.get(pk=page_2_response_id)
        page_2_first_facility_reverse = FacilityDesignatedOperationTimeline.objects.get(pk=page_2_response_id_reverse)
        assert page_2_first_facility.id > page_2_first_facility_reverse.id

    def test_facilities_endpoint_list_facilities_with_filter(self):
        timeline = baker.make_recipe('utils.facility_designated_operation_timeline', _quantity=25)
        named_facility = baker.make_recipe('utils.facility', name='Mynameis', type=Facility.Types.MEDIUM_FACILITY)
        baker.make_recipe(
            'utils.facility_designated_operation_timeline', facility=named_facility, operation=timeline[0].operation
        )

        facilities_url = custom_reverse_lazy(
            'list_facilities_by_operation_id', kwargs={'operation_id': timeline[0].operation.id}
        )

        # Get the default page 1 response
        response = TestUtils.mock_get_with_auth_role(
            self, "cas_admin", facilities_url + "?facility__type=Large"
        )  # filtering Large Facility
        assert response.status_code == 200

        response_items_1 = response.json().get('items')
        assert len(response_items_1) == 25

        for item in response_items_1:
            assert item.get('facility__type') == Facility.Types.LARGE_FACILITY

        # Test with a type filter that doesn't exist
        response = TestUtils.mock_get_with_auth_role(
            self, "cas_admin", facilities_url + "?facility__type=a_type_that_does_not_exist"
        )
        assert response.status_code == 200
        assert response.json().get('count') == 0

        # Test with a name filter
        response = TestUtils.mock_get_with_auth_role(self, "cas_admin", facilities_url + "?facility__name=Myname")
        assert response.status_code == 200
        response_items_2 = response.json().get('items')
        assert len(response_items_2) == 1
        assert response.json().get('count') == 1
        assert response_items_2[0].get('facility__name') == "Mynameis"

        # Test with a name filter that doesn't exist
        response = TestUtils.mock_get_with_auth_role(
            self, "cas_admin", facilities_url + "?facility__name=a_name_that_does_not_exist"
        )
        assert response.status_code == 200
        assert response.json().get('count') == 0

        # Test with multiple filters
        response = TestUtils.mock_get_with_auth_role(
            self, "cas_admin", facilities_url + "?facility__type=Medium Facility&facility__name=Mynameis"
        )
        assert response.status_code == 200
        response_items_3 = response.json().get('items')
        assert len(response_items_3) == 1
        assert response.json().get('count') == 1
        assert response_items_3[0].get('facility__name') == 'Mynameis'
        assert response_items_3[0].get('facility__type') == Facility.Types.MEDIUM_FACILITY

    # POST
    def test_post_new_malformed_facility(self):
        owning_operator = operator_baker()
        TestUtils.authorize_current_user_as_operator_user(self, owning_operator)
        response = TestUtils.mock_post_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            {"garbage": "i am bad data"},
            custom_reverse_lazy("create_facilities"),
        )
        assert response.status_code == 422

    def test_post_existing_facility_with_same_name(self):
        owning_operator = operator_baker()
        TestUtils.authorize_current_user_as_operator_user(self, owning_operator)
        owning_operation = operation_baker(owning_operator.id)
        facility_instance = baker.make_recipe('utils.facility')
        mock_facility = {
            'name': facility_instance.name,
            'type': 'Large Facility',
            'latitude_of_largest_emissions': 5,
            'longitude_of_largest_emissions': 5,
            'operation_id': owning_operation.id,
        }
        post_response = TestUtils.mock_post_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            [mock_facility],
            custom_reverse_lazy("create_facilities"),
        )
        assert post_response.status_code == 422
        assert post_response.json().get('message') == "Name: Facility with this Name already exists."

    def test_post_new_lfo_facility(self):
        owning_operator = operator_baker()
        TestUtils.authorize_current_user_as_operator_user(self, owning_operator)
        owning_operation = operation_baker(owning_operator.id)
        mock_facility = {
            'name': 'zip',
            'type': 'Large Facility',
            'latitude_of_largest_emissions': 5,
            'longitude_of_largest_emissions': 5,
            'operation_id': owning_operation.id,
            'well_authorization_numbers': [1234, 5641, 89899],
        }
        TestUtils.authorize_current_user_as_operator_user(self, operator_baker())
        post_response = TestUtils.mock_post_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            [mock_facility],
            custom_reverse_lazy("create_facilities"),
        )
        assert post_response.status_code == 201
        assert post_response.json()[0].get('name') == "zip"
        assert post_response.json()[0].get('id') is not None

    def test_post_new_sfo_facility_with_address(self):
        owning_operator = operator_baker()
        TestUtils.authorize_current_user_as_operator_user(self, owning_operator)
        owning_operation = operation_baker(owning_operator.id)
        mock_facility = {
            'name': 'zip',
            'type': 'Single Facility',
            'latitude_of_largest_emissions': 5,
            'longitude_of_largest_emissions': 5,
            'operation_id': owning_operation.id,
        }
        mock_facility.update(
            {'street_address': '123 Facility Lane', 'municipality': 'city', 'province': 'AB', 'postal_code': 'H0H0H0'}
        )
        post_response = TestUtils.mock_post_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            [mock_facility],
            custom_reverse_lazy("create_facilities"),
        )
        assert post_response.status_code == 201
        assert Facility.objects.count() == 1
        facility = Facility.objects.first()
        assert facility.name == 'zip'
        assert facility.address is not None
        assert facility.address.street_address == '123 Facility Lane'
