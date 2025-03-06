from django.db import models
from registration.models.time_stamped_model import TimeStampedModel
from simple_history.models import HistoricalRecords
from reporting.models.reporting_year import ReportingYear
from .rls_configs.compliance_period import Rls as CompliancePeriodRls


class CompliancePeriod(TimeStampedModel):
    """
    Model to store compliance periods

    According to BC Greenhouse Gas Emission Reporting Regulation (249/2015),
    compliance periods typically align with calendar years, with specific
    deadlines for compliance submissions.

    Note: Compliance periods are seeded through migrations rather than created
    dynamically in code. This allows business areas to control special cases
    as the program evolves year after year without encoding logic in the code.
    See docs/compliance/fixtures/README.md for more information.
    """

    start_date = models.DateField(blank=False, null=False, db_comment="Start date of the compliance period, UTC-based")
    end_date = models.DateField(blank=False, null=False, db_comment="End date of the compliance period, UTC-based")
    compliance_deadline = models.DateField(
        blank=False, null=False, db_comment="Deadline date for compliance submissions, UTC-based"
    )

    reporting_year = models.ForeignKey(
        ReportingYear,
        on_delete=models.PROTECT,
        related_name='compliance_period',
        db_comment="The associated reporting year for this compliance period",
    )

    history = HistoricalRecords(
        table_name='erc_history"."compliance_period_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta(TimeStampedModel.Meta):
        db_table_comment = "A table to store compliance periods"
        db_table = 'erc"."compliance_period'
        ordering = ['-end_date']

    Rls = CompliancePeriodRls
