import uuid
from django.db import models


from registration.models.well_authorization_number import WellAuthorizationNumber
from registration.models import Address, TimeStampedModel, Operation
from simple_history.models import HistoricalRecords
from django.core.validators import MaxValueValidator, MinValueValidator


class Facility(TimeStampedModel):
    class Types(models.TextChoices):
        SINGLE_FACILITY = "Single Facility"
        LARGE_FACILITY = "Large Facility"
        MEDIUM_FACILITY = "Medium Facility"
        SMALL_AGGREGATE = "Small Aggregate"
        ELECTRICITY_IMPORT = "Electricity Import"

    id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, db_comment="Primary key to identify the facility", verbose_name="ID"
    )
    operation = models.ForeignKey(
        Operation,
        on_delete=models.PROTECT,
        db_comment="The operation who currently owns the facility (see the FacilityDesignatedOperationTimeline for past and upcoming ownership)",
        related_name="facilities",
    )
    name = models.CharField(
        max_length=1000,
        db_comment="The name of the facility when the operation owned it",
        unique=True,
    )
    is_current_year = models.BooleanField(
        blank=True, null=True, db_comment="The facility's starting date is within the current year or preceeding year"
    )
    starting_date = models.DateTimeField(
        blank=True, null=True, db_comment="The date of the facility starting operations"
    )
    type = models.CharField(max_length=100, choices=Types.choices, db_comment="The type of the facility")
    address = models.ForeignKey(
        Address,
        on_delete=models.PROTECT,
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
    bcghg_id = models.OneToOneField(
        "BcGreenhouseGasId",
        on_delete=models.PROTECT,
        max_length=1000,
        db_comment="A facility's BCGHG identifier.",
        blank=True,
        null=True,
    )
    latitude_of_largest_emissions = models.DecimalField(
        db_comment='The latitude of the largest point of emissions',
        decimal_places=6,
        max_digits=8,
        null=True,
        blank=True,
        validators=[MinValueValidator(-90), MaxValueValidator(90)],
    )
    longitude_of_largest_emissions = models.DecimalField(
        db_comment='The longitude of the largest point of emissions',
        decimal_places=6,
        max_digits=9,
        null=True,
        blank=True,
        validators=[MinValueValidator(-180), MaxValueValidator(180)],
    )
    well_authorization_numbers = models.ManyToManyField(WellAuthorizationNumber, related_name='facilities')
    history = HistoricalRecords(
        table_name='erc_history"."facility_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta(TimeStampedModel.Meta):
        db_table_comment = "Contains data on facilities that emit carbon emissions and must report them to Clean Growth. A linear facility operation is made up of several different facilities whereas a single facility operation has only one facility. In the case of a single facility operation, much of the data in this table will overlap with the parent record in the operation table."
        db_table = 'erc"."facility'
        verbose_name_plural = "Facilities"

    @property
    def current_designated_operation(self) -> Operation:
        """
        Returns the current designated operation of the facility.
        """
        return self.designated_operations.get(end_date__isnull=True).operation

    def generate_unique_bcghg_id(self) -> None:
        from registration.models.utils import generate_unique_bcghg_id_for_operation_or_facility

        generate_unique_bcghg_id_for_operation_or_facility(self)
