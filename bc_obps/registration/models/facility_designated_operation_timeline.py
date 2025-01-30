from django.db import models
from registration.models import Facility, Operation, TimeStampedModel
from simple_history.models import HistoricalRecords


class FacilityDesignatedOperationTimeline(TimeStampedModel):
    class Statuses(models.TextChoices):
        ACTIVE = "Active"
        TRANSFERRED = "Transferred"
        CLOSED = "Closed"
        TEMPORARILY_SHUTDOWN = "Temporarily Shutdown"

    facility = models.ForeignKey(Facility, on_delete=models.PROTECT, related_name="designated_operations")
    operation = models.ForeignKey(Operation, on_delete=models.PROTECT, related_name="facility_designated_operations")
    start_date = models.DateTimeField(
        blank=True,
        null=True,
        db_comment="The date an operation became the designated operation of a facility. This data captures the relationship between the facility and operation it falls under.",
    )
    end_date = models.DateTimeField(
        blank=True, null=True, db_comment="The date an operation stopped being the designated operation of a facility"
    )
    status = models.CharField(
        max_length=1000,
        choices=Statuses.choices,
        default=Statuses.ACTIVE,
        db_comment="The status of the facility in relation to the designated operation. For example, when a facility is transferred from Operation A to Operation B, under Operation A the status will be 'Transferred' but under Operation B the status will be 'Active'.",
    )

    history = HistoricalRecords(
        table_name='erc_history"."facility_designated_operation_timeline_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta(TimeStampedModel.Meta):
        db_table_comment = "A table to connect facilities and operations"
        db_table = 'erc"."facility_designated_operation_timeline'
        constraints = [
            models.UniqueConstraint(
                fields=['facility'],
                condition=models.Q(end_date__isnull=True),
                name='unique_active_designated_operation_per_facility',
            )
        ]
