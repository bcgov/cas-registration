from datetime import datetime, timedelta
from unittest.mock import patch, MagicMock
from uuid import uuid4
from django.utils import timezone
from bc_obps.settings import NINJA_PAGINATION_PER_PAGE
from model_bakery import baker
from registration.models import TransferEvent
from registration.schema.v2.transfer_event import TransferEventCreateIn
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy


class TestTransferEventEndpoint(CommonTestSetup):
    url = custom_reverse_lazy('list_transfer_events')
    # GET
    def test_list_transfer_events_unpaginated(self):
        # transfer of an operation
        baker.make_recipe('utils.transfer_event', operation=baker.make_recipe('utils.operation'))
        # transfer of 50 facilities
        baker.make_recipe('utils.transfer_event', facilities=baker.make_recipe('utils.facility', _quantity=50))
        for role in ['cas_admin', 'cas_analyst']:
            response = TestUtils.mock_get_with_auth_role(self, role, self.url + "?paginate_result=False")
            assert response.status_code == 200
            assert response.json().keys() == {'count', 'items'}
            assert response.json()['count'] == 51

            items = response.json().get('items', [])
            for item in items:
                assert set(item.keys()) == {
                    'operation__name',
                    'operation__id',
                    'effective_date',
                    'status',
                    'id',
                    'facilities__name',
                    'facility__id',
                    'created_at',
                }

    def test_list_transfer_events_paginated(self):

        for _ in range(20):
            # transfer of an operation
            baker.make_recipe('utils.transfer_event', operation=baker.make_recipe('utils.operation'))
            # transfer of 50 facilities
            baker.make_recipe('utils.transfer_event', facilities=baker.make_recipe('utils.facility', _quantity=2))
        # Get the default page 1 response
        response = TestUtils.mock_get_with_auth_role(self, "cas_admin", custom_reverse_lazy("list_transfer_events"))
        assert response.status_code == 200

        response_items_1 = response.json().get('items')
        response_count_1 = response.json().get('count')
        # save the id of the first paginated response item
        page_1_response_id = response_items_1[0].get('id')
        assert len(response_items_1) == NINJA_PAGINATION_PER_PAGE
        assert response_count_1 == 60  # total count of transfers
        # Get the page 2 response
        response = TestUtils.mock_get_with_auth_role(
            self,
            "cas_admin",
            self.url + "?page=2&sort_field=id&sort_order=desc",
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
            self.url + "?page=2&sort_field=id&sort_order=asc",
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
        baker.make_recipe('utils.transfer_event', operation=baker.make_recipe('utils.operation'), effective_date=today)
        # transfer of 50 facilities
        baker.make_recipe(
            'utils.transfer_event',
            effective_date=yesterday,
            facilities=baker.make_recipe('utils.facility', _quantity=50),
        )

        response_ascending = TestUtils.mock_get_with_auth_role(
            self, "cas_admin", self.url + "?page=1&sort_field=effective_date&sort_order=asc"
        )
        # save the id of the first paginated response item
        first_item_ascending = response_ascending.json()['items'][0]

        # # Sort created at descending
        response_descending = TestUtils.mock_get_with_auth_role(
            self, "cas_admin", self.url + "?page=1&sort_field=effective_date&sort_order=desc"
        )
        first_item_descending = response_descending.json()['items'][0]
        assert first_item_descending['effective_date'] > first_item_ascending['effective_date']

    def test_transfer_events_endpoint_list_transfer_events_with_filter(self):
        # transfer of an operation
        baker.make_recipe('utils.transfer_event', operation=baker.make_recipe('utils.operation', name='Test Operation'))
        # transfer of 50 facilities
        baker.make_recipe('utils.transfer_event', facilities=baker.make_recipe('utils.facility', _quantity=50))

        # Get the default page 1 response
        response = TestUtils.mock_get_with_auth_role(
            self, "cas_admin", self.url + "?facilities__name=010"
        )  # filtering facilities__name
        assert response.status_code == 200
        response_items_1 = response.json().get('items')
        for item in response_items_1:
            assert item.get('facilities__name') == "Facility 010"

        # Test with a status filter that doesn't exist
        response = TestUtils.mock_get_with_auth_role(self, "cas_admin", self.url + "?status=unreal")
        assert response.status_code == 200
        assert response.json().get('count') == 0

        # Test with two filters
        facilities__name_to_filter, status_to_filter = response_items_1[0].get('facilities__name'), response_items_1[
            0
        ].get('status')
        response = TestUtils.mock_get_with_auth_role(
            self, "cas_admin", self.url + f"?facilities__name={facilities__name_to_filter}&status={status_to_filter}"
        )
        assert response.status_code == 200
        response_items_2 = response.json().get('items')
        assert len(response_items_2) == 1
        assert response.json().get('count') == 1
        assert response_items_2[0].get('facilities__name') == facilities__name_to_filter
        assert response_items_2[0].get('status') == status_to_filter

    # POST
    @patch("service.transfer_event_service.TransferEventService.create_transfer_event")
    def test_user_can_post_transfer_event_success(self, mock_create_transfer_event: MagicMock):
        mock_payload = {
            "transfer_entity": "Operation",
            "from_operator": uuid4(),
            "to_operator": uuid4(),
            "effective_date": "2023-10-13T15:27:00.000Z",
            "operation": uuid4(),
        }

        mock_transfer_event = baker.make_recipe(
            'utils.transfer_event',
            operation=baker.make_recipe('utils.operation'),
            status=TransferEvent.Statuses.TRANSFERRED,
        )
        mock_create_transfer_event.return_value = mock_transfer_event
        response = TestUtils.mock_post_with_auth_role(
            self,
            "cas_analyst",
            self.content_type,
            mock_payload,
            custom_reverse_lazy("create_transfer_event"),
        )

        mock_create_transfer_event.assert_called_once_with(
            self.user.user_guid,
            TransferEventCreateIn.model_validate(mock_payload),
        )

        assert response.status_code == 201
        response_json = response.json()
        assert set(response_json.keys()) == {
            'transfer_entity',
            'from_operator',
            'from_operator_id',
            'to_operator',
            'operation_name',
            'from_operation',
            'from_operation_id',
            'to_operation',
            'existing_facilities',
            'status',
            'effective_date',
            'operation',
            'facilities',
        }
        assert response_json['transfer_entity'] == "Operation"
        assert response_json['from_operator'] == mock_transfer_event.from_operator.legal_name
        assert response_json['from_operator_id'] == str(mock_transfer_event.from_operator.id)
        assert response_json['to_operator'] == mock_transfer_event.to_operator.legal_name
        assert response_json['operation_name'] == mock_transfer_event.operation.name
        assert response_json['from_operation'] is None
        assert response_json['from_operation_id'] is None
        assert response_json['to_operation'] is None
        assert response_json['existing_facilities'] == []
        # modify the effective date to match the format of the response
        response_effective_date = datetime.strptime(response_json['effective_date'], "%Y-%m-%dT%H:%M:%S.%fZ")
        mock_transfer_event_effective_date = datetime.fromisoformat(str(mock_transfer_event.effective_date))
        assert response_effective_date.replace(microsecond=0) == mock_transfer_event_effective_date.replace(
            microsecond=0, tzinfo=None
        )
        assert response_json['operation'] == str(mock_transfer_event.operation.id)
        assert response_json['facilities'] == []
        assert response_json['status'] == TransferEvent.Statuses.TRANSFERRED
