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
    class Statuses(models.TextChoices):
        ACTIVE = "Active"
        TRANSFERRED = "Transferred"
        CLOSED = "Closed"
        TEMPORARILY_SHUTDOWN = "Temporarily Shutdown"

    operation = models.ForeignKey(Operation, on_delete=models.PROTECT, related_name="designated_operators")
    operator = models.ForeignKey(Operator, on_delete=models.PROTECT, related_name="operation_designated_operators")
    start_date = models.DateTimeField(
        blank=True,
        null=True,
        db_comment="The date the operator started being the designated operator of the operation. The 'designated'/controlling operator isn't necessarily the operation's owner.",
    )
    end_date = models.DateTimeField(
        blank=True, null=True, db_comment="The date the operator ended being the designated operator of the operation"
    )
    status = models.CharField(
        max_length=1000,
        choices=Statuses.choices,
        default=Statuses.ACTIVE,
        db_comment="The status of an operation in relation to a specific operator (e.g. if an operation has transferred ownership, it may have a status of Transferred with its old operator and Active with its new one)",
    )
    history = HistoricalRecords(
        table_name='erc_history"."operation_designated_operator_timeline_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta(TimeStampedModel.Meta):
        db_table_comment = "A table to connect operations and their designated operators throughout their lifetimes"
        db_table = f'{Schemas.ERC.value}"."{RegistrationTableNames.OPERATION_DESIGNATED_OPERATOR_TIMELINE.value}'
        constraints = [
            models.UniqueConstraint(
                fields=['operation'],
                condition=models.Q(end_date__isnull=True),
                name='unique_active_designated_operator_per_operation',
            )
        ]

    Rls = OperationDesignatedOperatorRls
