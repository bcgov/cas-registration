from uuid import UUID

from ninja import ModelSchema, Schema
from reporting.models import CommentThread, Comment


class CommentSchema(ModelSchema):
    author: str | None = None

    class Meta:
        model = Comment
        fields = "__all__"

    @staticmethod
    def resolve_author(obj: Comment) -> str | None:
        if obj.created_by:
            return obj.created_by.get_full_name()
        return None


class CommentThreadSchema(ModelSchema):
    """
    Schema for the ReportCommentThread model
    """

    comments: list[CommentSchema]
    facility_name: str | None = None
    author: str | None = None

    class Meta:
        model = CommentThread
        fields = "__all__"

    @staticmethod
    def resolve_author(obj: CommentThread) -> str | None:
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
