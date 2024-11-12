import uuid
from django.db import models
from registration.models import TimeStampedModel, Operation, Facility


class EventBaseModel(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, db_comment="Primary key to identify the event")
    effective_date = models.DateTimeField(db_comment="The effective date of the event")
    operation = models.ForeignKey(Operation, null=True, blank=True, on_delete=models.PROTECT)
    facilities = models.ManyToManyField(Facility, blank=True)

    class Meta:
        abstract = True
