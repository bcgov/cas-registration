from django.db import models
from common.models.base_model import BaseModel
from reporting.models.rls_configs.reporting_year import Rls as ReportingYearRls


class ReportingYear(BaseModel):
    """Base Model for the reporting year"""

    reporting_year = models.IntegerField(
        primary_key=True, editable=False, db_comment="Year for the reporting year, unique and serves as primary key"
    )
    reporting_window_start = models.DateTimeField(
        blank=False, null=False, db_comment="Start of the reporting period for that reporting year, UTC-based"
    )
    reporting_window_end = models.DateTimeField(
        blank=False, null=False, db_comment="End of the reporting period for that reporting year, UTC-based"
    )
    report_due_date = models.DateTimeField(
        blank=False, null=False, db_comment="Due date for the annual report for that reporting year, UTC-based"
    )

    description = models.CharField(max_length=10000, db_comment="Description for the reporting year")

    class Meta:
        db_table_comment = "Reporting year"
        db_table = 'erc"."reporting_year'

    Rls = ReportingYearRls
