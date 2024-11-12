from common.tests.utils.helpers import BaseTestCase
from reporting.models import FuelType
from django.test import TestCase


class TestInitialData(TestCase):
    def test_fuel_type_initial_data(self):
        expected_fuel_types = sorted(
            [
                "Acetylene",
                "Acid Gas",
                "Aviation Gasoline",
                "Biodiesel (100%)",
                "Bituminous Coal",
                "Butane",
                "C/D Waste - Plastic",
                "C/D Waste - Wood",
                "Carpet fibre",
                "Coal Coke",
                "Comubstible Tall Oil",
                "Concentrated Non-Condensible Gases (CNCGs)",
                "Crude Sulfate Turpentine (CST)",
                "Crude Tall Oil (CTO)",
                "Diesel",
                "Digester Gas",
                "Dilute non-condensible gases (DNCGs)",
                "Distilate Fuel Oil No.2",
                "Ethanol (100%)",
                "E-waste",
                "Explosives",
                "Field gas",
                "HTCR PSA Tail gas",
                "Hydrogen",
                "Hydrogenator Outlet Gas",
                "Isobutylene",
                "Kerosene",
                "Landfill Gas",
                "Light Fuel Oil",
                "Liquified Petroleum Gases (LPG)",
                "Lubricants",
                "Motor Gasoline",
                "Motor Gasoline - Off-road",
                "Municipal Solid Waste - non-biomass component",
                "Municipal Solide Waste - biomass component",
                "Naphtha",
                "Natural Gas",
                "Natural Gas Condensate",
                "Nitrous Oxide",
                "Petroleum Coke",
                "Pentanes Plus",
                "Plastics",
                "Propane",
                "Propylene",
                "PSA Offgas",
                "PSA Process Gas",
                "RDU Offgas",
                "Recycle Gas",
                "Refinery Fuel Gas",
                "Renewable Diesel",
                "Renewable Natural Gas",
                "Residual Fuel Oil (#5 & 6)",
                "SMR PSA Tail Gas",
                "Sodium Bicarbonate",
                "Solid Byproducts",
                "Sour Gas",
                "Spent Pulping Liquor",
                "Still gas",
                "Sub-Bituminous Coal",
                "Tires - biomass component",
                "Tires - non-biomass component",
                "Trona",
                "Turpentine",
                "Wood Waste",
            ]
        )
        existing_fuel_types = sorted(list(FuelType.objects.values_list("name", flat=True)))

        self.assertEqual(len(existing_fuel_types), len(expected_fuel_types))
        self.assertEqual(existing_fuel_types, expected_fuel_types)
        woody_biomass_count = FuelType.objects.filter(classification='Woody Biomass').count()
        exempted_biomass_count = FuelType.objects.filter(classification='Other Exempted Biomass').count()
        exempted_non_biomass_count = FuelType.objects.filter(classification='Exempted Non-biomass').count()
        non_biomass_count = FuelType.objects.filter(classification='Non-biomass').count()
        non_exempted_biomass_count = FuelType.objects.filter(classification='Non-exempted Biomass').count()
        self.assertEqual(woody_biomass_count, 8)
        self.assertEqual(exempted_biomass_count, 9)
        self.assertEqual(exempted_non_biomass_count, 13)
        self.assertEqual(non_biomass_count, 33)
        self.assertEqual(non_exempted_biomass_count, 1)
        self.assertEqual(
            woody_biomass_count
            + exempted_biomass_count
            + exempted_non_biomass_count
            + non_biomass_count
            + non_exempted_biomass_count,
            len(expected_fuel_types),
        )


class FuelTypeModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = FuelType.objects.create(
            name="testFuelType", classification='Woody Biomass', unit="kilolitres"
        )
        cls.field_data = [
            ("id", "ID", None, None),
            ("name", "name", 1000, None),
            ("unit", "unit", 1000, None),
            ("classification", "classification", 1000, None),
            ("reportfuel_records", "report fuel", None, 0),
        ]
