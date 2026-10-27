from django.test import TestCase
from model_bakery.baker import make_recipe
from reporting.models.comment import Comment
from reporting.models.comment_thread import CommentThread
from reporting.service.comment_service import CommentService


class TestCommentService(TestCase):
    def setUp(self):
        self.thread = make_recipe('reporting.tests.utils.comment_thread')
        self.comment = make_recipe('reporting.tests.utils.comment', comment_thread=self.thread)
        self.comment.refresh_from_db()
        self.user_guid = self.comment.created_by_id

    def test_delete_comment(self):
        self.assertTrue(Comment.objects.filter(id=self.comment.id).exists())
        CommentService.delete_comment(self.comment.id, self.user_guid)
        self.assertFalse(Comment.objects.filter(id=self.comment.id).exists())

    def test_delete_comment_removes_thread_if_empty(self):
        self.assertTrue(CommentThread.objects.filter(id=self.thread.id).exists())
        CommentService.delete_comment(self.comment.id, self.user_guid)
        self.assertFalse(CommentThread.objects.filter(id=self.thread.id).exists())

    def test_delete_comment_does_not_remove_thread_if_not_empty(self):
        another_comment = make_recipe('reporting.tests.utils.comment', comment_thread=self.thread)
        CommentService.delete_comment(self.comment.id, self.user_guid)
        self.assertTrue(CommentThread.objects.filter(id=self.thread.id).exists())
        self.assertTrue(Comment.objects.filter(id=another_comment.id).exists())

    def test_delete_comment_raises_permission_error_for_wrong_user(self):
        with self.assertRaises(PermissionError):
            CommentService.delete_comment(self.comment.id, '00000000-0000-0000-0000-000000000000')
