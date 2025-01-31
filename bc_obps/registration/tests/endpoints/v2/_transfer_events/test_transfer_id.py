from unittest.mock import patch, MagicMock
from uuid import uuid4
import pytest
from registration.models import AppRole, TransferEvent
from registration.schema.v2.transfer_event import TransferEventUpdateIn
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy
from model_bakery import baker
from datetime import datetime


class TestTransferIdEndpoint(CommonTestSetup):
    @patch("service.transfer_event_service.TransferEventService.get_if_authorized")
    def test_authorized_users_can_get_transfer_event(self, mock_get_if_authorized: MagicMock):
        transfer_event = baker.make_recipe(
            'registration.tests.utils.transfer_event', operation=baker.make_recipe('registration.tests.utils.operation')
        )
        mock_get_if_authorized.return_value = transfer_event
        for role in AppRole.get_authorized_irc_roles():
            response = TestUtils.mock_get_with_auth_role(
                self, role, custom_reverse_lazy('get_transfer_event', kwargs={'transfer_id': transfer_event.id})
            )
            mock_get_if_authorized.assert_called_once_with(self.user.pk, transfer_event.id)
            mock_get_if_authorized.reset_mock()
            assert response.status_code == 200
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
            assert response_json['from_operator'] == transfer_event.from_operator.legal_name
            assert response_json['from_operator_id'] == str(transfer_event.from_operator.id)
            assert response_json['to_operator'] == transfer_event.to_operator.legal_name
            assert response_json['operation_name'] == transfer_event.operation.name
            assert response_json['from_operation'] is None
            assert response_json['from_operation_id'] is None
            assert response_json['to_operation'] is None
            assert response_json['existing_facilities'] == []
            # modify the effective date to match the format of the response
            response_effective_date = datetime.strptime(response_json['effective_date'], "%Y-%m-%dT%H:%M:%S.%fZ")
            mock_transfer_event_effective_date = datetime.fromisoformat(str(transfer_event.effective_date))
            assert response_effective_date.replace(microsecond=0) == mock_transfer_event_effective_date.replace(
                microsecond=0, tzinfo=None
            )
            assert response_json['operation'] == str(transfer_event.operation.id)
            assert response_json['facilities'] == []
            assert response_json['status'] == TransferEvent.Statuses.TO_BE_TRANSFERRED

    @patch("service.transfer_event_service.TransferEventService.delete_transfer_event")
    def test_cas_analyst_can_delete_transfer_event(self, mock_delete_transfer_event: MagicMock):
        random_transfer_event_id = uuid4()
        mock_delete_transfer_event.return_value = None
        response = TestUtils.mock_delete_with_auth_role(
            self,
            "cas_analyst",
            custom_reverse_lazy('delete_transfer_event', kwargs={'transfer_id': random_transfer_event_id}),
        )
        mock_delete_transfer_event.assert_called_once_with(self.user.pk, random_transfer_event_id)
        assert response.status_code == 200
        response_json = response.json()
        assert response_json == {"success": True}

    @patch("service.transfer_event_service.TransferEventService.update_transfer_event")
    @pytest.mark.parametrize("entity", ["Operation", "Facility"])
    def test_cas_analyst_can_update_transfer_event(self, mock_update_transfer_event: MagicMock, entity):
        transfer_event = baker.make_recipe(
            'registration.tests.utils.transfer_event', operation=baker.make_recipe('registration.tests.utils.operation')
        )
        mock_update_transfer_event.return_value = transfer_event
        mock_payload = {
            "transfer_entity": entity,
            "effective_date": "2023-10-13",
        }
        if entity == "Facility":
            mock_payload['facilities'] = [uuid4(), uuid4()]
        elif entity == "Operation":
            mock_payload['operation'] = uuid4()

        response = TestUtils.mock_patch_with_auth_role(
            self,
            "cas_analyst",
            self.content_type,
            endpoint=custom_reverse_lazy('update_transfer_event', kwargs={'transfer_id': transfer_event.id}),
            data=mock_payload,
        )
        mock_update_transfer_event.assert_called_once_with(
            self.user.pk,
            transfer_event.id,
            # override the effective date to match the format of the response
            TransferEventUpdateIn.model_construct(
                **{**mock_payload, "effective_date": datetime.strptime(mock_payload['effective_date'], "%Y-%m-%d")}
            ),
        )
        assert response.status_code == 200
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
