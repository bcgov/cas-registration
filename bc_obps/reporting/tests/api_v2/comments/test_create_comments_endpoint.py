from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from model_bakery.baker import make_recipe
from reporting.models.comment import Comment
import re


class TestCreateCommentsV2Endpoints(CommonTestSetup):
    def setup_method(self):
        super().setup_method()
        self.report_version = make_recipe("reporting.tests.utils.report_version")
        self.thread = make_recipe(
            "reporting.tests.utils.comment_thread", report_version_id=self.report_version.id, facility_id=None
        )
        self.endpoint_under_test = (
            f"/api/reporting/v2/report-version/{self.report_version.id}/threads/{self.thread.id}/comments"
        )

    def test_create_comment(self):
        payload = {"comment": "This is a test comment"}
        response = TestUtils.mock_post_with_auth_role(
            self, "cas_director", self.content_type, payload, self.endpoint_under_test
        )
        assert response.status_code == 201
        comment = Comment.objects.all().first()
        data = response.json()
        assert data == {
            'version_id': self.report_version.id,
            'facility_id': None,
            'facility_name': None,
            'comments': [
                {
                    'version_id': self.report_version.id,
                    'author': 'Testy McTesterson',
                    'timestamp': re.sub(r'\d{3}\+00:00$', 'Z', comment.created_at.isoformat()),
                    'user_can_edit': True,
                    'id': comment.id,
                    'comment': 'This is a test comment',
                }
            ],
            'id': self.thread.id,
            'resolved': False,
        }
