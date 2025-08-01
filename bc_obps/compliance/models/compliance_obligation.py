from django.db import models
from registration.models.time_stamped_model import TimeStampedModel
from simple_history.models import HistoricalRecords
from compliance.models.compliance_report_version import ComplianceReportVersion
from .rls_configs.compliance_obligation import Rls as ComplianceObligationRls
from compliance.models.elicensing_invoice import ElicensingInvoice


class ComplianceObligation(TimeStampedModel):
    """
    Model to store compliance obligations

    According to BC Greenhouse Gas Emission Reporting Regulation (249/2015) section 19(1)(b),
    operators with excess emissions must submit a compliance report for excess emissions
    by November 30 of the calendar year following the compliance period.
    """

    class PenaltyStatus(models.TextChoices):
        NONE = "NONE", "None"
        ACCRUING = "ACCRUING", "Accruing"
        PAID = "PAID", "Paid"
        NOT_PAID = "NOT PAID", "Not Paid"

    compliance_report_version = models.OneToOneField(
        ComplianceReportVersion,
        on_delete=models.CASCADE,
        related_name="obligation",
        db_comment="The compliance report version this obligation belongs to",
    )

    elicensing_invoice = models.OneToOneField(
        ElicensingInvoice,
        on_delete=models.PROTECT,
        related_name="compliance_obligation",
        db_comment="Foreign key to the elicensing_invoice in the OBPS data. The data in the elicensing_invoice table comes from elicensing",
        null=True,
        blank=True,
    )

    obligation_id = models.CharField(
        max_length=30,
        db_comment="A human-readable identifier for the obligation in format YY-OOOO-R-V",
    )

    obligation_deadline = models.DateField(
        blank=False,
        null=False,
        db_comment="Deadline date for meeting excess emissions obligations (November 30 of the following year), UTC-based",
    )

    fee_amount_dollars = models.DecimalField(
        max_digits=20,
        decimal_places=2,
        null=True,
        blank=True,
        db_comment="The fee amount in CAD dollars",
    )

    fee_date = models.DateField(null=True, blank=True, db_comment="The date the fee was created")

    penalty_status = models.CharField(
        max_length=50,
        choices=PenaltyStatus.choices,
        default=PenaltyStatus.NONE,
        db_comment="The status of the penalty (e.g., NONE, ACCRUING, PAID)",
    )

    history = HistoricalRecords(
        table_name='erc_history"."compliance_obligation_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta(TimeStampedModel.Meta):
        app_label = "compliance"
        db_table_comment = "A table to store compliance obligations"
        db_table = 'erc"."compliance_obligation'

    Rls = ComplianceObligationRls
