from typing import Optional
from registration.models import Event, Contact, Operator, Operation, Facility
from django.db import models
from simple_history.models import HistoricalRecords


class Transfer(Event):
    class Statuses(models.TextChoices):
        COMPLETE = "Complete"
        PENDING = "Pending"
        TRANSFERRED = "Transferred"

    class FutureDesignatedOperatorChoices(models.TextChoices):
        MY_OPERATOR = "My Operator"
        OTHER_OPERATOR = "Other Operator"
        NOT_SURE = "Not Sure"

    description = models.TextField(db_comment="Description of the transfer or change in designated operator.")
    operation = models.ForeignKey(
        Operation, null=True, blank=True, on_delete=models.DO_NOTHING, related_name="transfers"
    )
    facilities = models.ManyToManyField(Facility, blank=True, related_name="transfers")
    future_designated_operator = models.CharField(
        max_length=1000,
        choices=FutureDesignatedOperatorChoices,
        db_comment="The designated operator of the entit(y)/(ies) associated with the transfer, who will be responsible for matters related to GGERR.",
    )
    other_operator = models.ForeignKey(
        Operator,
        on_delete=models.PROTECT,
        related_name="transfer_events",
        db_comment="The second operator who is involved in the transfer but is not reporting the event.",
    )
    other_operator_contact = models.ForeignKey(
        Contact,
        on_delete=models.DO_NOTHING,
        related_name="transfer_events",
        db_comment="Contact information for the other operator.",
    )
    status = models.CharField(
        max_length=100,
        choices=Statuses,
        default=Statuses.PENDING,
    )
    history = HistoricalRecords(
        table_name='erc_history"."transfer_event_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta:
        db_table_comment = "Transfer events for operations and/or facilities."
        db_table = 'erc"."transfers'

    @staticmethod
    def _validate_string(value: Optional[str]) -> None:
        if not isinstance(value, str) or not value:
            raise ValueError("Value must be a non-empty string")
