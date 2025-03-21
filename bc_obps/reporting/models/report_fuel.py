from django.db import models
from reporting.models.fuel_type import FuelType
from reporting.models.report_data_base_model import ReportDataBaseModel
from reporting.models.report_source_type import ReportSourceType
from reporting.models.report_unit import ReportUnit
from reporting.models.triggers import immutable_report_version_trigger
from reporting.models.rls_configs.report_fuel import Rls as ReportFuelRls


class ReportFuel(ReportDataBaseModel):
    report_source_type = models.ForeignKey(
        ReportSourceType,
        on_delete=models.CASCADE,
        related_name="%(class)s_records",
        db_comment="The source type data this unit data belongs to",
    )
    report_unit = models.ForeignKey(
        ReportUnit,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="%(class)s_records",
        db_comment="The unit form data this fuel data belongs to, if applicable",
    )
    fuel_type = models.ForeignKey(
        FuelType,
        on_delete=models.PROTECT,
        related_name="%(class)s_records",
        db_comment="The fuel type this data applies to",
    )

    class Meta(ReportDataBaseModel.Meta):
        db_table_comment = "A table to store the reported fuel-specific data, in a JSON format"
        db_table = 'erc"."report_fuel'
        app_label = "reporting"
        triggers = [
            *ReportDataBaseModel.Meta.triggers,
            immutable_report_version_trigger(),
        ]

    Rls = ReportFuelRls
