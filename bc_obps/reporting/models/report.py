from django.db import models
from common.models.base_model import BaseModel
from registration.models.operation import Operation
from reporting.models.report_operation import ReportOperation
from reporting.models.reporting_year import ReportingYear


class Report(BaseModel):
    """
    Report model for storing OBPS reports
    """

    # This will need to be updated
    operation = models.ForeignKey(
        Operation, on_delete=models.DO_NOTHING, db_comment="The operation to which this report belongs", null=True
    )

    reporting_year = models.ForeignKey(
        ReportingYear,
        on_delete=models.DO_NOTHING,
        blank=False,
        null=False,
        db_comment="The reporting year, for which this report is filled",
    )

    # A report can only be for one single operation
    report_operation = models.OneToOneField(
        ReportOperation, on_delete=models.CASCADE, db_comment="The report this operation information relates to"
    )

    class Meta:
        db_table_comment = "A table to store reports"
        db_table = 'erc"."report'
        app_label = 'reporting'
