from django.db import models
from django.db.models import ForeignKey
from registration.models.facility import Facility
from registration.models.time_stamped_model import TimeStampedModel
from reporting.models.report_version import ReportVersion
from reporting.models.rls_configs.report_comment_headhonchoofthecongalineboii import (
    Rls as ReportCommentHeadHonchoOfTheCongaLineBoiiRls,
)


class ReportCommentHeadHonchoOfTheCongaLineBoii(TimeStampedModel):
    report_version = ForeignKey(
        ReportVersion,
        on_delete=models.CASCADE,
        related_name="report_comments_head_of_the_conga_line",
        db_comment="The report version this comment belongs to. Foreign key to erc.report_version",
    )
    page_slug = models.TextField(
        null=True,
        blank=True,
        db_comment="The slug of the page this comment is associated with. This is used to display the comment on the correct page in the UI.",
    )
    facility = ForeignKey(
        Facility,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="report_comments_head_of_the_conga_line",
        db_comment="The facility this comment is associated with, if applicable. Foreign key to registration.facility",
    )
    is_resolved = models.BooleanField(
        default=False,
        db_comment="Whether this comment has been resolved. A comment is considered resolved when the issue it raises has been addressed and no further action is needed.",
    )
    is_visible_to_industry = models.BooleanField(
        default=False,
        db_comment="Whether this comment is visible to industry users. This allows for comments to be saved by government users that are not yet ready to be shared with industry.",
    )

    class Meta(TimeStampedModel.Meta):
        db_table_comment = "Table containing comments from the head of the conga line about a report version"
        db_table = 'erc"."report_comment_headhonchoofthecongalineboii'
        app_label = "reporting"

    Rls = ReportCommentHeadHonchoOfTheCongaLineBoiiRls
