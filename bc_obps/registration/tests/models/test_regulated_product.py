from common.tests.utils.helpers import BaseTestCase
from registration.models import RegulatedProduct
from django.test import TestCase


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
            ("productemissionintensity_records", "product emission intensity", None, 0),
        ]
        cls.test_object = RegulatedProduct.objects.create(
            name="test product",
            unit="test unit",
            is_regulated=True,
        )


class TestAssociatedData(TestCase):
    def test_unit_data(self):
        has_units_count = RegulatedProduct.objects.exclude(unit=None).count()

        self.assertEqual(has_units_count, 35)

    def test_is_regulated_data(self):
        regulated_products_count = RegulatedProduct.objects.filter(is_regulated=True).count()
        not_regulated_products_count = RegulatedProduct.objects.filter(is_regulated=False).count()

        self.assertEqual(regulated_products_count, 37)
        self.assertEqual(not_regulated_products_count, 2)
