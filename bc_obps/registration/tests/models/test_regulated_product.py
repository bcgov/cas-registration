from common.tests.utils.helpers import BaseTestCase
from registration.models import RegulatedProduct


class RegulatedProductModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.field_data = [
            ("id", "ID", None, None),
            ("name", "name", 1000, None),
            ("operations", "operation", None, None),
            ("report_products", "report product", None, 0),
            ("productemissionintensity_records", "product emission intensity", None, 0),
        ]
        cls.test_object = RegulatedProduct.objects.create(
            name="test product",
        )
