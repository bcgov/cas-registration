from typing import Callable, Dict, Optional, Union
import uuid
from django.db import models
from registration.models import Address, Facility, Operation, TimeStampedModel
from simple_history.models import HistoricalRecords
from django.core.exceptions import ValidationError
from datetime import datetime


class Event(TimeStampedModel):
    class Types(models.TextChoices):
        """
        ?: Could we have shorter names for the types?
        ?: Do we need any constraint on operation and facility?(like only one of them can be null or some event types can only be associated with one of them)
        TODO: Make sure these are the correct types
        """

        CLOSING_OR_TEMPORARY_SHUTDOWN = "Closing or Temporary Shutdown"
        ACQUISITION = "Acquisition"
        TRANSFER_OF_CONTROL = "Transfer of Control"
        DIVESTMENT = "Divestment"
        # STARTUP = "Startup"
        # CHANGE_IN_THE_OPERATOR_HAVING_CONTROL_AND_DIRECTION = "Change in the Operator having Control and Direction"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, db_comment="Primary key to identify the event")
    operation = models.ForeignKey(Operation, null=True, blank=True, on_delete=models.DO_NOTHING, related_name="events")
    facility = models.ForeignKey(Facility, null=True, blank=True, on_delete=models.DO_NOTHING, related_name="events")
    effective_date = models.DateTimeField(db_comment="The effective date of the event")
    type = models.CharField(max_length=100, choices=Types.choices, db_comment="The type of the event")
    additional_data = models.JSONField(db_comment="Additional data about the event")
    history = HistoricalRecords(
        table_name='erc_history"."event_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta:
        db_table_comment = (
            "Table containing information about events that occur in the lifecycle of an operation or facility."
        )
        db_table = 'erc"."event'

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
            self.Types.CLOSING_OR_TEMPORARY_SHUTDOWN: {'end_date': lambda value: self._validate_datetime(value)},
            self.Types.ACQUISITION: {
                'seller_legal_name': lambda value: self._validate_string(value),
                'seller_mailing_address_id': lambda value: self._validate_address_id(value),
            },
            self.Types.TRANSFER_OF_CONTROL: {
                'transferer_legal_name': lambda value: self._validate_string(value),
                'transferer_mailing_address_id': lambda value: self._validate_address_id(value),
            },
            self.Types.DIVESTMENT: {
                'buyer_legal_name': lambda value: self._validate_string(value),
                'buyer_mailing_address_id': lambda value: self._validate_address_id(value),
            },
            # self.Types.STARTUP: ...
            # self.Types.CHANGE_IN_THE_OPERATOR_HAVING_CONTROL_AND_DIRECTION: ...
        }

        required_fields_and_validators = event_type_mapping.get(self.type, {})

        if not required_fields_and_validators:
            raise ValidationError("Invalid event type")

        if not self.additional_data:
            raise ValidationError("Additional data is missing")

        for field, check_func in required_fields_and_validators.items():
            value = self.additional_data.get(field)

            if not value:
                raise ValidationError(f"Field '{field}' is missing in additional data")

            try:
                check_func(value)
            except Exception as e:
                raise ValidationError(f"Invalid value for field '{field}': {e}")
