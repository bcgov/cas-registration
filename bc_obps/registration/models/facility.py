import uuid
from django.db import models
from registration.models import Address, TimeStampedModel, Operation
from simple_history.models import HistoricalRecords


class Facility(TimeStampedModel):
    class Types(models.TextChoices):
        SINGLE_FACILITY = "Single Facility"
        LARGE_LFO = "Large LFO"
        MEDIUM_LFO = "Medium LFO"
        SMALL_AGGREGATE_LFO = "Small Aggregate LFO"

    id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, db_comment="Primary key to identify the facility", verbose_name="ID"
    )
    name = models.CharField(max_length=1000, db_comment="The name of the facility when the operation owned it")
    type = models.CharField(max_length=100, choices=Types.choices, db_comment="The type of the facility")
    address = models.ForeignKey(
        Address,
        on_delete=models.DO_NOTHING,
        db_comment="The address of the facility",
        blank=True,
        null=True,
        related_name='%(class)s_address',
    )
    swrs_facility_id = models.IntegerField(
        db_comment="A facility's SWRS facility ID.",
        blank=True,
        null=True,
    )
    bcghg_id = models.CharField(
        max_length=1000,
        db_comment="A facility's BCGHG identifier.",
        blank=True,
        null=True,
    )
    history = HistoricalRecords(
        table_name='erc_history"."facility_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta:
        db_table_comment = "Contains data on facilities that emit carbon emissions and must report them to Clean Growth. A linear facility operation is made up of several different facilities whereas a single facility operation has only one facility. In the case of a single facility operation, much of the data in this table will overlap with the parent record in the operation table."
        db_table = 'erc"."facility'
        verbose_name_plural = "Facilities"

    @property
    def current_owner(self) -> Operation:
        """
        Returns the current owner(operation) of the facility.
        """
        return self.ownerships.get(end_date__isnull=True).operation
