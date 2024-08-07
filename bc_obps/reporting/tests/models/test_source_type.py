from common.tests.utils.helpers import BaseTestCase
from reporting.models import SourceType
from django.test import TestCase


class TestInitialData(TestCase):
    def test_source_type_initial_data(self):
        expected_source_types = sorted(
            [
                'General stationary combustion of fuel or waste with production of useful energy',
                'General stationary combustion of waste without production of useful energy',
                'Fuel combustion by mobile equipment that is part of the facility',
                'Anode consumption in electrolysis cells, anode and cathode baking or green coke calcination',
                'Anode effects',
                'Cover gas from electrolysis cells',
                'Steam reformation or gasification of a hydrocarbon during ammonia production',
                'Calcination of limestone, shale, sand, slag or other raw materials used to produce clinker, as well as the oxidization of organic carbon in the raw material',
                'Coal when broken or exposed to the atmosphere during mining',
                'Stored coal piles',
                'Removal of impurities using carbonate flux reagents',
                'Use of reducing agents',
                'Use of material (e.g., coke) for slag cleaning and the consumption of graphite or carbon electrodes',
                'The solvent extraction and electrowinning process, also known as SX-EW',
                'Fuel combustion for electricity generation',
                'Acid gas scrubbers and acid gas reagents',
                'Cooling units',
                'Geothermal geyser steam or fluids',
                'Installation, maintenance, operation and decommissioning of electrical equipment',
                'Electronics manufacturing, including the cleaning of chemical vapour deposition chambers and plasma/dry etching processes',
                'Removal of impurities using carbonate flux reagents, the use of reducing agents, the use of material (e.g. coke) for slag cleaning, and the consumption of graphite or carbon electrodes during ferroalloy production',
                'Calcination of carbonate materials',
                'Steam reformation of hydrocarbons, partial oxidation of hydrocarbons or other transformation of hydrocarbon feedstock',
                'Industrial wastewater process using anaerobic digestion',
                'Oil-water separators',
                'Use of reducing agents during lead production',
                'Calcination of carbonate materials in lime manufacturing',
                'Use of reducing agents in magnesium production',
                'Cover gases or carrier gases in magnesium production',
                'Catalytic oxidation, condensation and absorption processes during nitric acid manufacturing',
                'Flares and oxidizers',
                'Process vents',
                'Equipment leaks',
                'Ethylene production',
                'Process units',
                'Catalyst regeneration',
                'Asphalt production',
                'Sulphur recovery',
                'Flares, the flare pilot, the combustion of purge gas and the destruction of low Btu gases',
                'Above-ground storage tanks at refineries',
                'Oil-water separators at refineries',
                'Equipment leaks at refineries',
                'Wastewater processing using anaerobic digestion at refineries',
                'Uncontrolled blowdown systems used at refineries',
                'Loading operations at refineries and terminals',
                'Delayed coking units at refineries',
                'Coke calcining at refineries',
                'Reaction of calcium carbonate with sulphuric acid',
                'Pulping and chemical recovery',
                'Combustion of refinery fuel gas, still gas, flexigas or associated gas',
                'Use of reducing agents during zinc production',
                'Above-ground storage tanks',
                'Carbonates used but not consumed in other activities set out in column 2',
                'General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy',
                'General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy',
                'Field gas or process vent gas combustion at a linear facilities operation',
                'Natural gas pneumatic high bleed device venting',
                'Natural gas pneumatic pump venting',
                'Natural gas pneumatic low bleed device venting',
                'Natural gas pneumatic intermittent bleed device venting',
                'Acid gas removal venting or incineration',
                'Dehydrator venting',
                'Blowdown venting',
                'Releases from tanks used for storage, production or processing',
                'Associated gas venting',
                'Associated gas flaring',
                'Flaring stacks',
                'Centrifugal compressor venting',
                'Reciprocating compressor venting',
                'Equipment leaks detected using leak detection and leaker emission factor methods',
                'Population count sources',
                'Transmission storage tanks',
                'Enhanced oil recovery injection pump blowdowns',
                'Produced water dissolved carbon dioxide and methane',
                'Enhanced oil recovery produced hydrocarbon liquids dissolved carbon dioxide',
                'Other venting sources',
                'Other fugitive sources',
                'Third party line hits with release of gas',
                'Well venting for liquids unloading',
                'Gas well venting during well completions and workovers with or without hydraulic fracturing',
                'Drilling flaring',
                'Drilling venting',
                'Hydraulic fracturing flaring',
                'Well testing venting',
                'Well testing flaring',
                'Flare stacks',
            ]
        )

        existing_source_types = sorted(list(SourceType.objects.values_list('name', flat=True)))
        for element in existing_source_types:
            if element not in expected_source_types:
                print(element)
        self.assertEqual(len(existing_source_types), len(expected_source_types))
        self.assertEqual(existing_source_types, expected_source_types)


class SourceTypeModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = SourceType.objects.create(name="testSourceType", json_key='jsonKey')
        cls.field_data = [
            ("id", "ID", None, None),
            ("name", "name", 1000, None),
            ("json_key", "json key", 100, None),
            ("configuration_elements", "configuration element", None, None),
            ("reportsourcetype_records", "report source type", None, 0),
        ]
