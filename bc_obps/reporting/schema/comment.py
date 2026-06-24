from ninja import ModelSchema, Schema
from reporting.models import ReportCommentHeadHonchoOfTheCongaLineBoii, ReportCommentBodyOfTheSnake


class BodyOfTheSnakeSchema(ModelSchema):
    user_name: str | None

    class Meta:
        model = ReportCommentBodyOfTheSnake
        fields = "__all__"

    @staticmethod
    def resolve_name(obj: ReportCommentBodyOfTheSnake) -> str | None:
        if obj.created_by:
            return obj.created_by.get_full_name()
        return None

    @staticmethod
    def resolve_user_name(obj: ReportCommentBodyOfTheSnake) -> str | None:
        if obj.created_by:
            return obj.created_by.get_full_name()
        return None


class CommentSchema(ModelSchema):
    """
    Schema for the ReportCommentHeadHonchoOfTheCongaLineBoii model
    """

    report_comments_bodyofthesnake: list[BodyOfTheSnakeSchema] | None
    user_name: str | None

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

    @staticmethod
    def resolve_user_name(obj: ReportCommentHeadHonchoOfTheCongaLineBoii) -> str | None:
        if obj.created_by:
            return obj.created_by.get_full_name()
        return None


class ReportCommentHeadHonchoInSchema(Schema):
    """
    Schema for creating a new ReportCommentHeadHonchoOfTheCongaLineBoii instance
    """

    report_section: str | None = None
    title: str
    is_visible_to_industry: bool = False


class BodyOfTheSnakeInSchema(Schema):
    """
    Schema for creating a new ReportCommentBodyOfTheSnake instance
    """

    comment: str
