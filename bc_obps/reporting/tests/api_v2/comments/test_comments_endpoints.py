from unittest.mock import MagicMock, patch
from uuid import uuid4

import pytest

from registration.tests.utils.helpers import CommonTestSetup, TestUtils


class TestDeleteComment(CommonTestSetup):
    def setup_method(self):
        super().setup_method()
        self.endpoint_under_test = "/api/reporting/v2/comments/123"

    @patch("reporting.api_v2._comments._comment_id.comments.Comment.objects.get")
    def test_non_author_is_not_allowed_to_delete(self, mock_get):
        comment = mock_get.return_value
        comment.created_by_id = uuid4()

        response = TestUtils.mock_delete_with_auth_role(self, "cas_director", self.endpoint_under_test)

        assert response.status_code == 403
        mock_get.assert_called_once_with(id="123")
        comment.delete.assert_not_called()
        comment.comment_thread.delete.assert_not_called()

    @pytest.mark.parametrize("has_comments", [True, False])
    @patch("reporting.api_v2._comments._comment_id.comments.Comment.objects.get")
    def test_author_can_delete_comment(self, mock_get, has_comments):
        comment = MagicMock(created_by_id=self.user.user_guid)
        mock_get.return_value = comment
        thread = comment.comment_thread
        thread.comments.exists.return_value = has_comments

        response = TestUtils.mock_delete_with_auth_role(self, "cas_director", self.endpoint_under_test)

        assert response.status_code == 200
        mock_get.assert_called_once_with(id="123")
        comment.delete.assert_called_once_with()
        thread.refresh_from_db.assert_called_once_with()
        if has_comments:
            thread.delete.assert_not_called()
        else:
            thread.delete.assert_called_once_with()
