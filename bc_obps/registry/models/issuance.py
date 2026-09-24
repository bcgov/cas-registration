import uuid
from registration.models.time_stamped_model import TimeStampedModel
from common.enums import Schemas
from django.db import models
from simple_history.models import HistoricalRecords
from registry.enums.enums import RegistryTableNames
from registry.models import Account, Project, Verifier
from registry.models.rls_configs.issuance import Rls as IssuanceRls


class Issuance(TimeStampedModel):

    class IssuanceStatus(models.TextChoices):
        ACTIVE = "Active"
        DRAFT = "Draft"

    class AccountType(models.TextChoices):
        PROJECT_PROPONENT = "Project proponent"
        GENERAL_PARTICIPANT = "General participant"

    class Classification(models.TextChoices):
        CORPORATE = "Corporate"
        PROJECT_OWNER = "Project owner"

    id = models.PositiveBigIntegerField(primary_key=True)
    account = models.ForeignKey(
        Account,
        on_delete=models.PROTECT,
    )
    request_date = models.DateField(db_comment="The date that the request for the issuance was received")
    issuance_date = models.DateField(db_comment="The date that the issuance was completed", blank=True, null=True)
    verification_start_date = models.DateField(blank=True, null=True)
    verification_end_date = models.DateField(blank=True, null=True)
    vintage_start_date = models.CharField(blank=True, null=True)
    vintage_end_date = models.CharField(blank=True, null=True)
    project = models.ForeignKey(Project, on_delete=models.PROTECT)
    verifier = models.ForeignKey(Verifier, on_delete=models.PROTECT)
    status = models.CharField(max_length=100, choices=IssuanceStatus.choices)
    project_quantity = models.PositiveIntegerField()
    buffer_quantity = models.PositiveIntegerField()

    history = HistoricalRecords(
        table_name='erc_history"."issuance_history', history_user_id_field=models.UUIDField(null=True, blank=True)
    )

    class Meta(TimeStampedModel.Meta):
        db_table_comment = "Table containing all unit issuances made as part of the internal BC Carbon Registry"
        db_table = f'{Schemas.ERC.value}"."{RegistryTableNames.ISSUANCE.value}'

    Rls = IssuanceRls
