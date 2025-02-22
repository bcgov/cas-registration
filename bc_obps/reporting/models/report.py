from django.db import models
from registration.models.operation import Operation
from registration.models.operator import Operator
from registration.models.time_stamped_model import TimeStampedModel
from reporting.models.reporting_year import ReportingYear
from reporting.models.rls_configs.report import Rls as ReportRls


class Report(TimeStampedModel):
    """
    Report model for storing OBPS reports
    """

    # This is needed in case the operation changes hands and doesn't belong to the operator.
    # The report still belongs to the operator which filed it.
    operator = models.ForeignKey(
        Operator, on_delete=models.PROTECT, db_comment="The operator to which this report belongs"
    )

    operation = models.ForeignKey(
        Operation, on_delete=models.PROTECT, db_comment="The operation for which this report was filed"
    )

    reporting_year = models.ForeignKey(
        ReportingYear,
        on_delete=models.PROTECT,
        blank=False,
        null=False,
        db_comment="The reporting year, for which this report is filled",
    )

    class Meta(TimeStampedModel.Meta):
        db_table_comment = "A table to store report instances. Each operation has at most one report per year."
        db_table = 'erc"."report'
        app_label = 'reporting'
        constraints = [
            models.UniqueConstraint(name="unique_report_per_reporting_year", fields=['operation', 'reporting_year'])
        ]

    Rls = ReportRls
