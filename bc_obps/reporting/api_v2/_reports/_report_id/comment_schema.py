from uuid import UUID

from ninja import ModelSchema, Schema
from reporting.models import CommentThread, Comment


class CommentSchema(ModelSchema):
    user_name: str | None = None

    class Meta:
        model = Comment
        fields = "__all__"

    @staticmethod
    def resolve_user_name(obj: Comment) -> str | None:
        if obj.created_by:
            return obj.created_by.get_full_name()
        return None


class CommentThreadSchema(ModelSchema):
    """
    Schema for the ReportCommentThread model
    """

    comments: list[CommentSchema]
    user_name: str | None = None
    facility_name: str | None = None

    class Meta:
        model = CommentThread
        fields = "__all__"

    @staticmethod
    def resolve_user_name(obj: CommentThread) -> str | None:
        if obj.created_by:
            return obj.created_by.get_full_name()
        return None

    @staticmethod
    def resolve_facility_name(obj: CommentThread) -> str | None:
        if obj.facility:
            return obj.facility.name
        return None


class CommentThreadsOut(Schema):
    threads: list[CommentThreadSchema]


class CommentThreadIn(Schema):
    """
    Schema for creating a new comment thread, with an initial comment.
    Author and timestamp will be pre-populated by the backend.
    """

    facility_id: UUID
    comment: str
