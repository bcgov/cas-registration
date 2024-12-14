from uuid import UUID
from registration.models import TransferEvent
from ninja.types import DictStrAny


class TransferEventDataAccessService:
    @classmethod
    def create_transfer_event(
        cls,
        user_guid: UUID,
        transfer_event_data: DictStrAny,
    ) -> TransferEvent:
        return TransferEvent.objects.create(**transfer_event_data, created_by_id=user_guid)
