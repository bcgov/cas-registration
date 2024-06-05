from django.db import models
from registration.models import (
    Contact,
    Document,
    Operation,
    OperationType,
    Operator,
    RegulatedProduct,
    ReportingActivity,
    TimeStampedModel,
)
from simple_history.models import HistoricalRecords


"""
NOTE:
1- We need to populate this data model using the data from the existing operations (Need to create ownerships)
2- Once updated, we need to update all references to an operation to use this model instead
3- First step should happen once we update all references throughout the code to use this model
4- We need to update the operation model to remove the fields that are now in this model
"""


class OperationOwnershipTimeline(TimeStampedModel):
    operation = models.ForeignKey(Operation, on_delete=models.DO_NOTHING, related_name="ownerships")
    operator = models.ForeignKey(Operator, on_delete=models.DO_NOTHING, related_name="operation_ownerships")
    name = models.CharField(
        max_length=1000, db_comment="The name of an operation"
    )  # TODO: Need a data migration to populate this
    operation_type = models.ForeignKey(
        OperationType,
        on_delete=models.DO_NOTHING,
        related_name="operation_ownerships",
        db_comment="The type of operation that the operator owned",
    )  # TODO: Need a data migration to populate this
    operation_has_multiple_operators = models.BooleanField(
        db_comment="Whether or not the operation has multiple operators", default=False
    )  # TODO: Need a data migration to populate this
    opt_in = models.BooleanField(
        db_comment="Whether or not the operation is required to register or is simply opting in. Only needed if the operation did not report the previous year.",
        blank=True,
        null=True,
    )  # TODO: Need a data migration to populate this
    documents = models.ManyToManyField(
        Document,
        blank=True,
        related_name="operation_ownerships",
    )  # TODO: Need a data migration to populate this
    point_of_contact = models.ForeignKey(
        Contact,
        on_delete=models.DO_NOTHING,
        related_name="operation_ownerships",
        blank=True,
        null=True,
        db_comment="Foreign key to the contact that is the point of contact",
    )  # TODO: Need a data migration to populate this
    regulated_products = models.ManyToManyField(
        RegulatedProduct,
        blank=True,
        related_name="operation_ownerships",
    )  # TODO: Need a data migration to populate this
    reporting_activities = models.ManyToManyField(
        ReportingActivity,
        blank=True,
        related_name="operation_ownerships",
    )  # TODO: Need a data migration to populate this
    start_date = models.DateTimeField(
        blank=True, null=True, db_comment="The start date of the ownership of the operation"
    )  # TODO: Need a data migration to populate this
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
