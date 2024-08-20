from registration.models import Event, Operation, Facility
from django.db import models
from simple_history.models import HistoricalRecords


class Restart(Event):
    class RestartStatus(models.TextChoices):
        RESTARTED = "Restarted"

    status = models.CharField(max_length=100, choices=RestartStatus, default=RestartStatus.RESTARTED)
    operation = models.ForeignKey(
        Operation, null=True, blank=True, on_delete=models.DO_NOTHING, related_name="restarts"
    )
    facilities = models.ManyToManyField(Facility, blank=True, related_name="restarts")
    history = HistoricalRecords(
        table_name='erc_history"."restart_event_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta:
        db_table_comment = (
            "Restart events for operations and/or facilities after they have been closed or temporarily shutdown."
        )
        db_table = 'erc"."restarts'
