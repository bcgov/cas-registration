from django.db import models
from reporting.models.report_compliance_summary import ReportComplianceSummary
from registration.models.time_stamped_model import TimeStampedModel
from compliance.models.compliance_report import ComplianceReport
from .rls_configs.compliance_report_version import Rls as ComplianceReportVersionRls


class ComplianceReportVersion(TimeStampedModel):
    """Model to store compliance report version data"""

    class ComplianceStatus(models.TextChoices):
        OBLIGATION_NOT_MET = "Obligation not met"
        OBLIGATION_FULLY_MET = "Obligation fully met"
        OBLIGATION_PENDING_INVOICE_CREATION = "Obligation pending invoice creation"
        EARNED_CREDITS = "Earned credits"
        NO_OBLIGATION_OR_EARNED_CREDITS = "No obligation or earned credits"

    compliance_report = models.ForeignKey(
        ComplianceReport,
        on_delete=models.CASCADE,
        related_name="compliance_report_versions",
        db_comment="The parent compliance report object that this compliance report version belongs to",
    )

    report_compliance_summary = models.OneToOneField(
        ReportComplianceSummary,
        on_delete=models.CASCADE,
        related_name="compliance_report_version",
        db_comment="The compliance summary data from the reporting module that this compliance report version relates to",
    )

    excess_emissions_delta_from_previous = models.DecimalField(
        db_comment="The delta of the excess emissions reported in the compliance_summary for this version and the previous one",
        decimal_places=4,
        max_digits=20,
        default=0.0000,
    )

    credited_emissions_delta_from_previous = models.DecimalField(
        db_comment="The delta of the credited emissions reported in the compliance_summary for this version and the previous one",
        decimal_places=4,
        max_digits=20,
        default=0.0000,
    )

    status = models.CharField(
        max_length=100,
        choices=ComplianceStatus.choices,
        db_comment="The status of this compliance report version. Options: [Obligation not met, Obligation fully met, Earned credits, No obligation or earned credits]",
    )

    is_supplementary = models.BooleanField(
        default=False,
        db_comment="Boolean value identifies whether this record is the result of a supplementary emissions report version",
    )

    class Meta(TimeStampedModel.Meta):
        app_label = "compliance"
        db_table_comment = "The compliance_report_version table records are generated from the compliance summary data when an emission report is submitted"
        db_table = 'erc"."compliance_report_version'

    Rls = ComplianceReportVersionRls
