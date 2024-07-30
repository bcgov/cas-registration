from django.db import models
from reporting.models.report_data_base_model import ReportDataBaseModel
from reporting.models.report_source_type import ReportSourceType


class ReportUnit(ReportDataBaseModel):

    report_source_type = models.ForeignKey(
        ReportSourceType,
        on_delete=models.CASCADE,
        related_name="%(class)s_records",
        db_comment="The source type data this unit data belongs to",
    )

    class Meta:
        db_table_comment = "A table to store the reported activity-specific data, in a JSON format"
        db_table = 'erc"."report_unit'
        app_label = 'reporting'
