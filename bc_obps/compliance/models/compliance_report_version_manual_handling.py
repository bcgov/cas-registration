from django.db import models
from registration.models.time_stamped_model import TimeStampedModel
from compliance.models.compliance_report_version import ComplianceReportVersion

from compliance.models.rls_configs.compliance_report_version_manual_handling import Rls as ComplianceReportVersionManualHandlingRls

class ComplianceReportVersionManualHandling(TimeStampedModel):
    """Tracks manual handling resolution for a compliance report version."""

    class DirectorDecision(models.TextChoices):
        PENDING_MANUAL_HANDLING = "pending_manual_handling", "Pending manual handling"
        ISSUE_RESOLVED = "issue_resolved", "Issue has been resolved"

    compliance_report_version = models.OneToOneField(
        ComplianceReportVersion,
        on_delete=models.CASCADE,
        related_name="manual_handling_record",
        db_comment="The CRV that requires manual handling.",
    )

    analyst_comment = models.TextField(
        blank=True,
        null=True,
        db_comment="Optional comment entered by the analyst."
    )

    director_comment = models.TextField(
        blank=True,
        null=True,
        db_comment="Optional comment entered by the director."
    )

    director_decision = models.CharField(
        max_length=50,
        choices=DirectorDecision.choices,
        default=DirectorDecision.PENDING_MANUAL_HANDLING,
        db_comment="Director's decision about the manual handling case.",
    )

    class Meta(TimeStampedModel.Meta):
        app_label = "compliance"
        db_table = 'erc"."compliance_report_version_manual_handling'
        db_table_comment = "Tracks analyst and director manual handling resolution for compliance report versions"

    Rls = ComplianceReportVersionManualHandlingRls

