from typing import Sequence
from uuid import UUID
from django.db.models import Prefetch, prefetch_related_objects
from reporting.models.comment import Comment
from reporting.models.comment_thread import CommentThread
from reporting.models.report_version import ReportVersion


class CommentThreadService:

    @staticmethod
    def set_comments_user_can_edit(threads: Sequence[CommentThread], user_guid: UUID) -> None:
        """
        Prepares threads for serialization: prefetches each thread's comments (with authors,
        ordered by creation) in a single query and sets the user_can_edit attribute required
        by CommentSchema. Call this on any thread(s) included in an API response.
        """
        prefetch_related_objects(
            threads,
            Prefetch("comments", queryset=Comment.objects.select_related("created_by").order_by("created_at")),
        )
        for thread in threads:
            for comment in thread.comments.all():
                comment.user_can_edit = comment.created_by_id == user_guid

    @staticmethod
    def get_threads(report_id: int, user_guid: UUID) -> list[CommentThread]:
        # Retrieves all comment threads for a given report ID, including comments ordered by creation
        threads = list(
            CommentThread.objects.select_related(
                "facility"
            )  # prefetches facility to help the API include facility details without extra queries
            .filter(report_id=report_id)
            .order_by("-created_at")
        )
        CommentThreadService.set_comments_user_can_edit(threads, user_guid)
        return threads

    @staticmethod
    def create_thread(version_id: int, user_guid: UUID, comment: str, facility_id: UUID | None = None) -> CommentThread:
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
        CommentThreadService.set_comments_user_can_edit([thread], user_guid)
        return thread

    @staticmethod
    def resolve_thread(version_id: int, thread_id: int, user_guid: UUID, resolved: bool = True) -> CommentThread:
        thread = CommentThread.objects.get(id=thread_id, report_version_id=version_id)
        thread.resolved = resolved
        thread.save()
        CommentThreadService.set_comments_user_can_edit([thread], user_guid)
        return thread
