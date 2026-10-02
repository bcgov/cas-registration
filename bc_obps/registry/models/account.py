from registration.models.time_stamped_model import TimeStampedModel
from common.enums import Schemas
from django.db import models
from simple_history.models import HistoricalRecords
from registry.enums.enums import RegistryTableNames
from registration.models import Operation, Address, Contact
from registry.models import Program
from registry.models.rls_configs.account import Rls as RegistryAccountRls


class Account(TimeStampedModel):

    class AccountStatus(models.TextChoices):
        ACTIVE = "Active"
        CLOSED = "Closed"
        PENDING = "Pending"

    class AccountType(models.TextChoices):
        PROJECT_PROPONENT = "Project proponent"
        GENERAL_PARTICIPANT = "General participant"

    class Classification(models.TextChoices):
        CORPORATE = "Corporate"
        PROJECT_OWNER = "Project owner"

    class TypeOfAccountHolder(models.TextChoices):
        CORPORATION = "Corporation"

    id = models.PositiveBigIntegerField(primary_key=True, db_comment="Primary key to identify the registry account")
    parent_account = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,
        related_name="sub_accounts",
        blank=True,
        null=True,
        db_comment="The registry account under which this account falls, if it is a sub-account.",
    )
    name = models.CharField(
        max_length=1000, db_comment="The name of the account as it should be displayed in the frontend"
    )
    operation = models.ForeignKey(Operation, on_delete=models.DO_NOTHING, related_name="registry_account")
    status = models.CharField(
        max_length=50, choices=AccountStatus.choices, db_comment="Indicates whether the account is active or not."
    )
    website = models.CharField(max_length=100, blank=True, null=True)
    account_type = models.CharField(max_length=50, choices=AccountType.choices)
    account_classification = models.CharField(max_length=50, choices=Classification.choices)
    address = models.ForeignKey(Address, on_delete=models.PROTECT)
    primary_account_representative = models.ForeignKey(Contact, on_delete=models.PROTECT)
    program = models.ForeignKey(Program, on_delete=models.PROTECT)
    type_of_account_holder = models.CharField(max_length=100, choices=TypeOfAccountHolder.choices)
    history = HistoricalRecords(
        table_name='erc_history"."account_history', history_user_id_field=models.UUIDField(null=True, blank=True)
    )

    class Meta(TimeStampedModel.Meta):
        db_table_comment = "Table containing account information relating to the internal BC Carbon Registry"
        db_table = f'{Schemas.ERC.value}"."{RegistryTableNames.ACCOUNT.value}'

    Rls = RegistryAccountRls
