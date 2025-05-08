from django.db import models
from registration.models.time_stamped_model import TimeStampedModel
from reporting.models.report_version import ReportVersion
from reporting.models.triggers import immutable_report_version_trigger
from reporting.models.rls_configs.report_change import Rls as ReportChangeRls


class ReportChange(TimeStampedModel):
    """
    A model storing the report change information for a supplementary report.
    """

    report_version = models.ForeignKey(
        ReportVersion,
        on_delete=models.CASCADE,
        related_name="report_change",
        db_comment="The supplementary report this change information relates to",
    )

    reason_for_change = models.TextField(
        blank=False,
        db_comment="Reason explaining why this supplementary report change was made",
    )

    class Meta(TimeStampedModel.Meta):
        db_table = 'erc"."report_change'
        app_label = "reporting"
        db_table_comment = "Table containing report change information for the supplementary report version"
        constraints = [
            # Check that only one report change row is present per report version
            models.UniqueConstraint(
                name="unique_supplementary_report_change_per_report_version",
                fields=["report_version"],
            ),
        ]
        triggers = [
            *TimeStampedModel.Meta.triggers,
            immutable_report_version_trigger(),
        ]

    Rls = ReportChangeRls
