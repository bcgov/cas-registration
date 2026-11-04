from uuid import UUID
from django.db.models import Prefetch, QuerySet, F
from django.db.models.lookups import Exact
from reporting.models.comment import Comment
from reporting.models.comment_thread import CommentThread
from reporting.models.report_version import ReportVersion


class CommentThreadService:

    @staticmethod
    def threads_with_annotated_comments(user_guid: UUID) -> QuerySet[CommentThread]:
        """
        Prepares threads for serialization: prefetches each thread's comments (with authors,
        ordered by creation) in a single query, annotating each comment with the user_can_edit
        flag required by CommentSchema. A comment is editable only by the user who created it.
        """
        return CommentThread.objects.prefetch_related(
            Prefetch(
                "comments",
                queryset=Comment.objects.select_related("created_by")
                .annotate(user_can_edit=Exact(F("created_by_id"), user_guid))
                .order_by("created_at"),
            ),
        )

    @staticmethod
    def get_threads(report_id: int, user_guid: UUID) -> list[CommentThread]:
        # Retrieves all comment threads for a given report ID, including comments ordered by creation
        threads = list(
            CommentThreadService.threads_with_annotated_comments(user_guid=user_guid)
            .select_related(
                "facility"
            )  # prefetches facility to help the API include facility details without extra queries
            .filter(report_id=report_id)
            .order_by("-created_at")
        )
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
        return CommentThreadService.threads_with_annotated_comments(user_guid=user_guid).get(
            id=thread.id, report_version_id=version_id
        )

    @staticmethod
    def resolve_thread(version_id: int, thread_id: int, user_guid: UUID, resolved: bool = True) -> CommentThread:
        thread = CommentThreadService.threads_with_annotated_comments(user_guid=user_guid).get(
            id=thread_id, report_version_id=version_id
        )
        thread.resolved = resolved
        thread.save()
        return thread
