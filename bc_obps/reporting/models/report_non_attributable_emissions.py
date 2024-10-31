from django.db import models

from registration.models import TimeStampedModel
from reporting.models import ReportVersion
from reporting.models.emission_category import EmissionCategory
from reporting.models.gas_type import GasType


class ReportNonAttributableEmissions(TimeStampedModel):
    report_version = models.ForeignKey(
        ReportVersion,
        on_delete=models.CASCADE,
        related_name="report_non_attributable_emissions",
        db_comment="The report this operation information relates to",
    )
    activity = models.CharField(max_length=255, db_comment="The name or description of the activity.")

    source_type = models.CharField(
        max_length=255,
        db_comment="The type of source responsible for the emission.",
        blank=True,
        null=True,
    )

    emission_category = models.ForeignKey(
        EmissionCategory,
        on_delete=models.PROTECT,
        db_comment="The emission category associated with this emission.",
        blank=True,
        null=True,
        related_name="report_non_attributable_emissions",
    )

    gas_type = models.ManyToManyField(GasType, related_name="+")

    class Meta:
        db_table = 'erc"."report_non_attributable_emissions'
        db_table_comment = "A table to store non-attributable emissions data."
        app_label = 'reporting'
