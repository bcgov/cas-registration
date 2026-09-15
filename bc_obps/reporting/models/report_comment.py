from django.db import models
from registration.models.time_stamped_model import TimeStampedModel
from reporting.models.report_comment_thread import ReportCommentThread
from reporting.models.rls_configs.report_comment import (
    Rls as ReportCommentRls,
)


class ReportComment(TimeStampedModel):
    report_comment_thread = models.ForeignKey(
        ReportCommentThread,
        on_delete=models.CASCADE,
        related_name="report_comments",
        db_comment="The comment thread this comment belongs to. Foreign key to erc.report_comment_thread",
    )
    report_version_id = models.IntegerField(
        null=True,
        blank=True,
        db_comment="The report version this comment belongs to. Not a foreign key because the report version may be deleted or submitted, but we still want to keep the comment.",
    )
    comment = models.TextField(
        db_comment="The comment about a report",
    )

    class Meta(TimeStampedModel.Meta):
        db_table_comment = "Table containing comments about a report, which are associated with a comment thread"
        db_table = 'erc"."report_comment'
        app_label = "reporting"

    Rls = ReportCommentRls
