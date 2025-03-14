from django.db import models
from reporting.models.report_data_base_model import ReportDataBaseModel
from reporting.models.report_source_type import ReportSourceType
from reporting.models.triggers import immutable_report_version_trigger
from reporting.models.rls_configs.report_unit import Rls as ReportUnitRls


class ReportUnit(ReportDataBaseModel):
    class ReportUnitType(models.TextChoices):
        UNIT = "Unit"
        SOURCE_SUBTYPE = "Source sub-type"

    report_source_type = models.ForeignKey(
        ReportSourceType,
        on_delete=models.CASCADE,
        related_name="%(class)s_records",
        db_comment="The source type data this unit data belongs to",
    )

    type = models.CharField(
        max_length=1000,
        db_comment="The data type for this unit record, whether it's a regular `Unit` or a `Source sub-type` for an oil and gas activity.",
        default=ReportUnitType.UNIT,
        choices=ReportUnitType.choices,
    )

    class Meta(ReportDataBaseModel.Meta):
        db_table_comment = "A table to store the reported unit-specific data, in a JSON format"
        db_table = 'erc"."report_unit'
        app_label = "reporting"
        triggers = [
            *ReportDataBaseModel.Meta.triggers,
            immutable_report_version_trigger(),
        ]

    Rls = ReportUnitRls
