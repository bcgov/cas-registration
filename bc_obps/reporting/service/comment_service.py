from uuid import UUID
from reporting.models.comment import Comment
from reporting.models.comment_thread import CommentThread
from reporting.service.comment_thread_service import CommentThreadService


class CommentService:
    @staticmethod
    def delete_comment(thread_id: int, comment_id: int, user_guid: UUID) -> CommentThread | None:
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

    @staticmethod
    def create_comment(report_version_id: int, comment_thread_id: int, content: str) -> Comment:
        comment = Comment.objects.create(
            comment_thread_id=comment_thread_id,
            report_version_id=report_version_id,
            comment=content,
        )
        return comment

    @staticmethod
    def update_comment(comment: Comment, content: str) -> Comment:
        comment.comment = content
        comment.save()
        return comment

    @staticmethod
    def check_comment_owner(comment_id: int, user_guid: UUID) -> Comment:
        comment = Comment.objects.get(id=comment_id)
        if comment.created_by_id != user_guid:
            raise PermissionError("User does not have permission to modify this comment.")
        return comment
