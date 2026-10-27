from uuid import UUID
from reporting.models.comment import Comment


class CommentService:
    @staticmethod
    def delete_comment(comment_id: str, user_guid: UUID) -> None:
        # Deletes a comment and removes the thread if it becomes empty.
        # Raises PermissionError if the supplied user did not create the comment.
        comment = Comment.objects.get(id=comment_id)
        if comment.created_by_id != user_guid:
            raise PermissionError("User does not have permission to delete this comment.")
        thread = comment.comment_thread
        comment.delete()
        thread.refresh_from_db()
        if not thread.comments.exists():
            thread.delete()
