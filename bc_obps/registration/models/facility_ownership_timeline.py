from django.db import models
from registration.models import Facility, FacilityType, Operation, TimeStampedModel
from simple_history.models import HistoricalRecords


class FacilityOwnershipTimeline(TimeStampedModel):
    facility = models.ForeignKey(Facility, on_delete=models.DO_NOTHING, related_name="ownerships")
    operation = models.ForeignKey(Operation, on_delete=models.DO_NOTHING, related_name="facility_ownerships")
    name = models.CharField(max_length=1000, db_comment="The name of the facility when the operation owned it")
    facility_type = models.ForeignKey(
        FacilityType,
        on_delete=models.DO_NOTHING,
        related_name="facility_ownerships",
        db_comment="The type of facility that the operation owned",
    )
    start_date = models.DateTimeField(
        blank=True, null=True, db_comment="The start date of the ownership of the facility"
    )
    end_date = models.DateTimeField(blank=True, null=True, db_comment="The end date of the ownership of the facility")

    history = HistoricalRecords(
        table_name='erc_history"."facility_ownership_timeline_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta:
        db_table_comment = "A table to connect facilities and operations"
        db_table = 'erc"."facility_ownership_timeline'
        constraints = [
            models.UniqueConstraint(
                fields=['facility'],
                condition=models.Q(end_date__isnull=True),
                name='unique_active_ownership_per_facility',
            )
        ]
