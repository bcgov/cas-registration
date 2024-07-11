from common.tests.utils.helpers import BaseTestCase
from reporting.models import Methodology
from django.test import TestCase


class TestInitialData(TestCase):
    def test_methodology_initial_data(self):
        expected_methodologies = sorted(
            [
                'Default HHV/Default EF',
                'Default EF',
                'Measured HHV/Default EF',
                'Measured Steam/Default EF',
                'Measured CC',
                'Measured Steam/Measured EF',
                'Alternative Parameter Measurement',
                'Replacement Methodology',
                'Anode Consumption',
                'Slope method',
                'Overvoltage method',
                'C2F6 anode effects',
                'Inventory',
                'Input/output',
                'Heat Input/Default EF',
                'Measured EF'
            ]
        )
        existing_methodologies = sorted(list(Methodology.objects.values_list('name', flat=True)))

        self.assertEqual(len(existing_methodologies), len(expected_methodologies))
        self.assertEqual(existing_methodologies, expected_methodologies)


class MethodologyModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = Methodology.objects.create(name="testMethodology")
        cls.field_data = [
            ("id", "ID", None, None),
            ("name", "name", 1000, None),
            ("configuration_elements", "configuration element", None, None),
        ]
