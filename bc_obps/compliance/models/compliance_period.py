from django.db import models
from registration.models.time_stamped_model import TimeStampedModel
from simple_history.models import HistoricalRecords
from reporting.models.reporting_year import ReportingYear
from compliance.enums import ComplianceTableNames
from rls.enums import RlsRoles, RlsOperations
from rls.utils.helpers import generate_rls_grants


class CompliancePeriod(TimeStampedModel):
    """
    Model to store compliance periods

    According to BC Greenhouse Gas Emission Reporting Regulation (249/2015),
    compliance periods typically align with calendar years, with specific
    deadlines for compliance submissions.

    Note: Compliance periods are seeded through migrations rather than created
    dynamically in code. This allows business areas to control special cases
    as the program evolves year after year without encoding logic in the code.
    See compliance/fixtures/README.md for more information.
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

    class Rls:
        role_grants_mapping = {
            # All users can view compliance periods
            RlsRoles.INDUSTRY_USER: [RlsOperations.SELECT],
            # CAS staff can manage compliance periods
            RlsRoles.CAS_DIRECTOR: [
                RlsOperations.SELECT,
                RlsOperations.INSERT,
                RlsOperations.UPDATE,
                RlsOperations.DELETE,
            ],
            RlsRoles.CAS_ADMIN: [
                RlsOperations.SELECT,
                RlsOperations.INSERT,
                RlsOperations.UPDATE,
            ],
            RlsRoles.CAS_ANALYST: [RlsOperations.SELECT],
            RlsRoles.CAS_VIEW_ONLY: [RlsOperations.SELECT],
        }
        grants = generate_rls_grants(role_grants_mapping, ComplianceTableNames.COMPLIANCE_PERIOD)

    class Meta(TimeStampedModel.Meta):
        db_table_comment = "A table to store compliance periods"
        db_table = 'erc"."compliance_period'
        ordering = ['-end_date']
