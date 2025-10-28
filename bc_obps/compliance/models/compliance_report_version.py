from decimal import Decimal
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
        SUPERCEDED = "Superceded"
        REQUIRES_MANUAL_HANDLING = "Requires manual handling"

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
        default=Decimal("0.0000"),
    )

    credited_emissions_delta_from_previous = models.DecimalField(
        db_comment="The delta of the credited emissions reported in the compliance_summary for this version and the previous one",
        decimal_places=4,
        max_digits=20,
        default=Decimal("0.0000"),
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

    previous_version = models.ForeignKey(
        'self',
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="subsequent_versions",
        db_comment="Reference to the previous version of this compliance report version.",
    )

    requires_manual_handling = models.BooleanField(
        default=False,
        db_comment="Boolean value identifies whether this record requires manual handling outside of the app",
    )

    earned_tonnes_creditable = models.DecimalField(
            max_digits=20,
            decimal_places=4,
            default=Decimal("0.0000"),
            db_comment=(
                "Tonnes representing a compliance surplus (over-compliance or credited). Recorded for manual processing."
            ),
        )

    earned_tonnes_refundable = models.DecimalField(
        max_digits=20,
        decimal_places=4,
        default=Decimal("0.0000"),
        db_comment=(
            "Tonnes attributable to a decreased-obligation refund when all related invoices have been fully cleared. Recorded for manual processing."
        ),
    )

    class Meta(TimeStampedModel.Meta):
        app_label = "compliance"
        db_table_comment = "The compliance_report_version table records are generated from the compliance summary data when an emission report is submitted"
        db_table = 'erc"."compliance_report_version'

    Rls = ComplianceReportVersionRls
