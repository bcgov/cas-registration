from django.db import connection
from django.test import TestCase
from model_bakery.baker import make_recipe
from reporting.models.comment import Comment
from reporting.models.comment_thread import CommentThread
from reporting.service.comment_service import CommentService


class TestCommentService(TestCase):
    def setUp(self):
        self.user = make_recipe('registration.tests.utils.cas_director')
        with connection.cursor() as cursor:  # set guid for polpulating the audit fields
            cursor.execute("select set_config('my.guid', %s, true)", [str(self.user.user_guid)])
        self.thread = make_recipe('reporting.tests.utils.comment_thread')
        self.comment = make_recipe('reporting.tests.utils.comment', comment_thread=self.thread)

    def test_delete_comment(self):
        self.assertTrue(Comment.objects.filter(id=self.comment.id).exists())
        CommentService.delete_comment(self.thread.id, self.comment, self.user.user_guid)
        self.assertFalse(Comment.objects.filter(id=self.comment.id).exists())

    def test_delete_comment_removes_thread_if_empty(self):
        self.assertTrue(CommentThread.objects.filter(id=self.thread.id).exists())
        CommentService.delete_comment(self.thread.id, self.comment, self.user.user_guid)
        self.assertFalse(CommentThread.objects.filter(id=self.thread.id).exists())

    def test_delete_comment_does_not_remove_thread_if_not_empty(self):
        another_comment = make_recipe('reporting.tests.utils.comment', comment_thread=self.thread)
        CommentService.delete_comment(self.thread.id, self.comment, self.user.user_guid)
        self.assertTrue(CommentThread.objects.filter(id=self.thread.id).exists())
        self.assertTrue(Comment.objects.filter(id=another_comment.id).exists())

    def test_delete_comment_raises_permission_error_for_wrong_user(self):
        with self.assertRaises(PermissionError):
            CommentService.delete_comment(self.thread.id, self.comment, '00000000-0000-0000-0000-000000000000')

    def test_create_comment_creates_comment_on_thread(self):
        self.assertEqual(Comment.objects.filter(comment_thread_id=self.thread.id).count(), 1)
        CommentService.create_comment(
            report_version_id=self.thread.report_version_id,
            comment_thread_id=self.thread.id,
            content='New comment',
        )
        self.assertEqual(Comment.objects.filter(comment_thread_id=self.thread.id).count(), 2)
        # .get() acting as `assertExists` for the new comment
        Comment.objects.get(comment_thread_id=self.thread.id, comment='New comment')

    def test_update_comment_updates_comment_content(self):
        updated_content = 'Updated comment'
        CommentService.update_comment(
            comment=self.comment,
            content=updated_content,
        )
        self.comment.refresh_from_db()
        self.assertEqual(self.comment.comment, updated_content)

    def test_check_comment_owner_raises_permission_error_for_wrong_user(self):
        with self.assertRaises(PermissionError):
            CommentService.check_comment_owner(self.comment.id, '00000000-0000-0000-0000-000000000000')
