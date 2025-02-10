from django.db import models
from common.enums import Schemas
from registration.enums.enums import RegistrationTableNames
from registration.models.event.event_base_model import EventBaseModel
from simple_history.models import HistoricalRecords
from registration.models.rls_configs.event.restart_event import Rls as RestartEventRls


class RestartEvent(EventBaseModel):
    class Statuses(models.TextChoices):
        RESTARTED = "Restarted"

    status = models.CharField(max_length=100, choices=Statuses.choices, default=Statuses.RESTARTED)
    history = HistoricalRecords(
        table_name='erc_history"."restart_event_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta(EventBaseModel.Meta):
        db_table_comment = (
            "Restart events for operations and/or facilities after they have been closed or temporarily shutdown."
        )
        db_table = f'{Schemas.ERC.value}"."{RegistrationTableNames.RESTART_EVENT.value}'
        default_related_name = "restart_events"

    Rls = RestartEventRls

    def __str__(self) -> str:
        return f"Restart event - Effective date:{self.effective_date}, status:{self.status}"
