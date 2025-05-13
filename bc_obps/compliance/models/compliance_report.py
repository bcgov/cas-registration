from django.db import models
from registration.models.time_stamped_model import TimeStampedModel
from reporting.models.report import Report
from .compliance_period import CompliancePeriod
from .rls_configs.compliance_report import Rls as ComplianceReportRls


class ComplianceReport(TimeStampedModel):
    """Model to store compliance reports"""

    report = models.OneToOneField(
        Report,
        on_delete=models.CASCADE,
        related_name="compliance_report",
        db_comment="The emissions report associated with this compliance report",
    )

    compliance_period = models.ForeignKey(
        CompliancePeriod,
        on_delete=models.PROTECT,
        related_name="compliance_reports",
        db_comment="The compliance period this compliance report is for",
    )

    class Meta(TimeStampedModel.Meta):
        app_label = "compliance"
        db_table_comment = (
            "This table is the parent anchor table of all compliance data for an operation and compliance period"
        )
        db_table = 'erc"."compliance_report'
        constraints = [
            models.UniqueConstraint(
                fields=["report", "compliance_period"],
                name="unique_compliance_report_per_emission_report",
            )
        ]

    Rls = ComplianceReportRls
