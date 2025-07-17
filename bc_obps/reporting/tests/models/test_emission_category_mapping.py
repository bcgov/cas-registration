from common.tests.utils.helpers import BaseTestCase
from reporting.models import EmissionCategoryMapping, SourceType
from registration.models import Activity
from django.test import TestCase
from django.db.models import Q
from model_bakery import baker


class TestInitialData(TestCase):
    def test_emission_category_mapping_number_of_records(self):
        # BASIC CATEGORIES
        flaring_count = EmissionCategoryMapping.objects.filter(
            emission_category__category_name='Flaring emissions'
        ).count()
        fugitive_count = EmissionCategoryMapping.objects.filter(
            emission_category__category_name='Fugitive emissions'
        ).count()
        industrial_process_count = EmissionCategoryMapping.objects.filter(
            emission_category__category_name='Industrial process emissions'
        ).count()
        onsite_count = EmissionCategoryMapping.objects.filter(
            emission_category__category_name='On-site transportation emissions'
        ).count()
        stationary_count = EmissionCategoryMapping.objects.filter(
            emission_category__category_name='Stationary fuel combustion emissions'
        ).count()
        venting_useful_count = EmissionCategoryMapping.objects.filter(
            emission_category__category_name='Venting emissions — useful'
        ).count()
        venting_non_useful_count = EmissionCategoryMapping.objects.filter(
            emission_category__category_name='Venting emissions — non-useful'
        ).count()
        waste_count = EmissionCategoryMapping.objects.filter(
            emission_category__category_name='Emissions from waste'
        ).count()
        wastewater_count = EmissionCategoryMapping.objects.filter(
            emission_category__category_name='Emissions from wastewater'
        ).count()
        # FUEL EXCLUDED CATEGORIES
        woody_biomass_count = EmissionCategoryMapping.objects.filter(
            emission_category__category_name='CO2 emissions from excluded woody biomass'
        ).count()
        excluded_biomass_count = EmissionCategoryMapping.objects.filter(
            emission_category__category_name='Other emissions from excluded biomass'
        ).count()
        excluded_nonbiomass_count = EmissionCategoryMapping.objects.filter(
            emission_category__category_name='Emissions from excluded non-biomass'
        ).count()
        # OTHER CATEGORIES
        lfo_line_tracing_count = EmissionCategoryMapping.objects.filter(
            emission_category__category_name='Emissions from line tracing and non-processing and non-compression activities'
        ).count()

        # BASIC
        self.assertEqual(flaring_count, 13)
        self.assertEqual(fugitive_count, 42)
        self.assertEqual(industrial_process_count, 27)
        self.assertEqual(onsite_count, 1)
        self.assertEqual(stationary_count, 8)
        self.assertEqual(venting_useful_count, 20)
        self.assertEqual(venting_non_useful_count, 41)
        self.assertEqual(waste_count, 3)
        self.assertEqual(wastewater_count, 4)
        # FUEL EXCLUDED
        self.assertEqual(woody_biomass_count, 10)
        self.assertEqual(excluded_biomass_count, 10)
        self.assertEqual(excluded_nonbiomass_count, 9)
        # OTHER
        self.assertEqual(lfo_line_tracing_count, 40)

    def test_all_activities_have_basic_category_mapping(self):
        mapped_activity_ids = list(
            EmissionCategoryMapping.objects.filter(emission_category_id__lt=10).values_list('activity_id', flat=True)
        )
        activities_with_no_mapping = list(Activity.objects.filter(~Q(id__in=mapped_activity_ids)))
        assert len(activities_with_no_mapping) == 0

    def test_all_source_types_have_basic_category_mapping(self):
        mapped_source_type_ids = list(
            EmissionCategoryMapping.objects.filter(emission_category_id__lt=10).values_list('source_type_id', flat=True)
        )
        source_types_with_no_mapping = list(SourceType.objects.filter(~Q(id__in=mapped_source_type_ids)))
        assert len(source_types_with_no_mapping) == 0

    def test_emission_category_mapping_correct_activities(self):
        flaring_activities = sorted(
            list(
                EmissionCategoryMapping.objects.select_related('activity')
                .filter(emission_category__category_name='Flaring emissions')
                .values_list('activity__name', flat=True)
                .distinct()
            )
        )
        fugitive_activities = sorted(
            list(
                EmissionCategoryMapping.objects.select_related('activity')
                .filter(emission_category__category_name='Fugitive emissions')
                .values_list('activity__name', flat=True)
                .distinct()
            )
        )
        industrial_process_activities = sorted(
            list(
                EmissionCategoryMapping.objects.select_related('activity')
                .filter(emission_category__category_name='Industrial process emissions')
                .values_list('activity__name', flat=True)
                .distinct()
            )
        )
        onsite_activities = sorted(
            list(
                EmissionCategoryMapping.objects.select_related('activity')
                .filter(emission_category__category_name='On-site transportation emissions')
                .values_list('activity__name', flat=True)
                .distinct()
            )
        )
        stationary_activities = sorted(
            list(
                EmissionCategoryMapping.objects.select_related('activity')
                .filter(emission_category__category_name='Stationary fuel combustion emissions')
                .values_list('activity__name', flat=True)
                .distinct()
            )
        )
        venting_useful_activities = sorted(
            list(
                EmissionCategoryMapping.objects.select_related('activity')
                .filter(emission_category__category_name='Venting emissions — useful')
                .values_list('activity__name', flat=True)
                .distinct()
            )
        )
        venting_non_useful_activities = sorted(
            list(
                EmissionCategoryMapping.objects.select_related('activity')
                .filter(emission_category__category_name='Venting emissions — non-useful')
                .values_list('activity__name', flat=True)
                .distinct()
            )
        )
        waste_activities = sorted(
            list(
                EmissionCategoryMapping.objects.select_related('activity')
                .filter(emission_category__category_name='Emissions from waste')
                .values_list('activity__name', flat=True)
                .distinct()
            )
        )
        wastewater_activities = sorted(
            list(
                EmissionCategoryMapping.objects.select_related('activity')
                .filter(emission_category__category_name='Emissions from wastewater')
                .values_list('activity__name', flat=True)
                .distinct()
            )
        )

        # FUEL EXCLUDED
        woody_biomass_activities = sorted(
            list(
                EmissionCategoryMapping.objects.select_related('activity')
                .filter(emission_category__category_name='CO2 emissions from excluded woody biomass')
                .values_list('activity__name', flat=True)
                .distinct()
            )
        )
        excluded_biomass_activities = sorted(
            list(
                EmissionCategoryMapping.objects.select_related('activity')
                .filter(emission_category__category_name='Other emissions from excluded biomass')
                .values_list('activity__name', flat=True)
                .distinct()
            )
        )
        excluded_nonbiomass_activities = sorted(
            list(
                EmissionCategoryMapping.objects.select_related('activity')
                .filter(emission_category__category_name='Emissions from excluded non-biomass')
                .values_list('activity__name', flat=True)
                .distinct()
            )
        )

        # OTHER
        lfo_line_tracing_activities = sorted(
            list(
                EmissionCategoryMapping.objects.select_related('activity')
                .filter(
                    emission_category__category_name='Emissions from line tracing and non-processing and non-compression activities'
                )
                .values_list('activity__name', flat=True)
                .distinct()
            )
        )

        self.assertEqual(
            flaring_activities,
            sorted(
                [
                    'Petrochemical production',
                    'Petroleum refining',
                    'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
                    'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
                    'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
                    'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
                    'LNG activities',
                ]
            ),
        )

        self.assertEqual(
            fugitive_activities,
            sorted(
                [
                    'Aluminum or alumina production',
                    'Underground coal mining',
                    'Coal storage at facilities that combust coal',
                    'Electricity generation',
                    'Electronics manufacturing',
                    'Magnesium production',
                    'Petrochemical production',
                    'Petroleum refining',
                    'Open pit coal mining',
                    'Storage of petroleum products',
                    'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
                    'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
                    'Electricity transmission',
                    'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
                    'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
                    'LNG activities',
                ]
            ),
        )

        self.assertEqual(
            industrial_process_activities,
            sorted(
                [
                    'Aluminum or alumina production',
                    'Ammonia production',
                    'Cement production',
                    'Copper or nickel smelting or refining',
                    'Electricity generation',
                    'Ferroalloy production',
                    'Glass manufacturing',
                    'Hydrogen production',
                    'Lead production',
                    'Lime manufacturing',
                    'Magnesium production',
                    'Nitric acid manufacturing',
                    'Petrochemical production',
                    'Petroleum refining',
                    'Phosphoric acid production',
                    'Pulp and paper production',
                    'Zinc production',
                    'Carbonate use',
                ]
            ),
        )

        self.assertEqual(
            onsite_activities,
            sorted(
                [
                    'Fuel combustion by mobile equipment',
                ]
            ),
        )

        self.assertEqual(
            stationary_activities,
            sorted(
                [
                    'General stationary combustion excluding line tracing',
                    'General stationary combustion solely for the purpose of line tracing',
                    'Electricity generation',
                    'Refinery fuel gas combustion',
                    'General stationary combustion, other than non-compression and non-processing combustion',
                    'General stationary non-compression and non-processing combustion',
                ]
            ),
        )

        self.assertEqual(
            venting_useful_activities,
            sorted(
                [
                    'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
                    'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
                    'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
                    'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
                    'LNG activities',
                ]
            ),
        )

        self.assertEqual(
            venting_non_useful_activities,
            sorted(
                [
                    'Petrochemical production',
                    'Petroleum refining',
                    'Oil and gas extraction and gas processing activities, other than non- compression and non-processing activities',
                    'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
                    'Activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission, other than non-compression and non-processing activities',
                    'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
                    'LNG activities',
                ]
            ),
        )

        self.assertEqual(
            waste_activities,
            sorted(
                [
                    'General stationary combustion excluding line tracing',
                    'General stationary combustion, other than non-compression and non-processing combustion',
                    'General stationary non-compression and non-processing combustion',
                ]
            ),
        )

        self.assertEqual(wastewater_activities, sorted(['Industrial wastewater processing', 'Petroleum refining']))

        # FUEL EXCLUDED
        self.assertEqual(
            woody_biomass_activities,
            sorted(
                [
                    'General stationary combustion excluding line tracing',
                    'General stationary combustion solely for the purpose of line tracing',
                    'Fuel combustion by mobile equipment',
                    'Electricity generation',
                    'Pulp and paper production',
                    'General stationary combustion, other than non-compression and non-processing combustion',
                    'General stationary non-compression and non-processing combustion',
                ]
            ),
        )

        self.assertEqual(
            excluded_biomass_activities,
            sorted(
                [
                    'General stationary combustion excluding line tracing',
                    'General stationary combustion solely for the purpose of line tracing',
                    'Fuel combustion by mobile equipment',
                    'Electricity generation',
                    'Pulp and paper production',
                    'General stationary combustion, other than non-compression and non-processing combustion',
                    'General stationary non-compression and non-processing combustion',
                ]
            ),
        )

        self.assertEqual(
            excluded_nonbiomass_activities,
            sorted(
                [
                    'General stationary combustion excluding line tracing',
                    'General stationary combustion solely for the purpose of line tracing',
                    'Fuel combustion by mobile equipment',
                    'Electricity generation',
                    'General stationary combustion, other than non-compression and non-processing combustion',
                    'General stationary non-compression and non-processing combustion',
                ]
            ),
        )

        # OTHER EXCLUDED
        self.assertEqual(
            lfo_line_tracing_activities,
            sorted(
                [
                    'General stationary combustion solely for the purpose of line tracing',
                    'General stationary non-compression and non-processing combustion',
                    'Non-compression and non-processing activities that are oil and gas extraction and gas processing activities',
                    'Non-compression and non-processing activities for the purpose of natural gas transmission, natural gas distribution, natural gas storage, carbon dioxide transportation or oil transmission',
                ]
            ),
        )

    def test_emission_category_mapping_correct_source_types(self):
        flaring_sources = sorted(
            list(
                EmissionCategoryMapping.objects.select_related('source_type')
                .filter(emission_category__category_name='Flaring emissions')
                .values_list('source_type__name', flat=True)
                .distinct()
            )
        )
        fugitive_sources = sorted(
            list(
                EmissionCategoryMapping.objects.select_related('source_type')
                .filter(emission_category__category_name='Fugitive emissions')
                .values_list('source_type__name', flat=True)
                .distinct()
            )
        )
        industrial_process_sources = sorted(
            list(
                EmissionCategoryMapping.objects.select_related('source_type')
                .filter(emission_category__category_name='Industrial process emissions')
                .values_list('source_type__name', flat=True)
                .distinct()
            )
        )
        onsite_sources = sorted(
            list(
                EmissionCategoryMapping.objects.select_related('source_type')
                .filter(emission_category__category_name='On-site transportation emissions')
                .values_list('source_type__name', flat=True)
                .distinct()
            )
        )
        stationary_sources = sorted(
            list(
                EmissionCategoryMapping.objects.select_related('source_type')
                .filter(emission_category__category_name='Stationary fuel combustion emissions')
                .values_list('source_type__name', flat=True)
                .distinct()
            )
        )
        venting_useful_sources = sorted(
            list(
                EmissionCategoryMapping.objects.select_related('source_type')
                .filter(emission_category__category_name='Venting emissions — useful')
                .values_list('source_type__name', flat=True)
                .distinct()
            )
        )
        venting_non_useful_sources = sorted(
            list(
                EmissionCategoryMapping.objects.select_related('source_type')
                .filter(emission_category__category_name='Venting emissions — non-useful')
                .values_list('source_type__name', flat=True)
                .distinct()
            )
        )
        waste_sources = sorted(
            list(
                EmissionCategoryMapping.objects.select_related('source_type')
                .filter(emission_category__category_name='Emissions from waste')
                .values_list('source_type__name', flat=True)
                .distinct()
            )
        )
        wastewater_sources = sorted(
            list(
                EmissionCategoryMapping.objects.select_related('source_type')
                .filter(emission_category__category_name='Emissions from wastewater')
                .values_list('source_type__name', flat=True)
                .distinct()
            )
        )

        # FUEL EXCLUDED
        woody_biomass_sources = sorted(
            list(
                EmissionCategoryMapping.objects.select_related('source_type')
                .filter(emission_category__category_name='CO2 emissions from excluded woody biomass')
                .values_list('source_type__name', flat=True)
                .distinct()
            )
        )
        excluded_biomass_sources = sorted(
            list(
                EmissionCategoryMapping.objects.select_related('source_type')
                .filter(emission_category__category_name='Other emissions from excluded biomass')
                .values_list('source_type__name', flat=True)
                .distinct()
            )
        )
        excluded_nonbiomass_sources = sorted(
            list(
                EmissionCategoryMapping.objects.select_related('source_type')
                .filter(emission_category__category_name='Emissions from excluded non-biomass')
                .values_list('source_type__name', flat=True)
                .distinct()
            )
        )

        # OTHER
        lfo_line_tracing_sources = sorted(
            list(
                EmissionCategoryMapping.objects.select_related('source_type')
                .filter(
                    emission_category__category_name='Emissions from line tracing and non-processing and non-compression activities'
                )
                .values_list('source_type__name', flat=True)
                .distinct()
            )
        )

        self.assertEqual(
            flaring_sources,
            sorted(
                [
                    'Flares and oxidizers',
                    'Ethylene production',
                    'Flares, the flare pilot, the combustion of purge gas and the destruction of low Btu gases',
                    'Associated gas flaring',
                    'Flaring stacks',
                    'Drilling flaring',
                    'Hydraulic fracturing flaring',
                    'Well testing flaring',
                    'Flare stacks',
                ]
            ),
        )

        self.assertEqual(
            fugitive_sources,
            sorted(
                [
                    'Cover gas from electrolysis cells',
                    'Coal when broken or exposed to the atmosphere during mining',
                    'Stored coal piles',
                    'Cooling units',
                    'Geothermal geyser steam or fluids',
                    'Installation, maintenance, operation and decommissioning of electrical equipment',
                    'Electronics manufacturing, including the cleaning of chemical vapour deposition chambers and plasma/dry etching processes',
                    'Cover gases or carrier gases in magnesium production',
                    'Equipment leaks',
                    'Above-ground storage tanks at refineries',
                    'Equipment leaks at refineries',
                    'Uncontrolled blowdown systems used at refineries',
                    'Above-ground storage tanks',
                    'Equipment leaks detected using leak detection and leaker emission factor methods',
                    'Population count sources',
                    'Produced water dissolved carbon dioxide and methane',
                    'Enhanced oil recovery produced hydrocarbon liquids dissolved carbon dioxide',
                    'Other fugitive sources',
                    'Third party line hits with release of gas',
                ]
            ),
        )

        self.assertEqual(
            industrial_process_sources,
            sorted(
                [
                    'Anode consumption in electrolysis cells, anode and cathode baking or green coke calcination',
                    'Anode effects',
                    'Steam reformation or gasification of a hydrocarbon during ammonia production',
                    'Calcination of limestone, shale, sand, slag or other raw materials used to produce clinker, as well as the oxidization of organic carbon in the raw material',
                    'Removal of impurities using carbonate flux reagents',
                    'Use of reducing agents',
                    'Use of material (e.g., coke) for slag cleaning and the consumption of graphite or carbon electrodes',
                    'The solvent extraction and electrowinning process, also known as SX-EW',
                    'Acid gas scrubbers and acid gas reagents',
                    'Removal of impurities using carbonate flux reagents, the use of reducing agents, the use of material (e.g. coke) for slag cleaning, and the consumption of graphite or carbon electrodes during ferroalloy production',
                    'Calcination of carbonate materials',
                    'Steam reformation of hydrocarbons, partial oxidation of hydrocarbons or other transformation of hydrocarbon feedstock',
                    'Use of reducing agents during lead production',
                    'Calcination of carbonate materials in lime manufacturing',
                    'Use of reducing agents in magnesium production',
                    'Catalytic oxidation, condensation and absorption processes during nitric acid manufacturing',
                    'Process units',
                    'Catalyst regeneration',
                    'Asphalt production',
                    'Sulphur recovery',
                    'Delayed coking units at refineries',
                    'Coke calcining at refineries',
                    'Reaction of calcium carbonate with sulphuric acid',
                    'Pulping and chemical recovery',
                    'Use of reducing agents during zinc production',
                    'Carbonates used but not consumed in other activities set out in column 2',
                ]
            ),
        )

        self.assertEqual(
            onsite_sources,
            sorted(['Fuel combustion by mobile equipment that is part of the facility']),
        )

        self.assertEqual(
            stationary_sources,
            sorted(
                [
                    'General stationary combustion of fuel or waste with production of useful energy',
                    'Fuel combustion for electricity generation',
                    'Combustion of refinery fuel gas, still gas, flexigas or associated gas',
                    'General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy',
                    'Field gas or process vent gas combustion at a linear facilities operation',
                ]
            ),
        )

        self.assertEqual(
            venting_useful_sources,
            sorted(
                [
                    'Natural gas pneumatic high bleed device venting',
                    'Natural gas pneumatic pump venting',
                    'Natural gas pneumatic low bleed device venting',
                    'Natural gas pneumatic intermittent bleed device venting',
                ]
            ),
        )

        self.assertEqual(
            venting_non_useful_sources,
            sorted(
                [
                    'Process vents',
                    'Loading operations at refineries and terminals',
                    'Acid gas removal venting or incineration',
                    'Dehydrator venting',
                    'Blowdown venting',
                    'Releases from tanks used for storage, production or processing',
                    'Associated gas venting',
                    'Centrifugal compressor venting',
                    'Reciprocating compressor venting',
                    'Transmission storage tanks',
                    'Enhanced oil recovery injection pump blowdowns',
                    'Other venting sources',
                    'Well venting for liquids unloading',
                    'Gas well venting during well completions and workovers with or without hydraulic fracturing',
                    'Drilling venting',
                    'Well testing venting',
                ]
            ),
        )

        self.assertEqual(
            waste_sources,
            sorted(
                [
                    'General stationary combustion of waste without production of useful energy',
                    'General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy',
                ]
            ),
        )

        self.assertEqual(
            wastewater_sources,
            sorted(
                [
                    'Industrial wastewater process using anaerobic digestion',
                    'Oil-water separators',
                    'Oil-water separators at refineries',
                    'Wastewater processing using anaerobic digestion at refineries',
                ]
            ),
        )

        self.assertEqual(
            woody_biomass_sources,
            sorted(
                [
                    'General stationary combustion of fuel or waste with production of useful energy',
                    'General stationary combustion of waste without production of useful energy',
                    'Fuel combustion by mobile equipment that is part of the facility',
                    'Fuel combustion for electricity generation',
                    'Pulping and chemical recovery',
                    'General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy',
                    'General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy',
                ]
            ),
        )

        self.assertEqual(
            excluded_biomass_sources,
            sorted(
                [
                    'General stationary combustion of fuel or waste with production of useful energy',
                    'General stationary combustion of waste without production of useful energy',
                    'Fuel combustion by mobile equipment that is part of the facility',
                    'Fuel combustion for electricity generation',
                    'Pulping and chemical recovery',
                    'General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy',
                    'General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy',
                ]
            ),
        )

        self.assertEqual(
            excluded_biomass_sources,
            sorted(
                [
                    'General stationary combustion of fuel or waste with production of useful energy',
                    'General stationary combustion of waste without production of useful energy',
                    'Fuel combustion by mobile equipment that is part of the facility',
                    'Fuel combustion for electricity generation',
                    'Pulping and chemical recovery',
                    'General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy',
                    'General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy',
                ]
            ),
        )

        self.assertEqual(
            excluded_nonbiomass_sources,
            sorted(
                [
                    'General stationary combustion of fuel or waste with production of useful energy',
                    'General stationary combustion of waste without production of useful energy',
                    'Fuel combustion by mobile equipment that is part of the facility',
                    'Fuel combustion for electricity generation',
                    'General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy',
                    'General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy',
                ]
            ),
        )

        self.assertEqual(
            lfo_line_tracing_sources,
            sorted(
                [
                    'General stationary combustion of fuel or waste with production of useful energy',
                    'General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy',
                    'Natural gas pneumatic high bleed device venting',
                    'Natural gas pneumatic pump venting',
                    'Natural gas pneumatic low bleed device venting',
                    'Natural gas pneumatic intermittent bleed device venting',
                    'Dehydrator venting',
                    'Well venting for liquids unloading',
                    'Gas well venting during well completions and workovers with or without hydraulic fracturing',
                    'Drilling flaring',
                    'Drilling venting',
                    'Hydraulic fracturing flaring',
                    'Blowdown venting',
                    'Releases from tanks used for storage, production or processing',
                    'Well testing venting',
                    'Well testing flaring',
                    'Associated gas venting',
                    'Associated gas flaring',
                    'Flaring stacks',
                    'Equipment leaks detected using leak detection and leaker emission factor methods',
                    'Population count sources',
                    'Transmission storage tanks',
                    'Enhanced oil recovery injection pump blowdowns',
                    'Produced water dissolved carbon dioxide and methane',
                    'Enhanced oil recovery produced hydrocarbon liquids dissolved carbon dioxide',
                    'Other venting sources',
                    'Other fugitive sources',
                    'Third party line hits with release of gas',
                    'Flare stacks',
                ]
            ),
        )


class EmissionCategoryModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = baker.make_recipe('reporting.tests.utils.emission_category_mapping')
        cls.field_data = [
            ("id", "ID", None, None),
            ("activity", "activity", None, None),
            ("source_type", "source type", None, None),
            ("emission_category", "emission category", None, None),
        ]
