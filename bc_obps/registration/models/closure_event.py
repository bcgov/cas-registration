from registration.models import Event, Operation, Facility
from django.db import models
from django.core.exceptions import ValidationError
from simple_history.models import HistoricalRecords


class Closure(Event):
    class ClosureStatus(models.TextChoices):
        CLOSED = "Closed"

    description = models.TextField(null=True, blank=True, db_comment="Rationale for closure or other details.")
    status = models.CharField(max_length=100, choices=ClosureStatus, default=ClosureStatus.CLOSED)
    operation = models.ForeignKey(
        Operation, null=True, blank=True, on_delete=models.DO_NOTHING, related_name="closures"
    )
    facilities = models.ManyToManyField(Facility, blank=True, related_name="closures")
    history = HistoricalRecords(
        table_name='erc_history"."closure_event_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    def clean(self) -> None:
        super().clean()

        # Check that either 'operation' or 'facilities' is populated, but not both
        if bool(self.operation) == bool(self.facilities.exists()):
            raise ValidationError("Exactly one of 'operation' or 'facilities' must be populated.")

    class Meta:
        db_table_comment = "Closure events for operations and/or facilities."
        db_table = 'erc"."closures'
