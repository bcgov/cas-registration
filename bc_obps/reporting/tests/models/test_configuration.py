from common.tests.utils.helpers import BaseTestCase
from reporting.models import Configuration
from django.core.exceptions import ValidationError


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

    # Throws when a record being inserted has an overlapping date range
    def testExclusionConstraintOverlaps(self):
        invalid_record = Configuration(slug='invalidRecord', valid_from='2024-02-01', valid_to='2024-12-31')
        with self.assertRaises(ValidationError, msg="ActivitySourceTypeBaseSchema already exists."):
            invalid_record.save()

    def testValidRecordInsert(self):
        valid_record = Configuration(slug='validRecord', valid_from='2025-01-01', valid_to='2025-12-31')
        valid_record.save()
