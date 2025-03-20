from django.db import models
from registration.models.time_stamped_model import TimeStampedModel
from simple_history.models import HistoricalRecords
from .compliance_summary import ComplianceSummary
from .rls_configs.compliance_obligation import Rls as ComplianceObligationRls


class ComplianceObligation(TimeStampedModel):
    """
    Model to store compliance obligations

    According to BC Greenhouse Gas Emission Reporting Regulation (249/2015) section 19(1)(b),
    operators with excess emissions must submit a compliance report for excess emissions
    by November 30 of the calendar year following the compliance period.
    """

    class ObligationStatus(models.TextChoices):
        OBLIGATION_NOT_MET = "OBLIGATION_NOT_MET", "Obligation Not Met"
        OBLIGATION_MET = "OBLIGATION_MET", "Obligation Met"

    class PenaltyStatus(models.TextChoices):
        NONE = "NONE", "None"
        ACCRUING = "ACCRUING", "Accruing"
        PAID = "PAID", "Paid"

    compliance_summary = models.OneToOneField(
        ComplianceSummary,
        on_delete=models.PROTECT,
        related_name="obligation",
        db_comment="The compliance summary this obligation belongs to",
    )
    emissions_amount_tco2e = models.DecimalField(
        max_digits=20, decimal_places=4, db_comment="The amount of excess emissions in tCO2e"
    )
    status = models.CharField(
        max_length=50,
        choices=ObligationStatus.choices,
        default=ObligationStatus.OBLIGATION_NOT_MET,
        db_comment="The status of the obligation (e.g., OBLIGATION_NOT_MET, OBLIGATION_MET)",
    )
    penalty_status = models.CharField(
        max_length=50,
        choices=PenaltyStatus.choices,
        default=PenaltyStatus.NONE,
        db_comment="The status of the penalty (e.g., NONE, ACCRUING, PAID)",
    )
    obligation_id = models.CharField(
        max_length=30,
        null=True,
        blank=True,
        db_comment="A human-readable identifier for the obligation in format YY-OOOO-R-V",
    )
    obligation_deadline = models.DateField(
        blank=False,
        null=False,
        db_comment="Deadline date for meeting excess emissions obligations (November 30 of the following year), UTC-based",
    )

    history = HistoricalRecords(
        table_name='erc_history"."compliance_obligation_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta(TimeStampedModel.Meta):
        db_table_comment = "A table to store compliance obligations"
        db_table = 'erc"."compliance_obligation'

    Rls = ComplianceObligationRls
