from django.db import models
from registration.models.time_stamped_model import TimeStampedModel
from compliance.models import CompliancePenalty
from .rls_configs.compliance_penalty_accrual import Rls as CompliancePenaltyAccrualRls


class CompliancePenaltyAccrual(TimeStampedModel):
    """Model to store the auditable daily accrual records for how a penalty was calculated"""

    compliance_penalty = models.ForeignKey(
        CompliancePenalty,
        on_delete=models.CASCADE,
        related_name="compliance_penalty_accruals",
        db_comment="The penalty record that this daily accrual record relates to",
    )

    date = models.DateField(
        db_comment="The date of accrual for this record",
    )

    accrual_start_date = models.DateField(
        db_comment="The date on which the penalty began accruing. It will always be the day after the obligation's due date",
    )

    daily_penalty = models.DecimalField(
        decimal_places=2,
        max_digits=20,
        db_comment="The penalty amount for this date calculated from the rate in the compliance_penalty_rate table",
    )

    daily_compounded = models.DecimalField(
        decimal_places=2,
        max_digits=20,
        db_comment="The amount of the penalty compounded for this date",
    )

    accumulated_penalty = models.DecimalField(
        decimal_places=2,
        max_digits=20,
        db_comment="The accumulated amount of base penalty charges up to this date",
    )

    accumulated_compounded = models.DecimalField(
        decimal_places=2,
        max_digits=20,
        db_comment="The accumulated amount of compounded penalty up to this date",
    )

    class Meta(TimeStampedModel.Meta):
        app_label = "compliance"
        db_table_comment = "This table contains the daily record of how a penalty was accrued"
        db_table = 'erc"."compliance_penalty_accrual'

    Rls = CompliancePenaltyAccrualRls
