from django.db import models
from registration.models.time_stamped_model import TimeStampedModel
from simple_history.models import HistoricalRecords
from .compliance_summary import ComplianceSummary


class ComplianceObligation(TimeStampedModel):
    """Model to store compliance obligations"""

    class ObligationStatus(models.TextChoices):
        PENDING = "PENDING", "Pending"
        FULFILLED = "FULFILLED", "Fulfilled"
        PARTIALLY_FULFILLED = "PARTIALLY_FULFILLED", "Partially Fulfilled"

    class PenaltyStatus(models.TextChoices):
        PENDING = "PENDING", "Pending"
        PAID = "PAID", "Paid"
        OVERDUE = "OVERDUE", "Overdue"

    compliance_summary = models.OneToOneField(
        ComplianceSummary,
        on_delete=models.PROTECT,
        related_name="obligation",
        db_comment="The compliance summary this obligation belongs to",
    )
    amount = models.DecimalField(max_digits=20, decimal_places=4, db_comment="The amount of the obligation")
    status = models.CharField(
        max_length=50,
        choices=ObligationStatus.choices,
        default=ObligationStatus.PENDING,
        db_comment="The status of the obligation (e.g., PENDING, FULFILLED, PARTIALLY_FULFILLED)",
    )
    penalty_status = models.CharField(
        max_length=50,
        choices=PenaltyStatus.choices,
        default=PenaltyStatus.PENDING,
        db_comment="The status of the penalty (e.g., PENDING, PAID, OVERDUE)",
    )

    history = HistoricalRecords(
        table_name='erc_history"."compliance_obligation_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta(TimeStampedModel.Meta):
        db_table_comment = "A table to store compliance obligations"
        db_table = 'erc"."compliance_obligation'
