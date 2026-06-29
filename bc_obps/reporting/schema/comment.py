from uuid import UUID
from typing import List
from ninja import ModelSchema, Schema
from reporting.models import ReportCommentThread, ReportComment


class CommentSchema(ModelSchema):
    user_name: str | None

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

    report_comments: list[CommentSchema] | None
    user_name: str | None
    facility_name: str | None

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
    threads: List[ThreadSchema] | None
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


class ReportCommentResolveSchema(Schema):
    """
    Schema for resolving a ReportCommentThread instance
    """

    is_resolved: bool = True
