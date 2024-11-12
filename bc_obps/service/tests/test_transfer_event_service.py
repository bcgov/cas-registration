from registration.schema.v1.transfer_event import TransferEventFilterSchema
from registration.models.event.transfer_event import TransferEvent
from service.transfer_event_service import TransferEventService
import pytest
from registration.models import Activity
from service.activity_service import ActivityService
from model_bakery import baker

pytestmark = pytest.mark.django_db


class TestTransferEventService:
    @staticmethod
    def test_list_transfer_events():
        # transfer of 3 operations
        baker.make_recipe('utils.transfer_event', operation=baker.make_recipe('utils.operation'),_quantity=3)
        # transfer of 4 facilities
        baker.make_recipe('utils.transfer_event', facilities=baker.make_recipe('utils.facility',_quantity=4))
        # sorting and filtering are tested in the endpoint test in conjunction with pagination
        result = TransferEventService.list_transfer_events("status","desc",TransferEventFilterSchema(effective_date=None, operation__name=None, facilities__name=None, status=None))
        assert result.count() == 7


