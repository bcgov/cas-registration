from common.tests.utils.helpers import BaseTestCase
from reporting.models import Configuration
from django.core.exceptions import ValidationError
from django.test import TestCase


class ConfigurationTest(TestCase):
    @classmethod
    def setUpTestData(cls):

        cls.test_object = Configuration.objects.create(
            slug="testConfig",
            valid_from="5025-01-01",
            valid_to="5025-03-31",
        )
        cls.field_data = [
            ("id", "ID", None, None),
            ("slug", "slug", 1000, None),
            ("valid_from", "valid from", None, None),
            ("valid_to", "valid to", None, None),
        ]

    # Throws when a record being inserted has an overlapping date range
    def testExclusionConstraintOverlaps(self):
        invalid_record = Configuration(slug='invalidRecord', valid_from='5025-02-01', valid_to='5025-12-31')
        with self.assertRaises(ValidationError, msg="Configuration record already exists."):
            invalid_record.save()

    def testValidRecordInsert(self):
        valid_record = Configuration(slug='validRecord', valid_from='5026-01-01', valid_to='5026-12-31')
        valid_record.save()
