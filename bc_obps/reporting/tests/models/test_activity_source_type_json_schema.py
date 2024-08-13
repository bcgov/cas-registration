from common.tests.utils.helpers import BaseTestCase
from registration.models import ReportingActivity
from reporting.models import ActivitySourceTypeJsonSchema, SourceType
from reporting.tests.utils.bakers import configuration_baker
import pytest


class ActivitySourceTypeJsonSchemaTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        config = configuration_baker({'slug': '5025', 'valid_from': '5025-01-01', 'valid_to': '5025-12-31'})
        cls.test_object = ActivitySourceTypeJsonSchema.objects.create(
            reporting_activity=ReportingActivity.objects.get(pk=1),
            source_type=SourceType.objects.get(pk=1),
            json_schema='{}',
            has_unit=True,
            has_fuel=True,
            valid_from=config,
            valid_to=config,
        )
        cls.field_data = [
            ("id", "ID", None, None),
            ("reporting_activity", "reporting activity", None, None),
            ("source_type", "source type", None, None),
            ("json_schema", "json schema", None, None),
            ("has_unit", "has unit", None, None),
            ("has_fuel", "has fuel", None, None),
            ("valid_from", "valid from", None, None),
            ("valid_to", "valid to", None, None),
            ("reportsourcetype_records", "report source type", None, 0),
        ]

    # Throws when a matching activity, source_type, json_schema has an overlapping date range
    def testDuplicateJsonSchemaForDateRange(self):
        invalid_record = ActivitySourceTypeJsonSchema(
            reporting_activity=self.test_object.reporting_activity,
            source_type=self.test_object.source_type,
            json_schema='{}',
            has_unit=True,
            has_fuel=True,
            valid_from=self.test_object.valid_from,
            valid_to=self.test_object.valid_from,
        )

        with pytest.raises(Exception) as exc:
            invalid_record.save()
        assert exc.match(r"^This record will result in duplicate json schemas")

    def testValidInsert(self):
        config = configuration_baker({'slug': '5026', 'valid_from': '5026-01-01', 'valid_to': '5026-12-31'})
        valid_record = ActivitySourceTypeJsonSchema(
            reporting_activity=self.test_object.reporting_activity,
            source_type=self.test_object.source_type,
            json_schema='{}',
            has_unit=True,
            has_fuel=True,
            valid_from=config,
            valid_to=config,
        )
        valid_record.save()
