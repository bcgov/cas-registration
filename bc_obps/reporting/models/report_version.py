from django.db import models
import pgtrigger
from registration.models.time_stamped_model import TimeStampedModel
from reporting.models.report import Report
from reporting.models.rls_configs.report_version import Rls as ReportVersionRls


class ReportVersion(TimeStampedModel):
    class ReportType(models.TextChoices):
        ANNUAL_REPORT = "Annual Report"
        SIMPLE_REPORT = "Simple Report"

    report = models.ForeignKey(
        Report,
        on_delete=models.CASCADE,
        db_comment="The report to which this version applied.",
        related_name="report_versions",
    )
    is_latest_submitted = models.BooleanField(
        db_comment="True if this version is the latest submitted one",
        default=False,
    )
    report_type = models.CharField(
        max_length=1000,
        db_comment="Report type",
        default=ReportType.ANNUAL_REPORT,
        choices=ReportType.choices,
    )

    class ReportVersionStatus(models.TextChoices):
        Draft = "Draft"
        Submitted = "Submitted"

    status = models.CharField(
        max_length=1000,
        choices=ReportVersionStatus.choices,
        db_comment="The status for this report version: Draft or Submitted.",
        default=ReportVersionStatus.Draft,
    )

    class Meta(TimeStampedModel.Meta):
        db_table_comment = "A table representing the multiple versions that a single report can have."
        db_table = 'erc"."report_version'
        app_label = "reporting"
        constraints = [
            models.UniqueConstraint(
                fields=["report"],
                condition=models.Q(status="Draft"),
                name="unique_report_version_with_draft_status_per_report",
                violation_error_message="Only one draft report version can exist on a report.",
            )
        ]
        triggers = [
            *TimeStampedModel.Meta.triggers,
            # Protect a submitted report version from any update
            # except when the only change is to set `is_latest_submitted` from True to False
            pgtrigger.Protect(
                name="immutable_report_version",  # Keep original name for compatibility
                operation=pgtrigger.Update,
                condition=pgtrigger.Q(old__status="Submitted")
                & ~pgtrigger.Q(new__is_latest_submitted=False, old__is_latest_submitted=True, new__status="Submitted"),
            ),
        ]

    Rls = ReportVersionRls
