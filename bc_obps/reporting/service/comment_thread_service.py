from uuid import UUID
from django.db.models import Prefetch, prefetch_related_objects
from reporting.models.comment import Comment
from reporting.models.comment_thread import CommentThread
from reporting.models.report_version import ReportVersion


class CommentThreadService:

    @staticmethod
    def get_threads(report_id: int, user_guid: UUID) -> list[CommentThread]:
        # Adds user_can_edit attribute to each comment based on the user_guid
        # Retrieves all comment threads for a given report ID, including comments ordered by creation
        threads = list(
            CommentThread.objects.select_related(
                "facility"
            )  # prefetches facility to help the API include facility details without extra queries
            .prefetch_related(
                Prefetch("comments", queryset=Comment.objects.select_related("created_by").order_by("created_at"))
            )
            .filter(report_id=report_id)
            .order_by("-created_at")
        )
        for thread in threads:
            for comment in thread.comments.all():
                comment.user_can_edit = comment.created_by_id == user_guid
        return threads

    @staticmethod
    def create_thread(version_id: int, comment: str, facility_id: UUID | None = None) -> CommentThread:
        report_id = ReportVersion.objects.get(id=version_id).report_id
        thread = CommentThread.objects.create(
            report_id=report_id,
            report_version_id=version_id,
            facility_id=facility_id,
        )
        Comment.objects.create(
            comment_thread=thread,
            report_version_id=version_id,
            comment=comment,
        )
        prefetch_related_objects([thread], Prefetch("comments", queryset=Comment.objects.select_related("created_by")))
        for created_comment in thread.comments.all():
            created_comment.user_can_edit = True
        return thread

    @staticmethod
    def resolve_thread(version_id: int, thread_id: int, resolved: bool = True) -> CommentThread:
        thread = CommentThread.objects.get(id=thread_id, report_version_id=version_id)
        thread.resolved = resolved
        thread.save()
        return thread
