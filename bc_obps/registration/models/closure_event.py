from typing import Optional
from registration.models import Event
from django.db import models
from simple_history.models import HistoricalRecords


class Closure(Event):
    event = models.TextField(null=True, blank=True, db_comment="Rationale for closure or other details.")
    history = HistoricalRecords(
        table_name='erc_history"."closure_event_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    @staticmethod
    def _validate_string(value: Optional[str]) -> None:
        if not isinstance(value, str) or not value:
            raise ValueError("Value must be a non-empty string")
