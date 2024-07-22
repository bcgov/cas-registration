from django.db import models
from reporting.models.report_data_base_model import ReportDataBaseModel
from reporting.models.report_emission import ReportEmission


class ReportMethodology(ReportDataBaseModel):

    report_emission = models.OneToOneField(
        ReportEmission,
        on_delete=models.CASCADE,
        related_name="report_methodology",
        db_comment="The emission data this methodology applies to",
    )

    class Meta:
        db_table_comment = "A table to store the reported activity-specific data, in a JSON format"
        db_table = 'erc"."report_methodology'
        app_label = 'reporting'
