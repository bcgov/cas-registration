from common.tests.utils.helpers import BaseTestCase
from registration.models import ReportingActivity
from reporting.models import ActivitySourceTypeBaseSchema, SourceType, Configuration
from reporting.tests.utils.bakers import (
    configuration_baker,
    reporting_activity_baker,
    source_type_baker,
    base_schema_baker,
)
from django.core.exceptions import ValidationError
from django.db import models
import pytest

from django.db.models import Q

class ActivitySourceTypeBaseSchemaTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        config = configuration_baker({'slug':'2024', 'valid_from': '2024-01-01', 'valid_to': '2024-12-31'})
        cls.test_object = ActivitySourceTypeBaseSchema.objects.create(
          reporting_activity=ReportingActivity.objects.get(pk=1),
          source_type=SourceType.objects.get(pk=1),
          base_schema=base_schema_baker(),
          valid_from=config,
          valid_to=config
        )
        cls.field_data = [
            ("id", "ID", None, None),
            ("reporting_activity", "reporting activity", None, None),
            ("source_type", "source type", None, None),
            ("base_schema", "base schema", None, None),
            ("valid_from", "valid from", None, None),
            ("valid_to", "valid to", None, None),
        ]
    # Throws when a matching activity, source_type, base_schema has an overlapping date range
    def testDuplicateBaseSchemaForDateRange(self):
        invalid_record = ActivitySourceTypeBaseSchema(
            reporting_activity=self.test_object.reporting_activity,
            source_type=self.test_object.source_type,
            base_schema=base_schema_baker(),
            valid_from=self.test_object.valid_from,
            valid_to=self.test_object.valid_from,
        )

        with pytest.raises(Exception) as exc:
            invalid_record.save()
        assert exc.match(r"^This record will result in duplicate base schemas")
    def testValidInsert(self):
        config = configuration_baker({'slug':'2026', 'valid_from': '2026-01-01', 'valid_to': '2026-12-31'})
        valid_record = ActivitySourceTypeBaseSchema(
            reporting_activity=self.test_object.reporting_activity,
            source_type=self.test_object.source_type,
            base_schema=base_schema_baker(),
            valid_from=config,
            valid_to=config,
        )
        valid_record.save()
