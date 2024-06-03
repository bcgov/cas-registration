from django.db import models
from registration.models import BaseModel, ReportingActivity
from reporting.models import Report


class ReportOperation(BaseModel):
    class OperationType(models.TextChoices):
        SFO = "sfo"
        LFO = "lfo"

    # A report can only be for one single operation
    report = models.OneToOneField(
        Report, on_delete=models.CASCADE, db_comment="The report this operation information relates to"
    )

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
    operation_bcghg_id = models.CharField(
        max_length=1000, db_comment="The BCGHGH ID of the operation", blank=True, null=True
    )
    bc_obps_regulated_operation_id = models.CharField(
        max_length=255, db_comment="The BC OBPS Regulated Operation ID (BORO ID) for this operation"
    )
    operation_representative_name = models.CharField(
        max_length=1000, db_comment="The full name of the operation representative"
    )

    reporting_activities = models.ManyToManyField(ReportingActivity)

    class Meta:
        db_table_comment = "A table to store operation information as part of a report"
        db_table = 'erc"."report_operation'
        app_label = 'reporting'
