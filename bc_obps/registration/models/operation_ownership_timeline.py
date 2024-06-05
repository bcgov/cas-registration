from django.db import models
from registration.models import (
    Operation,
    Operator,
    TimeStampedModel,
)
from simple_history.models import HistoricalRecords


class OperationOwnershipTimeline(TimeStampedModel):
    operation = models.ForeignKey(Operation, on_delete=models.DO_NOTHING, related_name="ownerships")
    operator = models.ForeignKey(Operator, on_delete=models.DO_NOTHING, related_name="operation_ownerships")
    start_date = models.DateTimeField(
        blank=True, null=True, db_comment="The start date of the ownership of the operation"
    )
    end_date = models.DateTimeField(blank=True, null=True, db_comment="The end date of the ownership of the operation")
    history = HistoricalRecords(
        table_name='erc_history"."operation_ownership_timeline_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta:
        db_table_comment = "A table to connect operations and operators"
        db_table = 'erc"."operation_ownership_timeline'
        constraints = [
            models.UniqueConstraint(
                fields=['operation'],
                condition=models.Q(end_date__isnull=True),
                name='unique_active_ownership_per_operation',
            )
        ]
