from django.db import models

from common.enums import Schemas
from registration.enums.enums import RegistrationTableNames
from registration.models.event.event_base_model import EventBaseModel
from simple_history.models import HistoricalRecords
from registration.models.rls_configs.event.temporary_shutdown_event import Rls as TemporaryShutdownEventRls


class TemporaryShutdownEvent(EventBaseModel):
    class Statuses(models.TextChoices):
        TEMPORARILY_SHUTDOWN = "Temporarily Shutdown"

    description = models.TextField(
        null=True,
        blank=True,
        db_comment="Rationale for temporary shutdown or other details.",
    )
    status = models.CharField(
        max_length=100,
        choices=Statuses.choices,
        default=Statuses.TEMPORARILY_SHUTDOWN,
    )
    history = HistoricalRecords(
        table_name='erc_history"."temporary_shutdown_event_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta(EventBaseModel.Meta):
        db_table_comment = "Temporary shutdown events for operations and/or facilities."
        db_table = f'{Schemas.ERC.value}"."{RegistrationTableNames.TEMPORARY_SHUTDOWN_EVENT.value}'
        default_related_name = "temporary_shutdown_events"

    Rls = TemporaryShutdownEventRls

    def __str__(self) -> str:
        return f"Temporary shutdown event - Effective date:{self.effective_date}, status:{self.status}"
