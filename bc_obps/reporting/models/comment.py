from django.db import models
from registration.models.time_stamped_model import TimeStampedModel
from reporting.models.comment_thread import CommentThread
from reporting.models.rls_configs.comment import (
    Rls as CommentRls,
)


class Comment(TimeStampedModel):
    comment_thread = models.ForeignKey(
        CommentThread,
        on_delete=models.CASCADE,
        related_name="comments",
        db_comment="The thread this comment belongs to. Foreign key to erc.comment_thread",
    )
    report_version = models.ForeignKey(
        "reporting.ReportVersion",
        on_delete=models.SET_NULL,  # Do not delete the comment if the report version is deleted
        null=True,
        blank=True,
        related_name="comments",
        db_comment="The report version this comment is related to. Foreign key to erc.report_version",
    )
    comment = models.TextField(
        db_comment="The comment about a report",
    )

    class Meta(TimeStampedModel.Meta):
        db_table_comment = "Table containing comments about a report, which are associated with a thread"
        db_table = 'erc"."comment'
        app_label = "reporting"

    Rls = CommentRls
