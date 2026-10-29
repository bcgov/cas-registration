import pytest
from model_bakery.baker import make_recipe

from common.tests.utils.helpers import assert_error_response
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from reporting.models import Comment, CommentThread


class TestCommentsV2Endpoints(CommonTestSetup):
    def setup_method(self):
        super().setup_method()
        self.report_version = make_recipe("reporting.tests.utils.report_version")
        self.thread = make_recipe("reporting.tests.utils.comment_thread", report_version_id=self.report_version.id)
        self.comment = make_recipe(
            "reporting.tests.utils.comment", comment_thread_id=self.thread.id, report_version_id=self.report_version.id
        )
        self.report_version_id = self.report_version.id
        self.endpoint_under_test = (
            f"/api/reporting/v2/report-version/{self.report_version_id}/comments/{self.comment.id}"
        )
        # Manually set the created_by field so we know who owns the comment
        Comment.objects.filter(id=self.comment.id).update(created_by=self.user)
        self.comment.refresh_from_db()

    @pytest.mark.parametrize("role", ["cas_director", "cas_analyst"])
    def test_delete_last_comment_removes_thread(self, role):
        response = TestUtils.mock_delete_with_auth_role(self, role, self.endpoint_under_test)

        assert response.status_code == 200
        assert response.json() == 200
        assert not Comment.objects.filter(id=self.comment.id).exists()
        assert not CommentThread.objects.filter(id=self.thread.id).exists()

    @pytest.mark.parametrize("role", ["cas_director", "cas_analyst"])
    def test_delete_preserves_thread_and_remaining_comments(self, role):
        another_comment = make_recipe(
            "reporting.tests.utils.comment", comment_thread_id=self.thread.id, report_version_id=self.report_version.id
        )

        response = TestUtils.mock_delete_with_auth_role(self, role, self.endpoint_under_test)

        assert response.status_code == 200
        assert response.json() == 200
        assert not Comment.objects.filter(id=self.comment.id).exists()
        assert CommentThread.objects.filter(id=self.thread.id).exists()
        assert list(Comment.objects.filter(comment_thread_id=self.thread.id).values_list("id", flat=True)) == [
            another_comment.id
        ]

    @pytest.mark.parametrize("role", ["cas_director", "cas_analyst"])
    def test_cannot_delete_another_users_comment(self, role):
        other_user = make_recipe("registration.tests.utils.cas_director")
        Comment.objects.filter(id=self.comment.id).update(created_by=other_user)

        response = TestUtils.mock_delete_with_auth_role(self, role, self.endpoint_under_test)

        assert_error_response(response, 403, "Permission denied.", error_key="permission_denied")
        assert Comment.objects.filter(id=self.comment.id, created_by=other_user).exists()
        assert CommentThread.objects.filter(id=self.thread.id).exists()

    @pytest.mark.parametrize("role", ["cas_view_only", "cas_admin"])
    def test_unauthorized_role_cannot_delete_own_comment(self, role):
        response = TestUtils.mock_delete_with_auth_role(self, role, self.endpoint_under_test)

        assert response.status_code == 401
        assert Comment.objects.filter(id=self.comment.id).exists()
        assert CommentThread.objects.filter(id=self.thread.id).exists()

    @pytest.mark.parametrize("role", ["cas_director", "cas_analyst"])
    def test_delete_nonexistent_comment_returns_not_found(self, role):
        response = TestUtils.mock_delete_with_auth_role(self, role, "/api/reporting/v2/report-version/1/comments/0")

        assert_error_response(response, 404, "Not Found")
        assert Comment.objects.filter(id=self.comment.id).exists()
        assert CommentThread.objects.filter(id=self.thread.id).exists()
