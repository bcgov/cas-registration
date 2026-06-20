import uuid
from django.db import models
from registration.models import TimeStampedModel, Operation, Facility


class EventBaseModel(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, db_comment="Primary key to identify the event")
    effective_date = models.DateTimeField(
        db_comment="The date on which the closure, restart, shutdown, or transfer takes effect operationally"
    )
    operation = models.ForeignKey(
        Operation,
        null=True,
        blank=True,
        on_delete=models.PROTECT,
        db_comment="The operation associated with this event. Foreign key to erc.operation",
    )
    facilities = models.ManyToManyField(Facility, blank=True)

    class Meta(TimeStampedModel.Meta):
        abstract = True
