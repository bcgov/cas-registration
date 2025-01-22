from django.db import models
from registration.models import Activity, RegulatedProduct
from registration.models.time_stamped_model import TimeStampedModel
from reporting.models.report_version import ReportVersion


class ReportOperation(TimeStampedModel):
    """
    Report model to store operation information
    """

    # A report version can only have one single record of operation information
    report_version = models.OneToOneField(
        ReportVersion,
        on_delete=models.CASCADE,
        related_name="report_operation",
        db_comment="The report this operation information relates to",
    )

    operator_legal_name = models.CharField(
        max_length=1000,
        db_comment="The legal name of the operator operating this operation",
    )
    operator_trade_name = models.CharField(
        max_length=1000,
        db_comment="The trade name of the operator operating this operation",
        blank=True,
        null=True,
    )
    operation_name = models.CharField(
        max_length=1000,
        db_comment="The name of the operation, for which this report is",
    )
    operation_type = models.CharField(
        max_length=1000,
        db_comment="The type of the operation, LFO or SFO",
    )
    operation_bcghgid = models.CharField(
        max_length=1000,
        db_comment="The BCGHGH ID of the operation",
        blank=True,
        null=True,
    )
    bc_obps_regulated_operation_id = models.CharField(
        max_length=255,
        db_comment="The BC OBPS Regulated Operation ID (BORO ID) for this operation",
        blank=True,
        null=True,
    )

    # We don't create a backwards relation since this is a registration model
    activities = models.ManyToManyField(Activity, related_name="+")
    regulated_products = models.ManyToManyField(RegulatedProduct, related_name="+")

    class Meta:
        db_table_comment = "A table to store operation information as part of a report"
        db_table = 'erc"."report_operation'
        app_label = "reporting"
