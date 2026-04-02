from common.tests.utils.helpers import BaseTestCase
from reporting.models import ExpectedValueRangeMethodologyField
from decimal import Decimal


class ExpectedValueRangeMethodologyFieldTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = ExpectedValueRangeMethodologyField.objects.create(
            fuel_type_id=1,
            methodology_id=1,
            reporting_field_id=1,
            lower_bound=Decimal('0'),
            upper_bound=Decimal('10.0'),
            valid_from='1999-01-01',
            valid_to='1999-12-31',
        )
        cls.field_data = [
            ("id", "ID", None, None),
            ("fuel_type", "fuel type", None, None),
            ("methodology", "methodology", None, None),
            ("reporting_field", "reporting field", None, None),
            ("lower_bound", "lower bound", None, None),
            ("upper_bound", "upper bound", None, None),
            ("valid_from", "valid from", None, None),
            ("valid_to", "valid to", None, None),
        ]
