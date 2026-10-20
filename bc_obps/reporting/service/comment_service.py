from uuid import UUID
from reporting.models.comment import Comment
from reporting.models.comment_thread import CommentThread
from reporting.models.report_version import ReportVersion


class CommentService:

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
        return thread
