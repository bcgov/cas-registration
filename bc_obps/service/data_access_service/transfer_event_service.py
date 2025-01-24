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

    @classmethod
    def get_by_id(cls, transfer_id: UUID) -> TransferEvent:
        return TransferEvent.objects.get(id=transfer_id)

    @classmethod
    def update_transfer_event(
        cls,
        user_guid: UUID,
        transfer_id: UUID,
        transfer_event_data: DictStrAny,
    ) -> TransferEvent:
        transfer_event = cls.get_by_id(transfer_id)
        for key, value in transfer_event_data.items():
            setattr(transfer_event, key, value)
        transfer_event.save(update_fields=transfer_event_data.keys())
        transfer_event.set_create_or_update(user_guid)
        return transfer_event
