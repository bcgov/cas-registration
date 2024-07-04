from common.tests.utils.helpers import BaseTestCase
from reporting.models import FuelType
from django.test import TestCase


class TestInitialData(TestCase):
    def test_fuel_type_initial_data(self):
        expected_fuel_types = sorted(
            [
                'Acetylene',
                'Agricultural Byproducts',
                'ANFO',
                'Anthracite Coal',
                'Asphalt & Road Oil',
                'Aviation Gasoline',
                'Aviation Turbo Fuel',
                'Biodiesel (100%)',
                'Biogas (captured methane)',
                'Bituminous Coal',
                'Bone char',
                'Butane',
                'Butylene',
                'Carpet fibre',
                'Coal Coke',
                'Coke Oven Gas',
                'Comubistlbe Tall Oil',
                'Concentrated Non-Condensible Gases (CNCGs)',
                'Crude Oil',
                'Crude Sulfate Turpentine (CST)',
                'Crude Tall Oil (CTO)',
                'Diesel',
                'Digester Gas',
                'Dilute non-condensible gases (DNCGs)',
                'Distilate Fuel Oil No.1',
                'Distilate Fuel Oil No.2',
                'Distilate Fuel Oil No.4',
                'Ethane',
                'Ethanol (100%)',
                'Ethylene',
                'E-waste',
                'Explosives',
                'Field gas',
                'Field gas or porcess vent gas',
                'Foreign Bituminous Coal',
                'Gasoline',
                'Isobutane',
                'Isobutylene',
                'Kerosene',
                'Kerosene -type Jet Fuel',
                'Landfill Gas',
                'Light Fuel Oil',
                'Lignite',
                'Liquified Petroleum Gases (LPG)',
                'Lubricants',
                'Motor Gasoline - Off-road',
                'Motor Gasoline',
                'Municipal Solid Waste - non-biomass component',
                'Municipal Solide Waste - biomass component',
                'Naphtha',
                'Natural Gas',
                'Natural Gasoline',
                'Nitrous Oxide',
                'Oily Rags',
                'Peat',
                'Petrochemical Feedstocks',
                'Petroleum Coke - Refinery Use',
                'Petroleum Coke - Upgrader Use',
                'Petroleum Coke',
                'Plastic Recycle',
                'Plastics',
                'Process vent gas',
                'Propane',
                'Propylene',
                'Refinery Fuel Gas - Type 1',
                'Refinery Fuel Gas - Type 2',
                'Refinery Fuel Gas',
                'Rendered Animal Fat',
                'Renewable diesel',
                'Renewable natural gas',
                'Residual Fuel Oil (#5 & 6)',
                'SMR PSA Tail Gas',
                'Sodium Bicarbonate',
                'Solid Byproducts',
                'Special substance X',
                'Spent Pulping Liquor',
                'Still Gas - Refineries',
                'Still Gas - Upgrader Use',
                'Still gas',
                'Sub-Bituminous Coal',
                'Tail gas',
                'Tires - biomass component',
                'Tires - non-biomass component',
                'Trona',
                'Turpentine',
                'Vegetable Oil',
                'Waste Plastics',
                'Wood Waste',
            ]
        )
        existing_fuel_types = sorted(list(FuelType.objects.values_list('name', flat=True)))

        self.assertEqual(len(existing_fuel_types), len(expected_fuel_types))
        self.assertEqual(existing_fuel_types, expected_fuel_types)


class FuelTypeModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = FuelType.objects.create(name="testFuelType", unit='kilolitres')
        cls.field_data = [
            ("id", "ID", None, None),
            ("name", "name", 1000, None),
            ("unit", "unit", 1000, None),
        ]
