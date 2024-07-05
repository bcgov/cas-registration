from django.db import models
from common.models.base_model import BaseModel
from registration.models.operation import Operation
from registration.models.operator import Operator
from reporting.models.reporting_year import ReportingYear


class Report(BaseModel):
    """
    Report model for storing OBPS reports
    """

    # This is needed in case the operation changes hands and doesn't belong to the operator.
    # The report still belongs to the operator which filed it.
    operator = models.ForeignKey(
        Operator, on_delete=models.DO_NOTHING, db_comment="The operator to which this report belongs"
    )

    operation = models.ForeignKey(
        Operation, on_delete=models.DO_NOTHING, db_comment="The operation for which this report was filed"
    )

    reporting_year = models.ForeignKey(
        ReportingYear,
        on_delete=models.DO_NOTHING,
        blank=False,
        null=False,
        db_comment="The reporting year, for which this report is filled",
    )

    class Meta:
        db_table_comment = "A table to store report instances. Each operation has at most one report per year."
        db_table = 'erc"."report'
        app_label = 'reporting'
