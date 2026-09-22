import uuid
from registration.models.time_stamped_model import TimeStampedModel
from common.enums import Schemas
from django.db import models
from simple_history.models import HistoricalRecords
from registry.enums.enums import RegistryTableNames
from registration.models import Operation
from registry.models.rls_configs.account import Rls as RegistryAccountRls


class Account(TimeStampedModel):

    class AccountStatus(models.TextChoices):
        ACTIVE = "Active"
        CLOSED = "Closed"
        PENDING = "Pending"

    id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, db_comment="Primary key to identify the registry account"
    )
    name = models.CharField(
        max_length=1000, db_comment="The name of the account as it should be displayed in the frontend"
    )
    operation_id = models.ForeignKey(Operation, on_delete=models.DO_NOTHING, related_name="registry_account")
    status = models.CharField(
        max_length=50, choices=AccountStatus.choices, db_comment="Indicates whether the account is active or not."
    )
    history = HistoricalRecords(
        table_name='erc_history"."account_history', history_user_id_field=models.UUIDField(null=True, blank=True)
    )

    class Meta(TimeStampedModel.Meta):
        db_table_comment = "Table containing account information relating to the internal BC Carbon Registry"
        db_table = f'{Schemas.ERC.value}"."{RegistryTableNames.ACCOUNT.value}'

    Rls = RegistryAccountRls
