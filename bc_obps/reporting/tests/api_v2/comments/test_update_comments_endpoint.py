import pytest
from model_bakery.baker import make_recipe

from common.tests.utils.helpers import assert_error_response
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from reporting.models import Comment


class TestUpdateCommentsV2Endpoint(CommonTestSetup):
    def setup_method(self):
        super().setup_method()
        self.report_version = make_recipe("reporting.tests.utils.report_version")
        self.thread = make_recipe(
            "reporting.tests.utils.comment_thread", report_version_id=self.report_version.id, facility_id=None
        )
        self.comment = make_recipe(
            "reporting.tests.utils.comment", comment_thread_id=self.thread.id, report_version_id=self.report_version.id
        )
        self.endpoint_under_test = f"/api/reporting/v2/report-version/{self.report_version.id}/threads/{self.thread.id}/comments/{self.comment.id}"
        self.payload = {"comment": "This is an updated comment"}
        # Manually set the created_by field so we know who owns the comment
        Comment.objects.filter(id=self.comment.id).update(created_by=self.user)
        self.comment.refresh_from_db()

    @pytest.mark.parametrize("role", ["cas_director", "cas_analyst"])
    def test_update_own_comment(self, role):
        response = TestUtils.mock_patch_with_auth_role(
            self, role, self.content_type, self.payload, self.endpoint_under_test
        )

        assert response.status_code == 200
        self.comment.refresh_from_db()
        assert self.comment.comment == "This is an updated comment"
        data = response.json()
        timestamp = data["comments"][0]["timestamp"]
        assert data == {
            "id": self.thread.id,
            "version_id": self.report_version.id,
            "facility_id": None,
            "facility_name": None,
            "resolved": self.thread.resolved,
            "comments": [
                {
                    "id": self.comment.id,
                    "version_id": self.report_version.id,
                    "author": self.user.get_full_name(),
                    "timestamp": timestamp,
                    "comment": "This is an updated comment",
                    "user_can_edit": True,
                }
            ],
        }

    @pytest.mark.parametrize("role", ["cas_director", "cas_analyst"])
    def test_cannot_update_another_users_comment(self, role):
        other_user = make_recipe("registration.tests.utils.cas_director")
        Comment.objects.filter(id=self.comment.id).update(created_by=other_user)
        original_content = self.comment.comment

        response = TestUtils.mock_patch_with_auth_role(
            self, role, self.content_type, self.payload, self.endpoint_under_test
        )

        assert_error_response(response, 403, "Permission denied.", error_key="permission_denied")
        self.comment.refresh_from_db()
        assert self.comment.comment == original_content

    @pytest.mark.parametrize("role", ["cas_view_only", "cas_admin"])
    def test_unauthorized_role_cannot_update_own_comment(self, role):
        original_content = self.comment.comment

        response = TestUtils.mock_patch_with_auth_role(
            self, role, self.content_type, self.payload, self.endpoint_under_test
        )

        assert response.status_code == 401
        self.comment.refresh_from_db()
        assert self.comment.comment == original_content

    @pytest.mark.parametrize("role", ["cas_director", "cas_analyst"])
    def test_update_nonexistent_comment_returns_not_found(self, role):
        endpoint = f"/api/reporting/v2/report-version/{self.report_version.id}/threads/{self.thread.id}/comments/0"

        response = TestUtils.mock_patch_with_auth_role(self, role, self.content_type, self.payload, endpoint)

        assert_error_response(response, 404, "Not Found")
