from common.tests.utils.helpers import BaseTestCase
from registration.models import Activity


class ActivityModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.field_data = [
            ("id", "ID", None, None),
            ("name", "name", 1000, None),
            ("applicable_to", "applicable to", None, None),
            ("slug", "slug", 50, None),
            ("weight", "weight", None, None),
            ("operations", "operation", None, None),
            ("configuration_elements", "configuration element", None, None),
            ("reportactivity_records", "report activity", None, 0),
        ]
        cls.test_object = Activity.objects.create(
            name="test activity", applicable_to=Activity.Applicability.ALL, slug="test_activity", weight=100.0
        )
