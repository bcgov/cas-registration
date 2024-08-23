from registration.models import Event, Operation, Facility
from django.db import models
from django.core.exceptions import ValidationError
from simple_history.models import HistoricalRecords


class RestartEvent(Event):
    class RestartStatuses(models.TextChoices):
        RESTARTED = "Restarted"

    status = models.CharField(max_length=100, choices=RestartStatuses.choices, default=RestartStatuses.RESTARTED)
    operation = models.ForeignKey(
        Operation, null=True, blank=True, on_delete=models.DO_NOTHING, related_name="restarts"
    )
    facilities = models.ManyToManyField(Facility, blank=True, related_name="restarts")
    history = HistoricalRecords(
        table_name='erc_history"."restart_event_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    def clean(self) -> None:
        super().clean()

        # Check that either 'operation' or 'facilities' is populated, but not both
        if bool(self.operation) == bool(self.facilities.exists()):
            raise ValidationError("Exactly one of 'operation' or 'facilities' must be populated.")

    def __str__(self) -> str:
        return f"Restart event - Effective date {self.effective_date}, status {self.status}, operation {self.operation}, facilities {self.facilities}"

    class Meta:
        db_table_comment = (
            "Restart events for operations and/or facilities after they have been closed or temporarily shutdown."
        )
        db_table = 'erc"."restarts'
