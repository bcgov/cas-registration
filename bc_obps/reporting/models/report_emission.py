from django.db import models
from reporting.models.gas_type import GasType
from reporting.models.report_data_base_model import ReportDataBaseModel
from reporting.models.report_fuel import ReportFuel
from reporting.models.report_source_type import ReportSourceType
from reporting.models.emission_category import EmissionCategory


class ReportEmission(ReportDataBaseModel):

    gas_type = models.ForeignKey(
        GasType,
        on_delete=models.PROTECT,
        related_name="%(class)s_records",
        db_comment="The gas type this emission data applies to",
    )
    report_source_type = models.ForeignKey(
        ReportSourceType,
        on_delete=models.CASCADE,
        related_name="%(class)s_records",
        db_comment="The source type data this emission data belongs to",
    )
    report_fuel = models.ForeignKey(
        ReportFuel,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="%(class)s_records",
        db_comment="The fuel data this emission data belongs to, if applicable",
    )
    emission_categories = models.ManyToManyField(
        EmissionCategory,
        related_name="+",
    )

    class Meta:
        db_table_comment = "A table to store the reported emission-specific data, in a JSON format"
        db_table = 'erc"."report_emission'
        app_label = 'reporting'
