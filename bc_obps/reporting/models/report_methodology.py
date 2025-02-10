from django.db import models
from reporting.models.report_data_base_model import ReportDataBaseModel
from reporting.models.report_emission import ReportEmission
from reporting.models.methodology import Methodology
from reporting.models.triggers import immutable_report_version_trigger


class ReportMethodology(ReportDataBaseModel):
    methodology = models.ForeignKey(
        Methodology,
        on_delete=models.PROTECT,
        related_name="%(class)s_records",
        db_comment="The methodology this data applies to",
    )

    report_emission = models.OneToOneField(
        ReportEmission,
        on_delete=models.CASCADE,
        related_name="report_methodology",
        db_comment="The emission data this methodology applies to",
    )

    class Meta(ReportDataBaseModel.Meta):
        db_table_comment = "A table to store the reported methodology-specific data, in a JSON format"
        db_table = 'erc"."report_methodology'
        app_label = "reporting"
        triggers = [
            *ReportDataBaseModel.Meta.triggers,
            immutable_report_version_trigger(),
        ]
