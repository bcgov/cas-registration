from common.models import BaseModel
from django.db import models
from registration.models.operation import Operation
from reporting.models.reporting_year import ReportingYear


class Report(BaseModel):
    """
    Report model for storing OBPS reports
    """

    title = models.CharField(max_length=100, db_comment="The title of the report")
    description = models.TextField(db_comment="The description of the report")
    created_at = models.DateTimeField(auto_now_add=True, db_comment="The timestamp when the report was created")

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

    class Meta:
        db_table_comment = "A table to store reports"
        db_table = 'erc"."report'
        app_label = 'reporting'

    def __str__(self) -> str:
        return self.title
