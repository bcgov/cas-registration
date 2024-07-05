from django.db import models
from common.models.base_model import BaseModel
from reporting.models.report import Report


class ReportVersion(BaseModel):

    report = models.ForeignKey(
        Report,
        on_delete=models.CASCADE,
    )
    is_latest_submitted = models.BooleanField(
        db_comment="True if this version is the latest submitted one",
    )

    class ReportVersionStatus(models.TextChoices):
        Draft = 'draft'
        Submitted = 'submitted'

    status = models.CharField(
        max_length=1000,
        choices=ReportVersionStatus.choices,
        db_comment="The status for this report version: draft or submitted.",
    )

    class Meta:
        db_table_comment = "A table representing the multiple versions that a single report can have."
        db_table = 'erc"."report_version'
        app_label = 'reporting'
