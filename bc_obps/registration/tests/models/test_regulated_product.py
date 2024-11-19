from common.tests.utils.helpers import BaseTestCase
from registration.models import RegulatedProduct


class RegulatedProductModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.field_data = [
            ("id", "ID", None, None),
            ("name", "name", 1000, None),
            ("unit", "unit", 1000, None),
            ("is_regulated", "is regulated", None, None),
            ("operations", "operation", None, None),
            ("report_products", "report product", None, 0),
        ]
        cls.test_object = RegulatedProduct.objects.create(
            name="test product",
            unit="test unit",
            is_regulated=True,
        )
