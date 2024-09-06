from django.db import models
from registration.models import Facility, Operation, TimeStampedModel
from simple_history.models import HistoricalRecords


class FacilityDesignatedOperationTimeline(TimeStampedModel):
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

    history = HistoricalRecords(
        table_name='erc_history"."facility_designated_operation_timeline_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta:
        db_table_comment = "A table to connect facilities and operations"
        db_table = 'erc"."facility_designated_operation_timeline'
        constraints = [
            models.UniqueConstraint(
                fields=['facility'],
                condition=models.Q(end_date__isnull=True),
                name='unique_active_designated_operation_per_facility',
            )
        ]
