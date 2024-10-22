from common.tests.utils.helpers import BaseTestCase
from reporting.models import EmissionCategoryMapping, SourceType
from registration.models import Activity
from django.test import TestCase
from django.db.models import Q
from model_bakery import baker


class TestInitialData(TestCase):
    def test_emission_category_mapping_number_of_records(self):
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

        self.assertEqual(flaring_count, 13)
        self.assertEqual(fugitive_count, 41)
        self.assertEqual(industrial_process_count, 26)
        self.assertEqual(onsite_count, 1)
        self.assertEqual(stationary_count, 8)
        self.assertEqual(venting_useful_count, 20)
        self.assertEqual(venting_non_useful_count, 41)
        self.assertEqual(waste_count, 3)
        self.assertEqual(wastewater_count, 4)

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
