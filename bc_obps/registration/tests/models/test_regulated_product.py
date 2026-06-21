from common.tests.utils.helpers import BaseTestCase
from model_bakery.baker import make_recipe
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
            ("valid_from", "valid from", None, None),
            ("valid_to", "valid to", None, None),
            ("operations", "operation", None, None),
            ("report_products", "report product", None, 0),
            ("new_entrant_productions", "report new entrant production", None, 0),
            ("productemissionintensity", "product emission intensity", None, 0),
            ("regulatory_values_overrides", "naics regulatory override", None, None),
        ]
        cls.test_object = make_recipe(
            'registration.tests.utils.regulated_product',
            name="test product",
            unit="test unit",
            is_regulated=True,
        )


class TestAssociatedData(TestCase):
    def test_is_regulated_data(self):
        regulated_products_count = RegulatedProduct.objects.filter(is_regulated=True).count()
        not_regulated_products_count = RegulatedProduct.objects.filter(is_regulated=False).count()

        self.assertEqual(regulated_products_count, 38)
        self.assertEqual(not_regulated_products_count, 3)
