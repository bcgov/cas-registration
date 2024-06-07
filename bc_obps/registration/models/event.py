from typing import Callable, Dict, Optional, Union
import uuid
from django.db import models
from registration.models import Address, Facility, Operation, TimeStampedModel
from simple_history.models import HistoricalRecords
from django.core.exceptions import ValidationError
from datetime import datetime


class Event(TimeStampedModel):
    class Types(models.TextChoices):
        CLOSING_OR_TEMPORARY_SHUTDOWN = "Closing or Temporary Shutdown"
        ACQUISITION = "Acquisition"
        TRANSFER_OF_CONTROL = "Transfer of Control"
        DIVESTMENT = "Divestment"
        STARTUP = "Startup"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, db_comment="Primary key to identify the event")
    operation = models.ForeignKey(Operation, null=True, blank=True, on_delete=models.DO_NOTHING, related_name="events")
    facility = models.ForeignKey(Facility, null=True, blank=True, on_delete=models.DO_NOTHING, related_name="events")
    effective_date = models.DateTimeField(db_comment="The effective date of the event")
    type = models.CharField(max_length=100, choices=Types.choices, db_comment="The type of the event")
    additional_data = models.JSONField(null=True, blank=True, db_comment="Additional data about the event")
    history = HistoricalRecords(
        table_name='erc_history"."event_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta:
        db_table_comment = (
            "Table containing information about events that occur in the lifecycle of an operation or facility."
        )
        db_table = 'erc"."event'
        constraints = [
            # Ensure that an event is associated with either an operation or a facility, but not both.
            models.CheckConstraint(
                check=(
                    (models.Q(operation_id__isnull=True) & models.Q(facility_id__isnull=False))
                    | (models.Q(operation_id__isnull=False) & models.Q(facility_id__isnull=True))
                ),
                name="event_not_both_operation_and_facility",
            ),
            # Explicitly ensure that an event cannot have both an operation and a facility.
            models.CheckConstraint(
                check=~(models.Q(operation_id__isnull=False) & models.Q(facility_id__isnull=False)),
                name="event_cannot_have_both_operation_and_facility",
            ),
            # Ensure that an event must have either an operation or a facility associated.
            models.CheckConstraint(
                check=~models.Q(operation_id__isnull=True, facility_id__isnull=True),
                name="event_has_operation_or_facility",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.type} - {self.effective_date}"

    @staticmethod
    def _validate_datetime(value: str) -> None:
        try:
            datetime.fromisoformat(value)
        except Exception as e:
            raise ValueError(f"Invalid datetime format: {e}")

    @staticmethod
    def _validate_address_id(value: Union[str, int]) -> None:
        try:
            Address.objects.get(pk=value)
        except Address.DoesNotExist:
            raise ValueError("Address not found")

    @staticmethod
    def _validate_string(value: Optional[str]) -> None:
        if not isinstance(value, str) or not value:
            raise ValueError("Value must be a non-empty string")

    def clean(self) -> None:
        """
        Custom model validation to ensure additional_data has the correct value based on the type of the event.
        NOTE: We can also implement this as a database constraint using a separate migration and having PostgreSQL CHECK the CONSTRAINT.
        """
        event_type_mapping: Dict[str, Dict[str, Callable]] = {
            self.Types.CLOSING_OR_TEMPORARY_SHUTDOWN: {'end_date': self._validate_datetime},
            self.Types.ACQUISITION: {
                'seller_legal_name': self._validate_string,
                'seller_mailing_address_id': self._validate_address_id,
            },
            self.Types.TRANSFER_OF_CONTROL: {
                'transferer_legal_name': self._validate_string,
                'transferer_mailing_address_id': self._validate_address_id,
            },
            self.Types.DIVESTMENT: {
                'buyer_legal_name': self._validate_string,
                'buyer_mailing_address_id': self._validate_address_id,
            },
            self.Types.STARTUP: {},  # No additional data required for startup(We only need the effective date)
        }

        required_fields_and_validators = event_type_mapping.get(self.type)

        if required_fields_and_validators is None:
            raise ValidationError("Invalid event type")

        # For all event types except STARTUP and CLOSING_OR_TEMPORARY_SHUTDOWN, additional_data is required
        if self.type not in [self.Types.STARTUP, self.Types.CLOSING_OR_TEMPORARY_SHUTDOWN]:
            if not self.additional_data:
                raise ValidationError("Additional data is missing")

            for field, check_func in required_fields_and_validators.items():
                value = self.additional_data.get(field)

                if value is None:
                    raise ValidationError(f"Field '{field}' is missing in additional data")

                try:
                    check_func(value)
                except Exception as e:
                    raise ValidationError(f"Invalid value for field '{field}': {e}")

        if (
            self.type == self.Types.CLOSING_OR_TEMPORARY_SHUTDOWN
            and self.additional_data
            and 'end_date' in self.additional_data
        ):
            try:
                self._validate_datetime(self.additional_data.get('end_date'))
            except Exception as e:
                raise ValidationError(f"Invalid value for field 'end_date': {e}")
