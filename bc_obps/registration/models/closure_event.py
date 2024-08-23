from registration.models import Event
from django.db import models
from django.core.exceptions import ValidationError
from simple_history.models import HistoricalRecords


class ClosureEvent(Event):
    class ClosureStatuses(models.TextChoices):
        CLOSED = "Closed"

    description = models.TextField(null=True, blank=True, db_comment="Rationale for closure or other details.")
    status = models.CharField(max_length=100, choices=ClosureStatuses.choices, default=ClosureStatuses.CLOSED)
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

    def __str__(self) -> str:
        return f"Closure event - Effective date {self.effective_date}, status {self.status}, description {self.description}, operation {self.operation}, facilities {self.facilities}"
