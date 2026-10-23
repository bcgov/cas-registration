import datetime
from typing import Annotated, Optional
from uuid import UUID

from ninja import Field, ModelSchema, Schema

from pydantic import StringConstraints
from reporting.models import CommentThread, Comment


class CommentSchema(ModelSchema):
    version_id: int | None = Field(None, alias="report_version_id")
    author: str | None = Field(None, alias="created_by.get_full_name")
    timestamp: datetime.datetime | None = Field(None, alias="created_at")

    class Meta:
        model = Comment
        fields = ["id", "comment"]


class CommentThreadSchema(ModelSchema):
    version_id: int | None = Field(None, alias="report_version_id")
    facility_id: Optional[UUID] = None
    facility_name: str | None = Field(None, alias="facility.name")
    comments: list[CommentSchema]

    class Meta:
        model = CommentThread
        fields = ["id", "resolved"]


class FacilityListItem(Schema):
    facility_id: UUID
    facility_name: str


class CommentThreadsOut(Schema):
    threads: list[CommentThreadSchema]
    facilities: list[FacilityListItem]
    can_create_comment_thread: bool


class CommentThreadIn(Schema):
    """
    Schema for creating a new comment thread, with an initial comment.
    Author and timestamp will be pre-populated by the backend.
    """

    facility_id: Optional[UUID] = None
    comment: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1)]


class ResolveThreadIn(Schema):
    """
    Schema for resolving a comment thread.
    Pass `resolved=False` to unresolve a comment thread. True or nothing will mark it as resolved.
    """

    resolved: bool = True
