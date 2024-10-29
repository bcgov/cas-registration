from django.db import models

from registration.models import TimeStampedModel
from reporting.models.emission_category import EmissionCategory
from reporting.models.gas_type import GasType


class ReportNonAttributableEmissions(TimeStampedModel):
    id = models.AutoField(primary_key=True, db_comment="Primary key for the non-attributable emissions report record.")

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
    )

    gas_type = models.ManyToManyField(GasType, db_comment="The type of gas emitted.", blank=True)

    class Meta:
        db_table = 'erc"."report_non_attributable_emissions'
        db_table_comment = "A table to store non-attributable emissions data."
        app_label = 'reporting'
