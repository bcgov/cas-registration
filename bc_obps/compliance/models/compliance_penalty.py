from django.db import models
from decimal import Decimal
from registration.models.time_stamped_model import TimeStampedModel
from compliance.models import ComplianceObligation, ElicensingInvoice
from .rls_configs.compliance_penalty import Rls as CompliancePenaltyRls


class CompliancePenalty(TimeStampedModel):
    class PenaltyType(models.TextChoices):
        AUTOMATIC_OVERDUE = 'Automatic Overdue'
        LATE_SUBMISSION = 'Late Submission'

    class Frequency(models.TextChoices):
        DAILY = 'Daily'
        MONTHLY = 'Monthly'

    class Status(models.TextChoices):
        NOT_PAID = 'NOT PAID', 'Not Paid'
        PAID = 'PAID', 'Paid'

    compliance_obligation = models.ForeignKey(
        ComplianceObligation,
        on_delete=models.CASCADE,
        related_name="compliance_penalties",
        db_comment="The compliance obligation not paid on time which triggered this penalty",
    )

    elicensing_invoice = models.OneToOneField(
        ElicensingInvoice,
        on_delete=models.PROTECT,
        related_name="compliance_penalty",
        db_comment="The invoice from elicensing that this penalty created",
        null=True,
        blank=True,
    )

    fee_date = models.DateField(null=True, blank=True, db_comment="The date the fee was created")

    accrual_start_date = models.DateField(
        db_comment="The date on which the penalty began accruing. It will always be the day after the obligation's due date",
    )

    accrual_final_date = models.DateField(
        null=True,
        blank=True,
        db_comment="The date on which the penalty stopped accruing (typically the payment date or when obligation is paid to $0)",
    )

    accrual_frequency = models.CharField(
        max_length=20,
        choices=Frequency.choices,
        default=Frequency.DAILY,
        db_comment="Defines how often the penalty accrues (e.g., daily for Automatic Overdue, daily for Late Submission)",
    )

    compounding_frequency = models.CharField(
        max_length=20,
        choices=Frequency.choices,
        default=Frequency.DAILY,
        db_comment="Defines how often interest is compounded for this penalty (e.g., daily or monthly).",
    )

    penalty_amount = models.DecimalField(
        decimal_places=2,
        max_digits=20,
        default=Decimal("0.00"),
        db_comment="The total amount of the penalty to be paid",
    )

    penalty_type = models.CharField(
        max_length=100,
        choices=PenaltyType.choices,
        db_comment="The type of penalty.",
    )

    status = models.CharField(
        max_length=50,
        choices=Status.choices,
        default=Status.NOT_PAID,
        db_comment="The status of this penalty (e.g., NOT PAID, PAID)",
    )

    class Meta(TimeStampedModel.Meta):
        app_label = "compliance"
        db_table_comment = (
            "This table contains compliance penalty data for obligations that were not met before their due date"
        )
        db_table = 'erc"."compliance_penalty'

    Rls = CompliancePenaltyRls
