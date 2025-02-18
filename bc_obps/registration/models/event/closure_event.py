from django.db import models
from common.enums import Schemas
from registration.enums.enums import RegistrationTableNames
from registration.models.event.event_base_model import EventBaseModel
from simple_history.models import HistoricalRecords
from registration.models.rls_configs.event.closure_event import Rls as ClosureEventRls


class ClosureEvent(EventBaseModel):
    class Statuses(models.TextChoices):
        CLOSED = "Closed"

    description = models.TextField(null=True, blank=True, db_comment="Rationale for closure or other details.")
    status = models.CharField(max_length=100, choices=Statuses.choices, default=Statuses.CLOSED)
    history = HistoricalRecords(
        table_name='erc_history"."closure_event_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta(EventBaseModel.Meta):
        db_table_comment = "Closure events for operations and/or facilities."
        db_table = f'{Schemas.ERC.value}"."{RegistrationTableNames.CLOSURE_EVENT.value}'
        default_related_name = "closure_events"

    Rls = ClosureEventRls

    def __str__(self) -> str:
        return f"Closure event - Effective date:{self.effective_date}, status:{self.status}"
