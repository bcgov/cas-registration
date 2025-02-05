from common.tests.utils.helpers import BaseTestCase
from reporting.models import Methodology
from django.test import TestCase


class TestInitialData(TestCase):
    def test_methodology_initial_data(self):
        expected_methodologies = sorted(
            [
                "Default HHV/Default EF",
                "Default EF",
                "Measured HHV/Default EF",
                "Measured Steam/Default EF",
                "Measured CC",
                "Measured Steam/Measured EF",
                "Alternative Parameter Measurement",
                "Replacement Methodology",
                "Anode Consumption",
                "Slope method",
                "Overvoltage method",
                "C2F6 anode effects",
                "Inventory",
                "Input/output",
                "Heat Input/Default EF",
                "Measured EF",
                "Site-specific EF",
                "CEMS",
                "Measured CC and MW",
                "Calcination Fraction",
                "Mass of Output Carbonates",
                "Alternative Parameter Methodology",
                "Feedstock Material Balance",
                "Emissions Factor Methodology",
                "Solids-HHV",
                "Solids-CC",
                "Make-up Chemical Use Methodology",
                "WCI.203(f)(1)",
                "WCI.203(f)(2)",
                "Anode Consumption - Prebaked",
                "Anode Consumption - Soderberg",
                "Anode/Cathode Baking",
                "Green Coke Calcination",
                "WCI.353 (a)(1)",
                "WCI.353 (a)(2)",
                "WCI.353 (a.1)(1)",
                "WCI.353 (a.1)(2)",
                "WCI.353 (b)",
                "WCI.353 (b.1)",
                "WCI.353 (c)",
                "WCI.353 (c.1)(i)",
                "WCI.353 (c.1)(ii)",
                "WCI.353 (d)",
                "WCI.353 (e)",
                "WCI.353 (f)",
                "WCI.353 (g)",
                "WCI.353 (h)",
                "WCI.353 (h)(1)",
                "WCI.353 (h)(2)",
                "WCI.353 (h)(3)",
                "WCI.353 (h)(4)",
                "WCI.353 (m)",
                "WCI.353 (t)",
                "CEPEI Methodology Manual",
                "Other CGA Methodology",
                "WCI.353 (c.1)(i)",
                "WCI.353 (c.1)(ii)",
                "WCI.353 (e)",
                "WCI.353 (f)",
            ]
        )
        existing_methodologies = sorted(list(Methodology.objects.values_list("name", flat=True)))

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
            ("reportmethodology_records", "report methodology", None, 0),
        ]
