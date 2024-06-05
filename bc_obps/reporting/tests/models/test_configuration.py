from common.tests.utils.helpers import BaseTestCase
from reporting.models import Configuration

class ConfigurationTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):

        cls.test_object = Configuration.objects.create(
            slug="testConfig",
            valid_from="2024-01-01",
            valid_to="2024-03-31",
        )
        cls.field_data = [
            ("id", "ID", None, None),
            ("slug", "slug", 1000, None),
            ("valid_from", "valid from", None, None),
            ("valid_to", "valid to", None, None),
        ]
