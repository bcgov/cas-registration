from django.db import models
from registration.models.time_stamped_model import TimeStampedModel
from compliance.models import ElicensingLineItem
from compliance.models.compliance_report_version import ComplianceReportVersion
from .rls_configs.elicensing_adjustment import Rls as ElicensingAdjustmentRls


class ElicensingAdjustment(TimeStampedModel):
    """
    Adjustment data synced with elicensing.
    """

    adjustment_object_id = models.IntegerField(
        db_comment="The object id of the adjustment in elicensing (adjustmentObjectId)"
    )

    elicensing_line_item = models.ForeignKey(
        ElicensingLineItem,
        on_delete=models.CASCADE,
        db_comment="Foreign key to the line item record this adjustment relates to",
        related_name="elicensing_adjustments",
    )

    supplementary_compliance_report_version = models.ForeignKey(
        ComplianceReportVersion,
        on_delete=models.CASCADE,
        db_comment="Foreign key to the supplementary compliance report version that triggered this adjustment. When a supplementary report reduces excess emissions, an adjustment is created and applied to the existing invoice from the original compliance report version, but this field tracks which supplementary version caused the adjustment.",
        related_name="elicensing_adjustments",
        null=True,
        blank=True,
    )

    amount = models.DecimalField(
        decimal_places=2,
        max_digits=20,
        db_comment="The amount of this adjustment in dollars from elicensing",
    )

    adjustment_date = models.DateTimeField(db_comment="date of the adjustment in elicensing", null=True, blank=True)

    reason = models.CharField(db_comment="Reason for adjustment in elicesning", null=True, blank=True)

    type = models.CharField(db_comment="Type of adjustment in elicesning", null=True, blank=True)

    comment = models.CharField(db_comment="Comments on adjustment in elicesning", null=True, blank=True)

    class Meta(TimeStampedModel.Meta):
        app_label = "compliance"
        db_table_comment = "Table contains adjustment data from elicensing"
        db_table = 'erc"."elicensing_adjustment'

    Rls = ElicensingAdjustmentRls
