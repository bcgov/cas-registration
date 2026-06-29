from datetime import datetime

from uuid import UUID
from typing import List
from ninja import ModelSchema, Schema
from reporting.models import ReportCommentThread, ReportComment


class CommentSchema(ModelSchema):
    user_name: str | None = None

    class Meta:
        model = ReportComment
        fields = "__all__"

    @staticmethod
    def resolve_user_name(obj: ReportComment) -> str | None:
        if obj.created_by:
            return obj.created_by.get_full_name()
        return None


class ThreadSchema(ModelSchema):
    """
    Schema for the ReportCommentThread model
    """

    report_comments: list[CommentSchema]
    user_name: str | None = None
    facility_name: str | None = None

    class Meta:
        model = ReportCommentThread
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
            "report_version_id",
            "report",
        ]

    @staticmethod
    def resolve_user_name(obj: ReportCommentThread) -> str | None:
        if obj.created_by:
            return obj.created_by.get_full_name()
        return None

    @staticmethod
    def resolve_facility_name(obj: ReportCommentThread) -> str | None:
        if obj.facility:
            return obj.facility.name
        return None


class ThreadSchemaOut(Schema):
    threads: List[ThreadWithEventsOutSchema] | None
    user_guid: UUID | None


class ReportCommentThreadInSchema(Schema):
    """
    Schema for creating a new ReportCommentThread instance
    """

    report_section: str | None = None
    title: str
    is_visible_to_industry: bool = False


class ReportCommentInSchema(Schema):
    """
    Schema for creating a new ReportComment instance
    """

    comment: str


class ReportCommentEventSchema(Schema):
    """
    Schema for the ReportCommentEvent model
    """

    report_version_id: int
    comment: str
    created_at: datetime
    event_type: str | None = None


class ThreadWithEventsSchema(ThreadSchema):
    report_events: list[ReportCommentEventSchema] = []


class CommentOutSchema(Schema):
    id: int
    comment: str
    created_at: datetime
    report_version_id: int | None = None
    created_by: str | None = None
    user_name: str | None = None


class ThreadWithEventsOutSchema(Schema):
    id: int
    created_at: datetime
    updated_at: datetime | None = None
    report_section: str | None = None
    title: str
    is_resolved: bool
    is_visible_to_industry: bool
    created_by: str | None = None
    report_version_id: int | None = None
    user_name: str | None = None
    facility_name: str | None = None
    report_comments: list[CommentOutSchema]
    report_events: list[ReportCommentEventSchema] = []


class ReportCommentResolveSchema(Schema):
    """
    Schema for resolving a ReportCommentThread instance
    """

    is_resolved: bool = True
