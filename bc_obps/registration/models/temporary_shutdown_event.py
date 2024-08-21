from typing import Optional
from registration.models import Event, Operation, Facility
from django.db import models
from django.core.exceptions import ValidationError
from simple_history.models import HistoricalRecords


class TemporaryShutdown(Event):
    class TemporaryShutdownStatus(models.TextChoices):
        TEMPORARILY_SHUTDOWN = "Temporarily Shutdown"

    description = models.TextField(
        null=True,
        blank=True,
        db_comment="Rationale for temporary shutdown or other details.",
    )
    status = models.CharField(
        max_length=100, choices=TemporaryShutdownStatus, default=TemporaryShutdownStatus.TEMPORARILY_SHUTDOWN
    )
    history = HistoricalRecords(
        table_name='erc_history"."temporary_shutdown_event_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )
    operation = models.ForeignKey(
        Operation, null=True, blank=True, on_delete=models.DO_NOTHING, related_name="temporary_shutdowns"
    )
    facilities = models.ManyToManyField(Facility, blank=True, related_name="temporary_shutdowns")

    def clean(self) -> None:
        super().clean()

        # Check that either 'operation' or 'facilities' is populated, but not both
        if bool(self.operation) == bool(self.facilities.exists()):
            raise ValidationError("Exactly one of 'operation' or 'facilities' must be populated.")

    class Meta:
        db_table_comment = "Temporary shutdown events for operations and/or facilities."
        db_table = 'erc"."temporary_shutdowns'

    @staticmethod
    def _validate_string(value: Optional[str]) -> None:
        if not isinstance(value, str) or not value:
            raise ValueError("Value must be a non-empty string")
