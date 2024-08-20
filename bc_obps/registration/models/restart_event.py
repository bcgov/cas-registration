from registration.models import Event
from django.db import models
from simple_history.models import HistoricalRecords


class Restart(Event):
    history = HistoricalRecords(
        table_name='erc_history"."restart_event_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )
