import datetime
from typing import Optional
from uuid import UUID

from ninja import ModelSchema, Schema

from reporting.models import CommentThread, Comment


class CommentSchema(ModelSchema):
    version_id: int | None = None
    author: str | None = None
    timestamp: datetime.datetime | None = None

    class Meta:
        model = Comment
        fields = ["id", "comment"]

    @staticmethod
    def resolve_version_id(obj: Comment) -> int | None:
        return obj.report_version_id

    @staticmethod
    def resolve_author(obj: Comment) -> str | None:
        if obj.created_by:
            return obj.created_by.get_full_name()
        return None

    @staticmethod
    def resolve_timestamp(obj: Comment) -> datetime.datetime | None:
        return obj.created_at


class CommentThreadSchema(ModelSchema):
    """
    Schema for the ReportCommentThread model
    """

    version_id: int | None = None
    facility_id: Optional[UUID] = None
    comments: list[CommentSchema]
    facility_name: str | None = None

    class Meta:
        model = CommentThread
        fields = ["id"]

    @staticmethod
    def resolve_version_id(obj: CommentThread) -> int | None:
        return obj.report_version_id

    @staticmethod
    def resolve_facility_name(obj: CommentThread) -> str | None:
        if obj.facility:
            return obj.facility.name
        return None


class FacilityListItem(Schema):
    facility_id: UUID
    facility_name: str


class CommentThreadsOut(Schema):
    threads: list[CommentThreadSchema]
    facilities: list[FacilityListItem]


class CommentThreadIn(Schema):
    """
    Schema for creating a new comment thread, with an initial comment.
    Author and timestamp will be pre-populated by the backend.
    """

    facility_id: Optional[UUID] = None
    comment: str
