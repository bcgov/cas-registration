from common.tests.utils.helpers import BaseTestCase
from reporting.models import EmissionCategory
from django.test import TestCase


class TestInitialData(TestCase):
    def test_emission_category_initial_data(self):
        basic_categories = EmissionCategory.objects.filter(category_type='basic').count()
        fuel_categories = EmissionCategory.objects.filter(category_type='fuel_excluded').count()
        other_categories = EmissionCategory.objects.filter(category_type='other_excluded').count()

        self.assertEqual(basic_categories, 9)
        self.assertEqual(fuel_categories, 3)
        self.assertEqual(other_categories, 2)


class EmissionCategoryModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = EmissionCategory.objects.create(category_name="testCategory", category_type='basic')
        cls.field_data = [
            ("id", "ID", None, None),
            ("category_name", "category name", 1000, None),
            ("category_type", "category type", 1000, None),
            ("emission_category_mappings", "emission category mapping", None, 0),
            ("report_new_entrant_emissions", "report new entrant emissions", None, 0),
            ("report_non_attributable_emissions", "report non attributable emissions", None, 0),
            ("reportproductemissionallocation_records", "report product emission allocation", None, 0),
        ]
