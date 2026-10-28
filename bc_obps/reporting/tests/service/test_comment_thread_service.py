import pytest
from django.db import connection
from model_bakery.baker import make_recipe
from reporting.api_v2._report_versions._report_version_id.comment_thread_schema import CommentThreadSchema
from reporting.models.comment_thread import CommentThread
from reporting.service.comment_thread_service import CommentThreadService

pytestmark = pytest.mark.django_db


class TestCommentThreadService:
    def setup_method(self):
        self.report_version = make_recipe('reporting.tests.utils.report_version')
        self.facility = make_recipe('registration.tests.utils.facility')
        self.user = make_recipe('registration.tests.utils.cas_director')
        # Set the session guid so the audit trigger populates created_by on new comments
        with connection.cursor() as cursor:
            cursor.execute('set my.guid = %s', [str(self.user.user_guid)])

    def test_create_thread(self):
        assert CommentThread.objects.all().count() == 0
        thread = CommentThreadService.create_thread(
            version_id=self.report_version.id,
            user_guid=self.user.user_guid,
            facility_id=self.facility.id,
            comment="Test comment",
        )
        assert CommentThread.objects.all().count() == 1
        assert thread.report_version_id == self.report_version.id
        assert thread.facility_id == self.facility.id
        assert thread.comments.first().comment == "Test comment"

        response = CommentThreadSchema.model_validate(thread)
        assert len(response.comments) == 1
        assert response.comments[0].comment == "Test comment"
        assert response.comments[0].user_can_edit is True

    def test_set_comments_user_can_edit(self):
        thread = CommentThreadService.create_thread(
            version_id=self.report_version.id,
            user_guid=self.user.user_guid,
            facility_id=self.facility.id,
            comment="Test comment",
        )
        other_user = make_recipe('registration.tests.utils.cas_analyst')

        CommentThreadService.set_comments_user_can_edit([thread], self.user.user_guid)
        assert all(comment.user_can_edit is True for comment in thread.comments.all())

        CommentThreadService.set_comments_user_can_edit([thread], other_user.user_guid)
        assert all(comment.user_can_edit is False for comment in thread.comments.all())

    def test_get_threads(self):
        other_report_version = make_recipe(
            'reporting.tests.utils.report_version', report_id=self.report_version.report_id, status='Submitted'
        )
        # Create two threads that reference the same report and one other thread for a different report
        expected_thread_1 = CommentThreadService.create_thread(
            version_id=self.report_version.id,
            user_guid=self.user.user_guid,
            facility_id=self.facility.id,
            comment="I'm a little tea pot.",
        )
        expected_thread_2 = CommentThreadService.create_thread(
            version_id=other_report_version.id,
            user_guid=self.user.user_guid,
            facility_id=self.facility.id,
            comment="Twinkle twinkle little star.",
        )
        other_thread = make_recipe('reporting.tests.utils.comment_thread')
        assert CommentThread.objects.all().count() == 3

        threads = CommentThreadService.get_threads(
            report_id=self.report_version.report_id, user_guid=self.user.user_guid
        )
        # Assert that only threads related to the report are returned
        assert len(threads) == 2
        assert {t.id for t in threads} == {expected_thread_1.id, expected_thread_2.id}
        assert other_thread.id not in {t.id for t in threads}
        # Comments were created by self.user, so they are editable by that user
        assert all(comment.user_can_edit is True for thread in threads for comment in thread.comments.all())

    @pytest.mark.parametrize("resolved_input", [True, False])
    def test_resolve_thread_updates_resolved_state(self, resolved_input):
        thread = make_recipe(
            'reporting.tests.utils.comment_thread',
            report=self.report_version.report,
            report_version=self.report_version,
        )

        resolved_thread = CommentThreadService.resolve_thread(
            version_id=self.report_version.id,
            thread_id=thread.id,
            user_guid=self.user.user_guid,
            resolved=resolved_input,
        )
        assert resolved_thread.resolved is resolved_input

        thread.refresh_from_db()
        assert thread.resolved is resolved_input
