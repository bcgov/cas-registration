from django.test import TestCase
from model_bakery.baker import make_recipe
from reporting.models.comment_thread import CommentThread
from reporting.service.comment_service import CommentService


class TestCommentService(TestCase):
    def setUp(self):
        self.report_version = make_recipe('reporting.tests.utils.report_version')
        self.facility = make_recipe('registration.tests.utils.facility')

    def test_create_thread(self):
        assert CommentThread.objects.all().count() == 0
        CommentService.create_thread(
            version_id=self.report_version.id, facility_id=self.facility.id, comment="Test comment"
        )
        assert CommentThread.objects.all().count() == 1
        thread = CommentThread.objects.first()
        assert thread.report_version_id == self.report_version.id
        assert thread.facility_id == self.facility.id
        assert thread.comments.first().comment == "Test comment"
