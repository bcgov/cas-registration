import uuid
from registration.models.time_stamped_model import TimeStampedModel
from common.enums import Schemas
from django.db import models
from simple_history.models import HistoricalRecords
from registry.enums.enums import RegistryTableNames
from registry.models import Account, Project, Verifier
from registry.models.rls_configs.issuance import Rls as IssuanceRls


class Issuance(TimeStampedModel):

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

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    account = models.ForeignKey(
        Account,
        on_delete=models.PROTECT,
    )
    project = models.ForeignKey(Project, on_delete=models.PROTECT)
    verifier = models.ForeignKey(Verifier, on_delete=models.PROTECT)

    history = HistoricalRecords(
        table_name='erc_history"."issuance_history', history_user_id_field=models.UUIDField(null=True, blank=True)
    )

    class Meta(TimeStampedModel.Meta):
        db_table_comment = "Table containing all unit issuances made as part of the internal BC Carbon Registry"
        db_table = f'{Schemas.ERC.value}"."{RegistryTableNames.ISSUANCE.value}'

    Rls = IssuanceRls
