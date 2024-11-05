from django.db import models
from registration.models.time_stamped_model import TimeStampedModel
from reporting.models.report_version import ReportVersion


class ReportNewEntrant(TimeStampedModel):
    report_version = models.OneToOneField(
        ReportVersion,
        on_delete=models.PROTECT,
        related_name="report_new_entrant",
        db_comment="The associated report version for this new entrant record",
        primary_key=True,
    )
    authorization_date = models.DateField(
        db_comment="Date of authorization for emission reporting",
    )
    first_shipment_date = models.DateField(
        blank=True,
        null=True,
        db_comment="Date of the first shipment related to this report (if applicable)",
    )
    new_entrant_period_start = models.DateField(
        blank=True,
        null=True,
        db_comment="Start date of the new entrant reporting period",
    )
    assertion_statement_certified = models.BooleanField(
        blank=True,
        null=True,
        db_comment="Indicates if the assertion statement is certified",
    )
    flaring_emissions = models.IntegerField(
        blank=True, null=True, default=0, db_comment="Emissions from flaring activities"
    )
    fugitive_emissions = models.IntegerField(
        blank=True, null=True, default=0, db_comment="Unintentional emissions (fugitive)"
    )
    industrial_process_emissions = models.IntegerField(
        blank=True, null=True, default=0, db_comment="Emissions from industrial processes"
    )
    on_site_transportation_emissions = models.IntegerField(
        blank=True, null=True, default=0, db_comment="Emissions from on-site transportation"
    )
    stationary_fuel_combustion_emissions = models.IntegerField(
        blank=True, null=True, default=0, db_comment="Emissions from stationary fuel combustion"
    )
    venting_emissions_useful = models.IntegerField(
        blank=True, null=True, default=0, db_comment="Venting emissions deemed useful"
    )
    venting_emissions_non_useful = models.IntegerField(
        blank=True, null=True, default=0, db_comment="Non-useful venting emissions"
    )
    emissions_from_waste = models.IntegerField(
        blank=True, null=True, default=0, db_comment="Emissions from waste disposal"
    )
    emissions_from_wastewater = models.IntegerField(
        blank=True, null=True, default=0, db_comment="Emissions from wastewater processing"
    )
    co2_emissions_from_excluded_woody_biomass = models.IntegerField(
        blank=True, null=True, default=0, db_comment="CO2 emissions from excluded woody biomass"
    )
    other_emissions_from_excluded_biomass = models.IntegerField(
        blank=True, null=True, default=0, db_comment="Emissions from other excluded biomass"
    )
    emissions_from_excluded_non_biomass = models.IntegerField(
        blank=True, null=True, default=0, db_comment="Emissions from excluded non-biomass sources"
    )
    emissions_from_line_tracing = models.IntegerField(
        blank=True, null=True, default=0, db_comment="Emissions from line tracing activities"
    )
    emissions_from_fat_oil = models.IntegerField(
        blank=True, null=True, default=0, db_comment="Emissions from fat or oil sources"
    )

    class Meta:
        db_table = 'erc"."report_new_entrant'
        app_label = 'reporting'
        db_table_comment = "Table storing new entrant emissions data for the reporting system"
