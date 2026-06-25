from datetime import datetime

from ninja import ModelSchema, Schema
from reporting.models import ReportCommentThread, ReportComment


class CommentSchema(ModelSchema):
    user_name: str | None = None
    report_comment_thread_id: int | None = None

    class Meta:
        model = ReportComment
        fields = "__all__"

    @staticmethod
    def resolve_user_name(obj: ReportComment) -> str | None:
        if obj.created_by:
            return obj.created_by.get_full_name()
        return None

    @staticmethod
    def resolve_report_comment_thread_id(obj: ReportComment) -> int | None:
        return obj.report_comment_thread_id


class ThreadSchema(ModelSchema):
    """
    Schema for the ReportCommentThread model
    """

    report_comments: list[CommentSchema]
    report_id: int
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
    def resolve_report_id(obj: ReportCommentThread) -> int | None:
        return obj.report_id

    @staticmethod
    def resolve_facility_name(obj: ReportCommentThread) -> str | None:
        if obj.facility:
            return obj.facility.name
        return None


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
