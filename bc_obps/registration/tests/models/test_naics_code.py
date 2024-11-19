from common.tests.utils.helpers import BaseTestCase
from registration.models import NaicsCode


class NaicsCodeModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = NaicsCode.objects.create(
            naics_code="1",
            naics_description="test",
        )
        cls.field_data = [
            ("id", "ID", None, None),
            ("naics_code", "naics code", 1000, None),
            ("naics_description", "naics description", 1000, None),
            ("operations", "operation", None, None),
            ("operations_naics_secondary", "operation", None, None),
            ("operations_naics_tertiary", "operation", None, None),
            ("naicsregulatoryvalue_records", "naics regulatory value", None, None),
        ]
