from common.tests.utils.helpers import BaseTestCase
from registration.models import NaicsCode


class NaicsCodeModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = NaicsCode.objects.create(
            naics_code="1",
            naics_description="test",
            is_regulated=True,
        )
        cls.field_data = [
            ("id", "ID", None, None),
            ("naics_code", "naics code", 1000, None),
            ("naics_description", "naics description", 1000, None),
            ("operations", "operation", None, None),
            ("is_regulated", "is regulated", None, None),
            ("operations_naics_secondary", "operation", None, None),
            ("operations_naics_tertiary", "operation", None, None),
            ("regulatory_values", "naics regulatory value", None, None),
        ]
