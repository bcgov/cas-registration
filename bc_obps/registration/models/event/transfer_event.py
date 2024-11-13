from registration.models import Contact, Operator
from django.db import models
from registration.models.event.event_base_model import EventBaseModel
from simple_history.models import HistoricalRecords


class TransferEvent(EventBaseModel):
    # ok to display the db ones in the grid
    class Statuses(models.TextChoices):
        COMPLETE = "Complete"
        TO_BE_TRANSFERRED = "To be transferred"
        TRANSFERRED = "Transferred"

    description = models.TextField(db_comment="Description of the transfer or change in designated operator.")
    other_operator = models.ForeignKey(
        Operator,
        on_delete=models.PROTECT,
        related_name="transfer_events",
        db_comment="The second operator who is involved in the transfer but is not reporting the event.",
    )
    other_operator_contact = models.ForeignKey(
        Contact,
        on_delete=models.PROTECT,
        related_name="transfer_events",
        db_comment="Contact information for the other operator.",
    )
    status = models.CharField(
        max_length=100,
        choices=Statuses.choices,
        default=Statuses.TO_BE_TRANSFERRED,
    )
    history = HistoricalRecords(
        table_name='erc_history"."transfer_event_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta:
        db_table_comment = "Transfer events for operations and/or facilities."
        db_table = 'erc"."transfer_event'
        default_related_name = "transfer_events"

    def __str__(self) -> str:
        return f"Transfer event - Effective date:{self.effective_date}, status:{self.status}"
