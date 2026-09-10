from django.db import models
from django.db.models import ForeignKey
from registration.models.facility import Facility
from registration.models.time_stamped_model import TimeStampedModel
from reporting.models.rls_configs.comment_thread import (
    Rls as ThreadRls,
)


class CommentThread(TimeStampedModel):
    report = ForeignKey(
        "reporting.Report",
        on_delete=models.CASCADE,
        related_name="comment_threads",
        db_comment="The report this thread belongs to. Foreign key to erc.report",
    )
    report_version = ForeignKey(
        "reporting.ReportVersion",
        on_delete=models.SET_NULL,  # Do not delete the thread if the report version is deleted
        null=True,
        blank=True,
        related_name="comment_threads",
        db_comment="The report version this thread was started at. Foreign key to erc.report_version",
    )
    facility = ForeignKey(
        Facility,
        on_delete=models.SET_NULL,  # Do not delete the thread if the facility is deleted
        null=True,
        blank=True,
        related_name="comment_threads",
        db_comment="The facility this thread is optionally associated with. Foreign key to registration.facility",
    )

    class Meta(TimeStampedModel.Meta):
        db_table_comment = "Table containing comment threads about a report"
        db_table = 'erc"."comment_thread'
        app_label = "reporting"

    Rls = ThreadRls
