import uuid
from django.db import models
from registration.models import TimeStampedModel
from datetime import datetime


class Event(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, db_comment="Primary key to identify the event")
    effective_date = models.DateTimeField(db_comment="The effective date of the event")
    status = models.CharField(
        max_length=100, choices=[], db_comment="The status of the event or transfer request."
    )  # placeholder for choices defined in the models that inherit Event

    class Meta:
        abstract = True  # Event is an abstract base model

    def __str__(self) -> str:
        return f"Event: effective date {self.effective_date}"

    @staticmethod
    def _validate_datetime(value: str) -> None:
        try:
            datetime.fromisoformat(value)
        except Exception as e:
            raise ValueError(f"Invalid datetime format: {e}")
