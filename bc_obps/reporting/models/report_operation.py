from common.models import BaseModel
from django.db import models
from registration.models import ReportingActivity


class ReportOperation(BaseModel):
    """
    Report model to store operation information
    """

    class OperationType(models.TextChoices):
        SFO = "sfo"
        LFO = "lfo"

    operator_legal_name = models.CharField(
        max_length=1000, db_comment="The legal name of the operator operating this operation"
    )
    operator_trade_name = models.CharField(
        max_length=1000, db_comment="The trade name of the operator operating this operation"
    )
    operation_name = models.CharField(max_length=1000, db_comment="The name of the operation, for which this report is")
    operation_type = models.CharField(
        max_length=1000, choices=OperationType.choices, db_comment="The type of the operation, LFO or SFO"
    )
    operation_bcghgid = models.CharField(
        max_length=1000, db_comment="The BCGHGH ID of the operation", blank=True, null=True
    )
    bc_obps_regulated_operation_id = models.CharField(
        max_length=255, db_comment="The BC OBPS Regulated Operation ID (BORO ID) for this operation"
    )
    operation_representative_name = models.CharField(
        max_length=1000, db_comment="The full name of the operation representative"
    )

    # We don't create a backwards relation since this is a registration model
    activities = models.ManyToManyField(ReportingActivity, related_name="+")

    class Meta:
        db_table_comment = "A table to store operation information as part of a report"
        db_table = 'erc"."report_operation'
        app_label = 'reporting'
