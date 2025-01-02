from django.db import models
from registration.models.time_stamped_model import TimeStampedModel
from reporting.models.report import Report


class ReportVersion(TimeStampedModel):

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
        default="Annual Report",
    )

    class ReportVersionStatus(models.TextChoices):
        Draft = 'Draft'
        Submitted = 'Submitted'

    status = models.CharField(
        max_length=1000,
        choices=ReportVersionStatus.choices,
        db_comment="The status for this report version: Draft or Submitted.",
        default=ReportVersionStatus.Draft,
    )

    class Meta:
        db_table_comment = "A table representing the multiple versions that a single report can have."
        db_table = 'erc"."report_version'
        app_label = 'reporting'
