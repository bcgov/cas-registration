from common.tests.utils.helpers import BaseTestCase
from reporting.models import ReportingField
import pytest
from django.db import ProgrammingError


class ReportingFieldTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = ReportingField.objects.create(
            field_name="testReportingField", field_type="testFieldType", slug='testSlug'
        )
        cls.field_data = [
            ("id", "ID", None, None),
            ("field_name", "field name", 1000, None),
            ("field_type", "field type", 1000, None),
            ("field_units", "field units", 1000, None),
            ("slug", "slug", 1000, None),
            ("field_display_title", "field display title", 1000, None),
            ("configuration_elements", "configuration element", None, None),
            ("expected_value_range_methodology_field", "expected value range methodology field", None, 0),
        ]

    def testSlugIsImmutable(self):

        self.test_object.slug = 'immutable'
        with pytest.raises(
            ProgrammingError,
            match='slug field is immutable',
        ):
            self.test_object.save()
