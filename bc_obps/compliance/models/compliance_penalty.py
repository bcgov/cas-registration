from django.db import models
from registration.models.time_stamped_model import TimeStampedModel
from compliance.models import ComplianceObligation, ElicensingInvoice
from .rls_configs.compliance_penalty import Rls as CompliancePenaltyRls


class CompliancePenalty(TimeStampedModel):
    """Model to store compliance penalty data"""

    compliance_obligation = models.OneToOneField(
        ComplianceObligation,
        on_delete=models.CASCADE,
        related_name="compliance_penalty",
        db_comment="The compliance obligation not paid on time which triggered this penalty",
    )

    elicensing_invoice = models.OneToOneField(
        ElicensingInvoice,
        on_delete=models.PROTECT,
        related_name="compliance_penalty",
        db_comment="The invoice from elicensing that this penalty created",
    )

    accrual_start_date = models.DateField(
        db_comment="The date on which the penalty began accruing. It will always be the day after the obligation's due date",
    )

    penalty_amount = models.DecimalField(
        decimal_places=2,
        max_digits=20,
        default=0.00,
        db_comment="The total amount of the penalty to be paid",
    )

    class Meta(TimeStampedModel.Meta):
        app_label = "compliance"
        db_table_comment = (
            "This table contains compliance penalty data for obligations that were not met before their due date"
        )
        db_table = 'erc"."compliance_penalty'

    Rls = CompliancePenaltyRls
