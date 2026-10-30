from uuid import UUID
from reporting.models.comment import Comment
from reporting.models.comment_thread import CommentThread
from reporting.service.comment_thread_service import CommentThreadService


class CommentService:
    @staticmethod
    def delete_comment(version_id: int, thread_id: int, comment_id: int, user_guid: UUID) -> CommentThread | None:
        # Deletes a comment and removes the thread if it becomes empty.
        # Raises PermissionError if the supplied user did not create the comment.
        comment = Comment.objects.get(id=comment_id, comment_thread_id=thread_id)
        if comment.created_by_id != user_guid:
            raise PermissionError("User does not have permission to delete this comment.")
        comment.delete()
        thread = CommentThreadService.threads_with_annotated_comments(user_guid=user_guid).get(id=thread_id)
        if not Comment.objects.filter(comment_thread_id=thread_id).exists():
            thread.delete()
            return None
        return thread
