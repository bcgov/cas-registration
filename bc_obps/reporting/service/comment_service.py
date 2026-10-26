from uuid import UUID
from django.db.models import Prefetch
from reporting.models.comment import Comment
from reporting.models.comment_thread import CommentThread
from reporting.models.report_version import ReportVersion


class CommentService:
    @staticmethod
    def delete_comment(comment_id: int, user_guid: UUID):
        # Deletes a comment and removes the thread if it becomes empty.
        # Raises PermissionError if the supplied user did not create the comment.
        comment = Comment.objects.get(id=comment_id)
        if comment.created_by.guid != user_guid:
            raise PermissionError("User does not have permission to delete this comment.")
        thread = comment.comment_thread
        comment.delete()
        thread.refresh_from_db()
        if not thread.comments.exists():
            thread.delete()
