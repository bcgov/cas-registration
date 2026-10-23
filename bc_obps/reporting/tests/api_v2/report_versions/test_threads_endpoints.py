from model_bakery.baker import make_recipe
from ninja.responses import NinjaJSONEncoder
import pytest
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from reporting.models import CommentThread


class TestThreadsV2Endpoints(CommonTestSetup):
    def setup_method(self):
        operation = make_recipe("registration.tests.utils.operation")
        self.facility = make_recipe("registration.tests.utils.facility", operation=operation, name="Test Facility")
        self.report = make_recipe("reporting.tests.utils.report", operation=operation, operator=operation.operator)
        self.report_version = make_recipe("reporting.tests.utils.report_version", report=self.report)
        self.endpoint_under_test = f"/api/reporting/v2/report-version/{self.report_version.id}/threads"
        return super().setup_method()

    def test_get_returns_correct_data_when_empty(self):
        response = TestUtils.mock_get_with_auth_role(self, "cas_director", self.endpoint_under_test)
        assert response.status_code == 200
        assert response.json() == {'payload': {'threads': [], 'facilities': [], 'can_create_comment_thread': True}}

    def test_get_returns_correct_data_with_data(self):
        # facility in the response is based on timeline entries
        make_recipe(
            "registration.tests.utils.facility_designated_operation_timeline",
            facility=self.facility,
            operation=self.facility.operation,
            end_date=None,
        )
        thread = make_recipe(
            "reporting.tests.utils.comment_thread",
            report=self.report,
            report_version=self.report_version,
        )
        comment = make_recipe(
            "reporting.tests.utils.comment",
            comment_thread=thread,
            report_version=self.report_version,
            comment="Test comment",
        )
        # have to do this call to access the values (created_by) in the audit fields
        thread.refresh_from_db()
        comment.refresh_from_db()

        response = TestUtils.mock_get_with_auth_role(self, "cas_director", self.endpoint_under_test)
        assert response.status_code == 200

        threads = response.json()['payload']['threads']
        assert len(threads) == 1

        response_thread = threads[0]
        assert response_thread['id'] == thread.id
        assert response_thread['version_id'] == self.report_version.id
        assert response_thread['facility_id'] == str(thread.facility_id)

        response_comments = response_thread['comments']
        assert len(response_comments) == 1
        assert response_comments[0]['id'] == comment.id
        assert response_comments[0]['comment'] == comment.comment
        assert response_comments[0]['author'] == comment.created_by.get_full_name()
        assert response_comments[0]['version_id'] == self.report_version.id

    def test_can_create_comment_thread_flag_is_role_dependent(self):
        response = TestUtils.mock_get_with_auth_role(self, "cas_director", self.endpoint_under_test)
        assert response.status_code == 200
        assert response.json()['payload']['can_create_comment_thread'] is True

        response = TestUtils.mock_get_with_auth_role(self, "cas_view_only", self.endpoint_under_test)
        assert response.status_code == 200
        assert response.json()['payload']['can_create_comment_thread'] is False

    def test_post_creates_thread_and_comment(self):
        assert CommentThread.objects.filter(report=self.report).count() == 0

        response = TestUtils.mock_post_with_auth_role(
            self,
            "cas_director",
            self.content_type,
            {"comment": "Test comment", "facility_id": str(self.facility.id)},
            self.endpoint_under_test,
        )

        assert response.status_code == 201
        threads = CommentThread.objects.filter(report=self.report).all()

        thread = threads[0]
        comment = thread.comments.all()[0]

        assert threads.count() == 1
        assert thread.comments.count() == 1

        assert response.json() == {
            "version_id": self.report_version.id,
            "facility_id": str(self.facility.id),
            "comments": [
                {
                    "version_id": self.report_version.id,
                    "author": comment.created_by.get_full_name(),
                    "timestamp": NinjaJSONEncoder().default(comment.created_at),
                    "id": comment.id,
                    "comment": comment.comment,
                }
            ],
            "facility_name": "Test Facility",
            "id": thread.id,
        }

    @pytest.mark.parametrize("resolved", [True, False])
    def test_patch_resolves_thread(self, resolved):
        thread = make_recipe(
            "reporting.tests.utils.comment_thread",
            report=self.report,
            report_version=self.report_version,
            facility=self.facility,
        )
        endpoint = f"{self.endpoint_under_test}/{thread.id}/resolve"

        response = TestUtils.mock_patch_with_auth_role(
            self,
            "cas_director",
            self.content_type,
            {"resolved": resolved},
            endpoint,
        )

        assert response.status_code == 200
        assert response.json()["id"] == thread.id
        assert response.json()["resolved"] is resolved

        thread.refresh_from_db()
        assert thread.resolved is resolved
