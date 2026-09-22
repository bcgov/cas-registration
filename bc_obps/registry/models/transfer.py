import uuid
from registration.models.user import User
from registration.models.time_stamped_model import TimeStampedModel
from common.enums import Schemas
from django.db import models
from simple_history.models import HistoricalRecords
from registry.enums.enums import RegistryTableNames
from registry.models import SubAccount, Unit
from registry.models.rls_configs.transfer import Rls as RegistryTransferRls


class Transfer(TimeStampedModel):
    class Status(models.TextChoices):
        PENDING = "Pending"
        CANCELLED = "Cancelled"
        COMPLETE = "Complete"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    effective_datetime = models.DateTimeField(db_comment="The date and time at which the transfer took effect.")
    request_datetime = models.DateTimeField(db_comment="The date and time when the request to transfer was made.")
    from_sub_account = models.ForeignKey(
        SubAccount,
        related_name="transfers_from",
        on_delete=models.PROTECT,
        db_comment="The sub-account ID from which the units are transferring.",
    )
    to_sub_account = models.ForeignKey(
        SubAccount,
        related_name="transfers_to",
        on_delete=models.PROTECT,
        db_comment="The sub-account ID to which the units are being transferred.",
    )
    status = models.CharField(
        max_length=50, choices=Status.choices, db_comment="The status of the transfer (pending, cancelled, or complete)"
    )
    comment = models.CharField(
        max_length=1000,
        db_comment="Free-form comment field to capture input from the internal user reviewing the transfer request.",
    )
    unit = models.ForeignKey(Unit, on_delete=models.PROTECT, db_comment="Identifier of the unit(s) being transferred")
    requested_by = models.ForeignKey(
        User,
        on_delete=models.DO_NOTHING,
        related_name="transfer_requested_by",
        db_comment="The ID of the user who requested the transfer.",
    )
    reviewed_by = models.ForeignKey(
        User,
        on_delete=models.DO_NOTHING,
        blank=True,
        null=True,
        related_name="transfer_reviewed_by",
        db_comment="The ID of the IRC user who reviewed the transfer request and made a decision",
    )
    history = HistoricalRecords(
        table_name='erc_history"."credit_transfer_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta(TimeStampedModel.Meta):
        db_table_comment = (
            "Records all requested transfers of earned credits and carbon offsets to and from sub-accounts."
        )
        db_table = f'{Schemas.ERC.value}"."{RegistryTableNames.TRANSFER.value}'

    Rls = RegistryTransferRls
