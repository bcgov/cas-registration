import uuid
from django.db import models
from common.enums import Schemas
from registration.enums.enums import RegistrationTableNames
from registration.models import TimeStampedModel, Facility, Operation
from simple_history.models import HistoricalRecords
from django.core.validators import MaxValueValidator, MinValueValidator
from registration.models.rls_configs.facility_snapshot import Rls as FacilitySnapshotRls


class FacilitySnapshot(TimeStampedModel):
    """
    A snapshot of facility data at the time of transfer.
    This model captures the state of a facility when it is transferred from one operation to another,
    allowing old operators to see the facility data as it existed at the time they owned it.
    """

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        db_comment="Primary key to identify the facility snapshot",
        verbose_name="ID",
    )
    facility = models.ForeignKey(
        Facility,
        on_delete=models.PROTECT,
        db_comment="The facility that this snapshot represents",
        related_name="facility_snapshot",
    )
    operation = models.ForeignKey(
        Operation,
        on_delete=models.PROTECT,
        db_comment="The operation that owned the facility at the time of the snapshot",
        related_name="facility_snapshot",
    )
    name = models.CharField(
        max_length=1000,
        db_comment="The name of the facility at the time of the snapshot",
    )
    is_current_year = models.BooleanField(
        blank=True,
        null=True,
        db_comment="The facility's starting date is within the current year or preceding year at snapshot time",
    )
    starting_date = models.DateTimeField(
        blank=True, null=True, db_comment="The date of the facility starting operations at snapshot time"
    )
    type = models.CharField(max_length=100, db_comment="The type of the facility at snapshot time")
    street_address = models.CharField(
        max_length=1000,
        blank=True,
        null=True,
        db_comment="Street address of the facility at snapshot time",
    )
    municipality = models.CharField(
        max_length=1000,
        blank=True,
        null=True,
        db_comment="Municipality of the facility at snapshot time",
    )
    province = models.CharField(
        max_length=1000,
        blank=True,
        null=True,
        db_comment="Province of the facility at snapshot time",
    )
    postal_code = models.CharField(
        max_length=10,
        blank=True,
        null=True,
        db_comment="Postal code of the facility at snapshot time",
    )
    swrs_facility_id = models.IntegerField(
        db_comment="The facility's SWRS facility ID at snapshot time",
        blank=True,
        null=True,
    )
    bcghg_id = models.CharField(
        max_length=1000,
        db_comment="The facility's BCGHG identifier at snapshot time",
        blank=True,
        null=True,
    )
    latitude_of_largest_emissions = models.DecimalField(
        db_comment='The latitude of the largest point of emissions at snapshot time',
        decimal_places=6,
        max_digits=8,
        null=True,
        blank=True,
        validators=[MinValueValidator(-90), MaxValueValidator(90)],
    )
    longitude_of_largest_emissions = models.DecimalField(
        db_comment='The longitude of the largest point of emissions at snapshot time',
        decimal_places=6,
        max_digits=9,
        null=True,
        blank=True,
        validators=[MinValueValidator(-180), MaxValueValidator(180)],
    )
    well_authorization_numbers = models.JSONField(
        db_comment="List of well authorization numbers at snapshot time",
        blank=True,
        null=True,
        default=list,
    )
    snapshot_timestamp = models.DateTimeField(
        auto_now_add=True,
        db_comment="The timestamp at which this snapshot was taken",
    )
    history = HistoricalRecords(
        table_name='erc_history"."facility_snapshot_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta(TimeStampedModel.Meta):
        db_table_comment = "Snapshots of facility data at the time of transfer. This allows old operators to view facility information as it existed when they owned the facility, even after changes are made by new operators."
        db_table = f'{Schemas.ERC.value}"."{RegistrationTableNames.FACILITY_SNAPSHOT.value}'
        verbose_name_plural = "Facility Snapshots"
        indexes = [
            models.Index(fields=['facility', 'operation']),
            models.Index(fields=['operation']),
            models.Index(fields=['snapshot_timestamp']),
        ]

    Rls = FacilitySnapshotRls

    def __str__(self) -> str:
        return f"Snapshot of {self.name} for Operation {self.operation.name} at {self.snapshot_timestamp}"
