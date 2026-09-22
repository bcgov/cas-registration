import uuid
from registration.models.time_stamped_model import TimeStampedModel
from common.enums import Schemas
from django.db import models
from simple_history.models import HistoricalRecords
from registry.enums.enums import RegistryTableNames
from registry.models import Account
from registry.models.rls_configs.sub_account import Rls as SubAccountRls


class SubAccount(TimeStampedModel):

    id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, db_comment="Primary key to identify the registry sub-account."
    )
    name = models.CharField(
        max_length=1000, db_comment="The name of the sub-account as it should be displayed in the frontend."
    )
    parent_account = models.ForeignKey(
        Account,
        on_delete=models.CASCADE,
        related_name="parent_account",
        db_comment="The registry account under which the sub-account falls.",
    )
    history = HistoricalRecords(
        table_name='erc_history"."sub_account_history"', history_user_id_field=models.UUIDField(null=True, blank=True)
    )

    class Meta(TimeStampedModel.Meta):
        db_table_comment = ""
        db_table = f'{Schemas.ERC.value}"."{RegistryTableNames.SUB_ACCOUNT.value}'

    Rls = SubAccountRls
