from registration.models.event.transfer_event import TransferEvent
from typing import Optional
from django.db.models import QuerySet


from registration.schema.v1.transfer_event import TransferEventFilterSchema
from ninja import Query


class TransferEventService:
    @classmethod
    def list_transfer_events(
        cls,
        sort_field: Optional[str],
        sort_order: Optional[str],
        filters: TransferEventFilterSchema = Query(...),
    ) -> QuerySet[TransferEvent]:
        sort_direction = "-" if sort_order == "desc" else ""
        sort_by = f"{sort_direction}{sort_field}"
        base_qs = TransferEvent.objects.all()
        return filters.filter(base_qs).order_by(sort_by)
