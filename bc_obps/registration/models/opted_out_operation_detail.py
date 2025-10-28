from django.db import models
from common.enums import Schemas
from registration.enums.enums import RegistrationTableNames
from registration.models import TimeStampedModel
from simple_history.models import HistoricalRecords
from registration.models.rls_configs.opted_out_operation_detail import Rls as OptedOutOperationDetailRls


class OptedOutOperationDetail(TimeStampedModel):
    class OptedOutEffectiveDateChoices(models.TextChoices):
        START_2026 = "Start of 2026"
        END_2026 = "End of 2026"

    effective_date = models.CharField(
        max_length=1000,
        choices=OptedOutEffectiveDateChoices,
        blank=True,
        null=True,
        db_comment="Operation is opted out as of this date",
    )

    history = HistoricalRecords(
        table_name='erc_history"."opted_out_operation_detail_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta(TimeStampedModel.Meta):
        db_table_comment = "Table containing details about operations that have opted out"
        db_table = f'{Schemas.ERC.value}"."{RegistrationTableNames.OPTED_OUT_OPERATION_DETAIL.value}'

    Rls = OptedOutOperationDetailRls
