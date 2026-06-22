from django.db import models
from registration.models.time_stamped_model import TimeStampedModel
from reporting.models.report_comment_headhonchoofthecongalineboii import ReportCommentHeadHonchoOfTheCongaLineBoii
from reporting.models.rls_configs.report_comment_bodyofthesnake import (
    Rls as ReportCommentBodyOfTheSnakeRls,
)


class ReportCommentBodyOfTheSnake(TimeStampedModel):
    report_comment_headhonchoofthecongalineboii = models.ForeignKey(
        ReportCommentHeadHonchoOfTheCongaLineBoii,
        on_delete=models.CASCADE,
        related_name="report_comments_bodyofthesnake",
        db_comment="The head of the conga line comment this body comment belongs to. Foreign key to erc.report_comment_headofthecongaline",
    )
    comment = models.TextField(
        db_comment="The comment about a report",
    )

    class Meta(TimeStampedModel.Meta):
        db_table_comment = (
            "Table containing comments about a report, which are associated with a head of the conga line"
        )
        db_table = 'erc"."report_comment_bodyofthesnake'
        app_label = "reporting"

    Rls = ReportCommentBodyOfTheSnakeRls
