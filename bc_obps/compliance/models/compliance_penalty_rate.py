from django.db import models
from registration.models.time_stamped_model import TimeStampedModel
from compliance.models import CompliancePeriod
from .rls_configs.compliance_penalty_rate import Rls as CompliancePenaltyRateRls


class CompliancePenaltyRate(TimeStampedModel):
    """
    Model to store compliance Penalty rates by reporting year.
    These rates are used to calculate the penalty accrual when obligations are not paid on time.
    """

    compliance_period = models.OneToOneField(
        CompliancePeriod,
        on_delete=models.PROTECT,
        related_name='compliance_Penalty_rate',
        db_comment="The associated compliance_period for this compliance penalty rate",
    )
    rate = models.DecimalField(
        max_digits=6,
        decimal_places=6,
        db_comment="The compliance Penalty rate applied daily if an obligation is not paid on time",
    )

    is_current_rate = models.BooleanField(
        default=False,
        db_comment="Boolean field signifies whether or not this rate is the rate currently in use",
    )

    class Meta(TimeStampedModel.Meta):
        app_label = "compliance"
        db_table_comment = "A table to store compliance penalty rates by reporting year"
        db_table = 'erc"."compliance_penalty_rate'
        ordering = ['compliance_period']

    Rls = CompliancePenaltyRateRls
