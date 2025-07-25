from django.db import models
from registration.models.time_stamped_model import TimeStampedModel
from reporting.models.reporting_year import ReportingYear
from .rls_configs.compliance_penalty_rate import Rls as CompliancePenaltyRateRls


class CompliancePenaltyRate(TimeStampedModel):
    """
    Model to store compliance Penalty rates by reporting year.
    These rates are used to calculate the penalty accrual when obligations are not paid on time.
    """

    compliance_period = models.OneToOneField(
        ReportingYear,
        on_delete=models.PROTECT,
        related_name='compliance_Penalty_rate',
        db_comment="The associated compliance_period for this compliance penalty rate",
    )
    rate = models.DecimalField(
        max_digits=6,
        decimal_places=6,
        db_comment="The compliance Penalty rate applied daily if an obligation is not paid on time",
    )

    penalty_amount = models.DecimalField(
        decimal_places=2,
        max_digits=20,
        default=0.00,
        db_comment="The total amount of the penalty to be paid",
    )

    class Meta(TimeStampedModel.Meta):
        app_label = "compliance"
        db_table_comment = "A table to store compliance penalty rates by reporting year"
        db_table = 'erc"."compliance_penalty_rate'
        ordering = ['compliance_period']

    Rls = CompliancePenaltyRateRls
