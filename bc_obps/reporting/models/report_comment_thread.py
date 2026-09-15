from django.db import models
from django.db.models import ForeignKey
from registration.models.facility import Facility
from registration.models.time_stamped_model import TimeStampedModel
from reporting.models.rls_configs.report_comment_thread import (
    Rls as ReportCommentThreadRls,
)


class ReportCommentThread(TimeStampedModel):
    report = ForeignKey(
        "reporting.Report",
        on_delete=models.CASCADE,
        related_name="report_comment_threads",
        db_comment="The report this comment belongs to. Foreign key to erc.report",
    )
    report_version_id = models.IntegerField(
        null=True,
        blank=True,
        db_comment="The report version this comment belongs to. Not a foreign key because the report version may be deleted or submitted, but we still want to keep the comment thread.",
    )
    report_section = models.TextField(
        null=True,
        blank=True,
        db_comment="The section of the page this comment thread is associated with.",
    )
    title = models.TextField(
        db_comment="The title of the comment thread. This is used to differentiate the comments at a glance.",
    )
    facility = ForeignKey(
        Facility,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="report_comment_threads",
        db_comment="The facility this comment thread is associated with, if applicable. Foreign key to registration.facility",
    )
    is_resolved = models.BooleanField(
        default=False,
        db_comment="Whether this comment thread has been resolved. A thread is considered resolved when the issue it raises has been addressed and no further action is needed.",
    )
    is_visible_to_industry = models.BooleanField(
        default=False,
        db_comment="Whether this comment thread is visible to industry users. This allows for threads to be saved by government users that are not yet ready to be shared with industry.",
    )

    class Meta(TimeStampedModel.Meta):
        db_table_comment = "Table containing comment threads about a report"
        db_table = 'erc"."report_comment_thread'
        app_label = "reporting"

    Rls = ReportCommentThreadRls
