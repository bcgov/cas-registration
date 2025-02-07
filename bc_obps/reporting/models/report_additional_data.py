from django.db import models
from registration.models.time_stamped_model import TimeStampedModel
from reporting.models.report_version import ReportVersion
from reporting.models.triggers import immutable_report_version_trigger


class ReportAdditionalData(TimeStampedModel):
    report_version = models.OneToOneField(
        ReportVersion,
        on_delete=models.CASCADE,
        related_name="report_additional_data",
        db_comment="The report version this report additional data applies to",
    )
    capture_emissions = models.BooleanField(
        db_comment="Whether or not capture emissions was selected",
        default=False,
    )
    emissions_on_site_use = models.IntegerField(
        blank=True,
        db_comment="Emissions on site use",
        null=True,
    )
    emissions_on_site_sequestration = models.IntegerField(
        blank=True,
        db_comment="Emissions on site sequestration",
        null=True,
    )
    emissions_off_site_transfer = models.IntegerField(
        blank=True,
        db_comment="Emissions off-site transfer",
        null=True,
    )
    electricity_generated = models.IntegerField(
        blank=True,
        db_comment="Electricity generated",
        null=True,
    )

    class Meta(TimeStampedModel.Meta):
        db_table_comment = "A table to store the additional data for the report"
        db_table = 'erc"."report_additional_data'
        app_label = "reporting"
        triggers = [
            *TimeStampedModel.Meta.triggers,
            immutable_report_version_trigger(),
        ]
