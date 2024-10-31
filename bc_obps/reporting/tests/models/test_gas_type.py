from common.tests.utils.helpers import BaseTestCase
from reporting.models import GasType
from django.test import TestCase


class TestInitialData(TestCase):
    def test_gas_type_initial_data(self):
        expected_gas_type_formulae = sorted(['CO2', 'CH4', 'N2O', 'SF6', 'CF4', 'C2F6', 'CH2F2', 'C2HF5', 'C2H2F4'])
        existing_gas_type_formulae = sorted(list(GasType.objects.values_list('chemical_formula', flat=True)))

        self.assertEqual(len(existing_gas_type_formulae), len(expected_gas_type_formulae))
        self.assertEqual(existing_gas_type_formulae, expected_gas_type_formulae)


class GasTypeModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = GasType.objects.create(name="testGasType", chemical_formula='CO2', gwp=1, cas_number='1-1-1')
        cls.field_data = [
            ("id", "ID", None, None),
            ("name", "name", 1000, None),
            ("chemical_formula", "chemical formula", 100, None),
            ("configuration_elements", "configuration element", None, None),
            ("reportemission_records", "report emission", None, 0),
            ("gwp", "gwp", None, None),
            ("cas_number", "cas number", None, None),
        ]
