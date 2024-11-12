from datetime import datetime, timedelta
from django.utils import timezone
from registration.models.event.transfer_event import TransferEvent
from bc_obps.settings import NINJA_PAGINATION_PER_PAGE
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


class TestTransferEventEndpoint(CommonTestSetup):
    url = custom_reverse_lazy('list_transfer_events')
    # GET
    def test_list_transfer_events_unpaginated(self):
        # transfer of an operation
        baker.make_recipe('utils.transfer_event', operation=baker.make_recipe('utils.operation'))
        # transfer of 50 facilities
        baker.make_recipe('utils.transfer_event', facilities=baker.make_recipe('utils.facility',_quantity=50))
        for role in ['cas_admin', 'cas_analyst']:
            response = TestUtils.mock_get_with_auth_role(
                self, role, self.url+ "?paginate_result=False"
            )
            assert response.status_code == 200
            assert response.json().keys() == {'count', 'items'}
            assert response.json()['count'] == 51
            
            items = response.json().get('items', [])
            for item in items:
                assert set(item.keys()) == {'operation__name','operation__id','effective_date','status','id','facilities__name','facility__id','created_at'}
    
       

    def test_list_transfer_events_paginated(self):
        # transfer of an operation
        baker.make_recipe('utils.transfer_event', operation=baker.make_recipe('utils.operation'))
        # transfer of 50 facilities
        baker.make_recipe('utils.transfer_event', facilities=baker.make_recipe('utils.facility',_quantity=50))
        # Get the default page 1 response
        response = TestUtils.mock_get_with_auth_role(self, "cas_admin", custom_reverse_lazy("list_transfer_events"))
        assert response.status_code == 200

        response_items_1 = response.json().get('items')
        response_count_1 = response.json().get('count')
        # save the id of the first paginated response item
        page_1_response_id = response_items_1[0].get('id')
        assert len(response_items_1) == NINJA_PAGINATION_PER_PAGE
        assert response_count_1 == 51  # total count of transfers
        # Get the page 2 response
        response = TestUtils.mock_get_with_auth_role(
            self,
            "cas_admin",
            self.url + "?page=2&sort_field=created_at&sort_order=desc",
        )
        assert response.status_code == 200
        response_items_2 = response.json().get('items')
        response_count_2 = response.json().get('count')
        # save the id of the first paginated response item
        page_2_response_id = response_items_2[0].get('id')
        assert len(response_items_2) == NINJA_PAGINATION_PER_PAGE
        # assert that the first item in the page 1 response is not the same as the first item in the page 2 response
        assert page_1_response_id != page_2_response_id
        assert response_count_2 == response_count_1  # total count of transfer_events should be the same
        # Get the page 2 response but with a different sort order
        response = TestUtils.mock_get_with_auth_role(
            self,
            "cas_admin",
            self.url + "?page=2&sort_field=created_at&sort_order=asc",
        )
        assert response.status_code == 200
        response_items_2_reverse = response.json().get('items')
        # save the id of the first paginated response item
        page_2_response_id_reverse = response_items_2_reverse[0].get('id')
        assert len(response_items_2_reverse) == NINJA_PAGINATION_PER_PAGE
        # assert that the first item in the page 2 response is not the same as the first item in the page 2 response with reversed order
        assert page_2_response_id != page_2_response_id_reverse

    def test_transfer_events_endpoint_list_transfer_events_with_sorting(self):
        today = timezone.make_aware(datetime.now())
        yesterday = today - timedelta(days=1)
        # transfer of an operation
        baker.make_recipe('utils.transfer_event', operation=baker.make_recipe('utils.operation'),effective_date=today)
        # transfer of 50 facilities
        baker.make_recipe('utils.transfer_event', effective_date=yesterday, facilities=baker.make_recipe('utils.facility',_quantity=50))

        response_ascending = TestUtils.mock_get_with_auth_role(self, "cas_admin", self.url+ "?page=1&sort_field=effective_date&sort_order=asc")
        # save the id of the first paginated response item
        first_item_ascending = response_ascending.json()['items'][0]
        
        # # Sort created at descending
        response_descending = TestUtils.mock_get_with_auth_role(self, "cas_admin", self.url+ "?page=1&sort_field=effective_date&sort_order=desc")
        first_item_descending = response_descending.json()['items'][0]
        assert first_item_descending['effective_date'] > first_item_ascending['effective_date']




    def test_transfer_events_endpoint_list_transfer_events_with_filter(self):
        # transfer of an operation
        baker.make_recipe('utils.transfer_event', operation=baker.make_recipe('utils.operation', name='Test Operation'))
        # transfer of 50 facilities
        baker.make_recipe('utils.transfer_event', facilities=baker.make_recipe('utils.facility',_quantity=50))

        # Get the default page 1 response
        response = TestUtils.mock_get_with_auth_role(
            self, "cas_admin", self.url + "?facilities__name=010"
        )  # filtering facilities__name
        assert response.status_code == 200
        response_items_1 = response.json().get('items')
        for item in response_items_1:
            assert item.get('facilities__name') == "Facility 010"

        # Test with a status filter that doesn't exist
        response = TestUtils.mock_get_with_auth_role(
            self, "cas_admin", self.url + "?status=unreal"
        )
        assert response.status_code == 200
        assert response.json().get('count') == 0

        # Test with two filters
        facilities__name_to_filter, status_to_filter = response_items_1[0].get('facilities__name'), response_items_1[0].get(
            'status'
        )
        response = TestUtils.mock_get_with_auth_role(
            self, "cas_admin", self.url + f"?facilities__name={facilities__name_to_filter}&status={status_to_filter}"
        )
        assert response.status_code == 200
        response_items_2 = response.json().get('items')
        assert len(response_items_2) == 1
        assert response.json().get('count') == 1
        assert response_items_2[0].get('facilities__name') == facilities__name_to_filter
        assert response_items_2[0].get('status') == status_to_filter