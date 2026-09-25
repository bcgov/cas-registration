import uuid
from registration.models.user import User
from registration.models.time_stamped_model import TimeStampedModel
from compliance.models.compliance_obligation import ComplianceObligation
from common.enums import Schemas
from django.db import models
from simple_history.models import HistoricalRecords
from registry.enums.enums import RegistryTableNames
from registry.models import Account, Unit
from registry.models.rls_configs.retirement import Rls as RetirementRls


class Retirement(TimeStampedModel):
    class Status(models.TextChoices):
        APPROVED = "Approved"
        CANCELLED = "Cancelled"
        DECLINED = "Declined"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    unit = models.ForeignKey(
        Unit,
        on_delete=models.PROTECT,
    )
    from_account = models.ForeignKey(
        Account,
        on_delete=models.DO_NOTHING,
    )
    compliance_obligation = models.ForeignKey(
        ComplianceObligation,
        on_delete=models.PROTECT,
    )
    date_time = models.DateTimeField()
    status = models.CharField(max_length=50, choices=Status.choices)
    comment = models.CharField(
        max_length=1000,
        db_comment="Free-form text field to capture the internal reviewer's comments regarding the requested retirement.",
    )
    reviewed_by = models.ForeignKey(
        User,
        on_delete=models.DO_NOTHING,
        db_comment="The IRC user who reviewed the request to retire the unit/s and made a decision",
    )
    history = HistoricalRecords(
        table_name='erc_history"."credit_retirement_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta(TimeStampedModel.Meta):
        db_table = f'{Schemas.ERC.value}"."{RegistryTableNames.RETIREMENT.value}'
        db_table_comment = "A record of all requests to retire unit/s against a compliance obligation."

    Rls = RetirementRls
