from ninja import ModelSchema
from reporting.models import ReportCommentHeadHonchoOfTheCongaLineBoii, ReportCommentBodyOfTheSnake


class BodyOfTheSnakeSchema(ModelSchema):
    class Meta:
        model = ReportCommentBodyOfTheSnake
        fields = "__all__"


class CommentSchema(ModelSchema):
    """
    Schema for the ReportCommentHeadHonchoOfTheCongaLineBoii model
    """

    report_comments_bodyofthesnake: list[BodyOfTheSnakeSchema] | None

    class Meta:
        model = ReportCommentHeadHonchoOfTheCongaLineBoii
        fields = [
            "id",
            "created_at",
            "updated_at",
            "report_section",
            "title",
            "is_resolved",
            "is_visible_to_industry",
            "created_by",
            "facility",
            "report_version",
        ]
