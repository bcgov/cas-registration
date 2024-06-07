from common.tests.utils.helpers import BaseTestCase
from registration.models import ReportingActivity


class ReportingActivityModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.field_data = [
            ("id", "ID", None, None),
            ("name", "name", 1000, None),
            ("applicable_to", "applicable to", None, None),
            ("operations", "operation", None, None),
        ]
        cls.test_object = ReportingActivity.objects.create(
            name="test activity",
            applicable_to=ReportingActivity.Applicability.ALL,
        )
