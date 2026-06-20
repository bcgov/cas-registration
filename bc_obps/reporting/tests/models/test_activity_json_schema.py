from common.tests.utils.helpers import BaseTestCase
from registration.models import Activity
from reporting.models import ActivityJsonSchema
from reporting.tests.utils.bakers import configuration_baker
import pytest
from datetime import date


class ActivityJsonSchemaTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        config = configuration_baker({'slug': '5025', 'valid_from': '5025-01-01', 'valid_to': '5025-12-31'})
        cls.test_object = ActivityJsonSchema.objects.create(
            activity=Activity.objects.get(pk=1),
            json_schema='{}',
            valid_from=config,
            valid_to=config,
        )
        cls.field_data = [
            ("id", "ID", None, None),
            ("activity", "activity", None, None),
            ("json_schema", "json schema", None, None),
            ("valid_from", "valid from", None, None),
            ("valid_to", "valid to", None, None),
            ("reportactivity_records", "report activity", None, 0),
        ]

    # Throws when a matching activity, source_type, json_schema has an overlapping date range
    def testDuplicateJsonSchemaForDateRange(self):
        invalid_record = ActivityJsonSchema(
            activity=self.test_object.activity,
            json_schema='{}',
            valid_from=self.test_object.valid_from,
            valid_to=self.test_object.valid_from,
        )

        with pytest.raises(Exception) as exc:
            invalid_record.save()
        assert exc.match(r"^This record will result in duplicate json schemas")

    def testValidInsert(self):
        config = configuration_baker({'slug': '5026', 'valid_from': '5026-01-01', 'valid_to': '5026-12-31'})
        valid_record = ActivityJsonSchema(
            activity=self.test_object.activity,
            json_schema='{}',
            valid_from=config,
            valid_to=config,
        )
        valid_record.save()

    def testGetByDate(self):
        """The custom manager should return the schema valid for the given date"""
        result = ActivityJsonSchema.objects.get_by_date(
            activity=self.test_object.activity,
            date=date(5025, 6, 1),
        )
        assert result == self.test_object

    def testGetByDateNoMatch(self):
        """The custom manager should raise DoesNotExist if no schema matches the date"""
        with pytest.raises(ActivityJsonSchema.DoesNotExist):
            ActivityJsonSchema.objects.get_by_date(
                activity=self.test_object.activity,
                date=date(5024, 1, 1),
            )
