from django.db import models

from common.enums import Schemas
from registration.enums.enums import RegistrationTableNames
from registration.models import (
    Operation,
    Operator,
    TimeStampedModel,
)
from simple_history.models import HistoricalRecords
from registration.models.rls_configs.operation_designated_operator_timeline import Rls as OperationDesignatedOperatorRls


class OperationDesignatedOperatorTimeline(TimeStampedModel):
    operation = models.ForeignKey(
        Operation,
        on_delete=models.PROTECT,
        related_name="designated_operators",
        db_comment="The operation whose operator history is being tracked. Foreign key to erc.operation",
    )
    operator = models.ForeignKey(
        Operator,
        on_delete=models.PROTECT,
        related_name="operation_designated_operators",
        db_comment="The operator designated as responsible for this operation during the recorded period. Foreign key to erc.operator",
    )
    start_date = models.DateTimeField(
        blank=True,
        null=True,
        db_comment="The date the operator started being the designated operator of the operation. The 'designated'/controlling operator isn't necessarily the operation's owner.",
    )
    end_date = models.DateTimeField(
        blank=True,
        null=True,
        db_comment="The date the operator ended being the designated operator of the operation. Null indicates this is the currently active relationship",
    )
    history = HistoricalRecords(
        table_name='erc_history"."operation_designated_operator_timeline_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta(TimeStampedModel.Meta):
        db_table_comment = "Tracks the history of which operator has been designated as responsible for a given operation over time. A new record is created whenever an operation changes operator. A null end_date indicates the currently active relationship."
        db_table = f'{Schemas.ERC.value}"."{RegistrationTableNames.OPERATION_DESIGNATED_OPERATOR_TIMELINE.value}'
        constraints = [
            models.UniqueConstraint(
                fields=['operation'],
                condition=models.Q(end_date__isnull=True),
                name='unique_active_designated_operator_per_operation',
            )
        ]

    Rls = OperationDesignatedOperatorRls
