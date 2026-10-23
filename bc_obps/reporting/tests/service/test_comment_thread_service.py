import pytest
from django.test import TestCase
from model_bakery.baker import make_recipe
from reporting.models.comment_thread import CommentThread
from reporting.service.comment_thread_service import CommentThreadService


class TestCommentThreadService(TestCase):
    def setUp(self):
        self.report_version = make_recipe('reporting.tests.utils.report_version')
        self.facility = make_recipe('registration.tests.utils.facility')

    def test_create_thread(self):
        assert CommentThread.objects.all().count() == 0
        CommentThreadService.create_thread(
            version_id=self.report_version.id, facility_id=self.facility.id, comment="Test comment"
        )
        assert CommentThread.objects.all().count() == 1
        thread = CommentThread.objects.first()
        assert thread.report_version_id == self.report_version.id
        assert thread.facility_id == self.facility.id
        assert thread.comments.first().comment == "Test comment"

    def test_get_threads(self):
        other_report_version = make_recipe(
            'reporting.tests.utils.report_version', report_id=self.report_version.report_id, status='Submitted'
        )
        # Create two threads that reference the same report and one other thread for a different report
        expected_thread_1 = CommentThreadService.create_thread(
            version_id=self.report_version.id, facility_id=self.facility.id, comment="I'm a little tea pot."
        )
        expected_thread_2 = CommentThreadService.create_thread(
            version_id=other_report_version.id, facility_id=self.facility.id, comment="Twinkle twinkle little star."
        )
        other_thread = make_recipe('reporting.tests.utils.comment_thread')
        assert CommentThread.objects.all().count() == 3

        threads = CommentThreadService.get_threads(report_id=self.report_version.report_id)
        # Assert that only threads related to the report are returned
        assert len(threads) == 2
        assert {t.id for t in threads} == {expected_thread_1.id, expected_thread_2.id}
        assert other_thread.id not in {t.id for t in threads}

    @pytest.mark.parametrize("resolved", [True, False])
    def test_resolve_thread_updates_resolved_state(self, resolved):
        thread = make_recipe(
            'reporting.tests.utils.comment_thread',
            report=self.report_version.report,
            report_version=self.report_version,
        )

        resolved_thread = CommentThreadService.resolve_thread(
            version_id=self.report_version.id,
            thread_id=thread.id,
            resolved=resolved,
        )
        assert resolved_thread.resolved is resolved

        thread.refresh_from_db()
        assert thread.resolved is resolved
