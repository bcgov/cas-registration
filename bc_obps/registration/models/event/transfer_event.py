from registration.models import Operator, Operation
from django.db import models
from registration.models.event.event_base_model import EventBaseModel
from simple_history.models import HistoricalRecords


class TransferEvent(EventBaseModel):
    class Statuses(models.TextChoices):
        COMPLETE = "Complete"
        TO_BE_TRANSFERRED = "To be transferred"
        TRANSFERRED = "Transferred"

    status = models.CharField(
        max_length=100,
        choices=Statuses.choices,
        default=Statuses.TO_BE_TRANSFERRED,
    )
    from_operator = models.ForeignKey(
        Operator,
        on_delete=models.PROTECT,
        related_name="transfer_events_from",
        db_comment="The operator who is transferring the operation or facility.",
    )
    to_operator = models.ForeignKey(
        Operator,
        on_delete=models.PROTECT,
        related_name="transfer_events_to",
        db_comment="The operator who is receiving the operation or facility.",
    )
    from_operation = models.ForeignKey(
        Operation,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="transfer_events_from",
        db_comment="The operation that facilities are being transferred from.",
    )
    to_operation = models.ForeignKey(
        Operation,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="transfer_events_to",
        db_comment="The operation that facilities are being transferred to.",
    )
    history = HistoricalRecords(
        table_name='erc_history"."transfer_event_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta(EventBaseModel.Meta):
        db_table_comment = "Transfer events for operations and/or facilities."
        db_table = 'erc"."transfer_event'
        default_related_name = "transfer_events"

    def __str__(self) -> str:
        return f"Transfer event - Effective date:{self.effective_date}, status:{self.status}"
