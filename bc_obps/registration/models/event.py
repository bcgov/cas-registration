import uuid
from django.db import models
from registration.models import Facility, Operation, TimeStampedModel
from simple_history.models import HistoricalRecords
from datetime import datetime


class Event(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, db_comment="Primary key to identify the event")
    operation = models.ForeignKey(Operation, null=True, blank=True, on_delete=models.DO_NOTHING, related_name="events")
    facilities = models.ManyToManyField(Facility, blank=True, related_name="events")
    effective_date = models.DateTimeField(db_comment="The effective date of the event")
    history = HistoricalRecords(
        table_name='erc_history"."event_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta:
        db_table_comment = (
            "Concrete base model for all specific types of events (restart, shutdown, temporary closure, transfer)."
        )
        db_table = 'erc"."event'
        # constraints = [
        #     # Ensure that an event is associated with either an operation or a facility, but not both.
        #     models.CheckConstraint(
        #         check=(
        #             (models.Q(operation_id__isnull=True) & models.Q(facility_id__isnull=False))
        #             | (models.Q(operation_id__isnull=False) & models.Q(facility_id__isnull=True))
        #         ),
        #         name="event_not_both_operation_and_facility",
        #     ),
        #     # Explicitly ensure that an event cannot have both an operation and a facility.
        #     models.CheckConstraint(
        #         check=~(models.Q(operation_id__isnull=False) & models.Q(facility_id__isnull=False)),
        #         name="event_cannot_have_both_operation_and_facility",
        #     ),
        #     # Ensure that an event must have either an operation or a facility associated.
        #     models.CheckConstraint(
        #         check=~models.Q(operation_id__isnull=True, facility_id__isnull=True),
        #         name="event_has_operation_or_facility",
        #     ),
        # ]

    def __str__(self) -> str:
        return f"Event: effective date {self.effective_date}"

    @staticmethod
    def _validate_datetime(value: str) -> None:
        try:
            datetime.fromisoformat(value)
        except Exception as e:
            raise ValueError(f"Invalid datetime format: {e}")
