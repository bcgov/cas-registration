from django.db import models
from registration.models import (
    Operation,
    Operator,
    TimeStampedModel,
)
from simple_history.models import HistoricalRecords


class OperationDesignatedOperatorTimeline(TimeStampedModel):
    operation = models.ForeignKey(Operation, on_delete=models.DO_NOTHING, related_name="designated_operators")
    operator = models.ForeignKey(Operator, on_delete=models.DO_NOTHING, related_name="operation_designated_operators")
    start_date = models.DateTimeField(
        blank=True,
        null=True,
        db_comment="The date the operator started being the designated operator of the operation. The 'designated'/controlling operator isn't necessarily the operation's owner.",
    )
    end_date = models.DateTimeField(
        blank=True, null=True, db_comment="The date the operator ended being the designated operator of the operation"
    )
    history = HistoricalRecords(
        table_name='erc_history"."operation_designated_operator_timeline_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta:
        db_table_comment = "A table to connect operations and their designated operators throughout their lifetimes"
        db_table = 'erc"."operation_designated_operator_timeline'
        constraints = [
            models.UniqueConstraint(
                fields=['operation'],
                condition=models.Q(end_date__isnull=True),
                name='unique_active_designated_operator_per_operation',
            )
        ]
