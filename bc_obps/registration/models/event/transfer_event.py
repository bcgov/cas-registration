from common.enums import Schemas
from registration.enums.enums import RegistrationTableNames
from registration.models import Operator, Operation
from django.db import models
from registration.models.event.event_base_model import EventBaseModel
from simple_history.models import HistoricalRecords
from registration.models.rls_configs.event.transfer_event import Rls as TransferEventRls


class TransferEvent(EventBaseModel):
    class Statuses(models.TextChoices):
        COMPLETE = "Complete"
        TO_BE_TRANSFERRED = "To be transferred"
        TRANSFERRED = "Transferred"

    status = models.CharField(
        max_length=100,
        choices=Statuses.choices,
        default=Statuses.TO_BE_TRANSFERRED,
        db_comment="The status of the transfer event (e.g. To be transferred, Transferred, Complete)",
    )
    from_operator = models.ForeignKey(
        Operator,
        on_delete=models.PROTECT,
        related_name="transfer_events_from",
        db_comment="The operator transferring the operation or facility to another operator. Foreign key to erc.operator",
    )
    to_operator = models.ForeignKey(
        Operator,
        on_delete=models.PROTECT,
        related_name="transfer_events_to",
        db_comment="The operator receiving the operation or facility. Foreign key to erc.operator",
    )
    from_operation = models.ForeignKey(
        Operation,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="transfer_events_from",
        db_comment="The operation that facilities are being transferred away from (null if the entire operation is being transferred). Foreign key to erc.operation",
    )
    to_operation = models.ForeignKey(
        Operation,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="transfer_events_to",
        db_comment="The operation that facilities are being transferred into (null if no target operation yet exists). Foreign key to erc.operation",
    )
    history = HistoricalRecords(
        table_name='erc_history"."transfer_event_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta(EventBaseModel.Meta):
        db_table_comment = "Records transfer events where ownership of operations or facilities moves from one operator to another. The from_operator and to_operator fields identify the parties involved. The facilities M2M field (inherited from EventBaseModel) lists which facilities are being transferred."
        db_table = f'{Schemas.ERC.value}"."{RegistrationTableNames.TRANSFER_EVENT.value}'
        default_related_name = "transfer_events"

    Rls = TransferEventRls

    def __str__(self) -> str:
        return f"Transfer event - Effective date:{self.effective_date}, status:{self.status}"
