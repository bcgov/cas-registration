from registration.models import Event, Contact, Operator, Facility
from django.db import models
from django.core.exceptions import ValidationError
from simple_history.models import HistoricalRecords


class TransferEvent(Event):
    class TransferStatuses(models.TextChoices):
        COMPLETE = "Complete"
        PENDING = "Pending"
        TRANSFERRED = "Transferred"

    class FutureDesignatedOperatorChoices(models.TextChoices):
        MY_OPERATOR = "My Operator"
        OTHER_OPERATOR = "Other Operator"
        NOT_SURE = "Not Sure"

    description = models.TextField(db_comment="Description of the transfer or change in designated operator.")

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
        on_delete=models.PROTECT,
        related_name="transfer_events",
        db_comment="Contact information for the other operator.",
    )
    status = models.CharField(
        max_length=100,
        choices=TransferStatuses.choices,
        default=TransferStatuses.PENDING,
    )
    history = HistoricalRecords(
        table_name='erc_history"."transfer_event_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    def clean(self) -> None:
        super().clean()

        # Check that either 'operation' or 'facilities' is populated, but not both
        if bool(self.operation) == bool(self.facilities.exists()):
            raise ValidationError("Exactly one of 'operation' or 'facilities' must be populated.")

    class Meta:
        db_table_comment = "Transfer events for operations and/or facilities."
        db_table = 'erc"."transfers'

    def __str__(self) -> str:
        return f"Transfer event\nEffective date {self.effective_date}, status {self.status}, description {self.description}, operation {self.operation}, facilities {self.facilities}, other operator {self.other_operator}, other operator's contact {self.other_operator_contact}, future designated operator {self.future_designated_operator}"
