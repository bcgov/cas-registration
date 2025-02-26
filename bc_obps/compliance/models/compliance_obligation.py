from django.db import models
from registration.models.time_stamped_model import TimeStampedModel
from simple_history.models import HistoricalRecords
from .compliance_summary import ComplianceSummary


class ComplianceObligation(TimeStampedModel):
    """Model to store compliance obligations"""

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
    emissions_amount_tco2e = models.DecimalField(max_digits=20, decimal_places=4, db_comment="The amount of excess emissions in tCO2e")
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

    history = HistoricalRecords(
        table_name='erc_history"."compliance_obligation_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta(TimeStampedModel.Meta):
        db_table_comment = "A table to store compliance obligations"
        db_table = 'erc"."compliance_obligation'
