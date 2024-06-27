from django.db import models
from registration.models import Facility, Operation, TimeStampedModel
from simple_history.models import HistoricalRecords


class FacilityOwnershipTimeline(TimeStampedModel):
    facility = models.ForeignKey(Facility, on_delete=models.DO_NOTHING, related_name="ownerships")
    operation = models.ForeignKey(Operation, on_delete=models.DO_NOTHING, related_name="facility_ownerships")
    start_date = models.DateTimeField(
        blank=True, null=True, db_comment="The start date of the ownership of the facility"
    )
    end_date = models.DateTimeField(blank=True, null=True, db_comment="The end date of the ownership of the facility")

    history = HistoricalRecords(
        table_name='erc_history"."facility_ownership_timeline_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    def __str__(self) -> str:
        return f'{self.facility}, {self.operation}, {self.start_date}, {self.end_date}'

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
