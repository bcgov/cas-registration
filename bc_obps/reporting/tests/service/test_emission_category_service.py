from django.test import TestCase
from reporting.models.report_fuel import ReportFuel
from reporting.models.report_emission import ReportEmission
from reporting.models.report_source_type import ReportSourceType
from reporting.service.emission_category_service import EmissionCategoryService
from reporting.tests.service.test_report_activity_save_service.infrastructure import TestInfrastructure
from decimal import Decimal
from model_bakery.baker import make


class TestEmissionCategoryService(TestCase):
    def test_aggregates_by_category(self):
        test_infrastructure = TestInfrastructure.build()
        act_st_1 = test_infrastructure.make_activity_source_type(
            source_type__json_key="sourceTypeWithUnitAndFuel",
            has_unit=True,
            has_fuel=True,
        )
        report_activity = test_infrastructure.make_report_activity()
        report_source_type = make(
            ReportSourceType,
            activity_source_type_base_schema=act_st_1,
            source_type=act_st_1.source_type,
            report_activity=report_activity,
            report_version=test_infrastructure.report_version,
            json_data={"test_report_source_type": "yes"},
        )
        report_fuel = make(
            ReportFuel,
            report_source_type=report_source_type,
            report_version=test_infrastructure.report_version,
            json_data={"test_report_unit": True},
            report_unit=None,
        )

        report_emission = make(
            ReportEmission,
            report_fuel=report_fuel,
            report_source_type=report_source_type,
            report_version=test_infrastructure.report_version,
            json_data={"equivalentEmission": 101},
        )

        report_emission_2 = make(
            ReportEmission,
            report_fuel=report_fuel,
            report_source_type=report_source_type,
            report_version=test_infrastructure.report_version,
            json_data={"equivalentEmission": 99.4151},
        )

        # id 1 = Flaring
        report_emission.emission_categories.set([1])
        report_emission_2.emission_categories.set([1])
        # id 2 = Woody Biomass (should not be double counted)
        report_emission_2.emission_categories.set([1])

        flaring_return_value = EmissionCategoryService.get_total_emissions_by_emission_category(
            report_activity.facility_report.id, 1
        )
        assert flaring_return_value == Decimal('200.4151')

    def test_returns_correct_value_all_categories(self):
        test_infrastructure = TestInfrastructure.build()
        act_st_1 = test_infrastructure.make_activity_source_type(
            source_type__json_key="sourceTypeWithUnitAndFuel",
            has_unit=True,
            has_fuel=True,
        )
        report_activity = test_infrastructure.make_report_activity()
        report_source_type = make(
            ReportSourceType,
            activity_source_type_base_schema=act_st_1,
            source_type=act_st_1.source_type,
            report_activity=report_activity,
            report_version=test_infrastructure.report_version,
            json_data={"test_report_source_type": "yes"},
        )
        report_fuel = make(
            ReportFuel,
            report_source_type=report_source_type,
            report_version=test_infrastructure.report_version,
            json_data={"test_report_unit": True},
            report_unit=None,
        )

        report_emission = make(
            ReportEmission,
            report_fuel=report_fuel,
            report_source_type=report_source_type,
            report_version=test_infrastructure.report_version,
            json_data={"equivalentEmission": 100.0001},
        )

        report_emission_2 = make(
            ReportEmission,
            report_fuel=report_fuel,
            report_source_type=report_source_type,
            report_version=test_infrastructure.report_version,
            json_data={"equivalentEmission": 200.0002},
        )

        report_emission_3 = make(
            ReportEmission,
            report_fuel=report_fuel,
            report_source_type=report_source_type,
            report_version=test_infrastructure.report_version,
            json_data={"equivalentEmission": 300.0003},
        )

        report_emission_4 = make(
            ReportEmission,
            report_fuel=report_fuel,
            report_source_type=report_source_type,
            report_version=test_infrastructure.report_version,
            json_data={"equivalentEmission": 400.0004},
        )

        report_emission.emission_categories.set([1, 10])
        report_emission_2.emission_categories.set([1, 12])
        flaring_value = EmissionCategoryService.get_total_emissions_by_emission_category(
            report_activity.facility_report.id, 1
        )
        woody_biomass_value = EmissionCategoryService.get_total_emissions_by_emission_category(
            report_activity.facility_report.id, 10
        )
        excluded_non_biomass_value = EmissionCategoryService.get_total_emissions_by_emission_category(
            report_activity.facility_report.id, 12
        )
        assert flaring_value == Decimal('300.0003')
        assert woody_biomass_value == Decimal('100.0001')
        assert excluded_non_biomass_value == Decimal('200.0002')

        report_emission_3.emission_categories.set([2])
        report_emission_4.emission_categories.set([2])
        fugitive_value = EmissionCategoryService.get_total_emissions_by_emission_category(
            report_activity.facility_report.id, 2
        )
        assert fugitive_value == Decimal('700.0007')

        all_categories = EmissionCategoryService.get_all_category_totals(report_activity.facility_report.id)
        assert all_categories == {
            'flaring': Decimal('300.0003'),
            'fugitive': Decimal('700.0007'),
            'industrial_process': 0,
            'onsite': 0,
            'stationary': 0,
            'venting_useful': 0,
            'venting_non_useful': 0,
            'waste': 0,
            'wastewater': 0,
            'woody_biomass': Decimal('100.0001'),
            'excluded_biomass': 0,
            'excluded_non_biomass': Decimal('200.0002'),
            'lfo_excluded': 0,
            'attributable_for_reporting': Decimal('1000.0010'),  # flaring + fugitive (addition of basic categories)
            'attributable_for_threshold': Decimal('900.0009'),  # basic - woody_biomass
            'reporting_only': Decimal(
                '1000.0010'
            ),  # fugitive + fuel_excluded + other_excluded - overlap (no overlaps in this scenario)
        }

    def test_reporting_only_emissions_counted_once(self):
        test_infrastructure = TestInfrastructure.build()
        act_st_1 = test_infrastructure.make_activity_source_type(
            source_type__json_key="sourceTypeWithUnitAndFuel",
            has_unit=True,
            has_fuel=True,
        )
        report_activity = test_infrastructure.make_report_activity()
        report_source_type = make(
            ReportSourceType,
            activity_source_type_base_schema=act_st_1,
            source_type=act_st_1.source_type,
            report_activity=report_activity,
            report_version=test_infrastructure.report_version,
            json_data={"test_report_source_type": "yes"},
        )
        report_fuel = make(
            ReportFuel,
            report_source_type=report_source_type,
            report_version=test_infrastructure.report_version,
            json_data={"test_report_unit": True},
            report_unit=None,
        )

        report_emission = make(
            ReportEmission,
            report_fuel=report_fuel,
            report_source_type=report_source_type,
            report_version=test_infrastructure.report_version,
            json_data={"equivalentEmission": 100.0001},
        )

        report_emission_2 = make(
            ReportEmission,
            report_fuel=report_fuel,
            report_source_type=report_source_type,
            report_version=test_infrastructure.report_version,
            json_data={"equivalentEmission": 200.0002},
        )

        report_emission_3 = make(
            ReportEmission,
            report_fuel=report_fuel,
            report_source_type=report_source_type,
            report_version=test_infrastructure.report_version,
            json_data={"equivalentEmission": 300.00029},
        )

        report_emission.emission_categories.set([2, 10, 11, 12, 13, 14]),
        report_emission_2.emission_categories.set([2, 10, 11]),
        report_emission_3.emission_categories.set([12, 13, 14])
        reporting_only_emisisons = EmissionCategoryService.get_reporting_only_emissions(
            report_activity.facility_report.id
        )
        # Each report_emission record was counted only once despite sharing categories that contribue to the reporting_only emissions total
        # Should be: (report_emission_1 + report_emission_2 + report_emission_3)
        assert reporting_only_emisisons == Decimal('600.0006')

    def test_aggregates_by_category_by_operation(self):
        test_infrastructure = TestInfrastructure.build_from_real_config()
        ti2 = TestInfrastructure.build_with_defined_report_version(test_infrastructure.report_version)

        act_st_1 = test_infrastructure.make_activity_source_type(
            source_type__json_key="sourceTypeWithUnitAndFuel",
            has_unit=True,
            has_fuel=True,
        )
        act_st_2 = ti2.make_activity_source_type(
            source_type__json_key="sourceTypeWithUnitAndFuelb",
            has_unit=True,
            has_fuel=True,
        )

        report_activity = test_infrastructure.make_report_activity()
        report_activity_2 = ti2.make_report_activity()

        report_source_type = make(
            ReportSourceType,
            activity_source_type_base_schema=act_st_1,
            source_type=act_st_1.source_type,
            report_activity=report_activity,
            report_version=test_infrastructure.report_version,
            json_data={"test_report_source_type": "yes"},
        )
        report_source_type_2 = make(
            ReportSourceType,
            activity_source_type_base_schema=act_st_2,
            source_type=act_st_2.source_type,
            report_activity=report_activity_2,
            report_version=ti2.report_version,
            json_data={"test_report_source_type": "yes"},
        )

        report_fuel = make(
            ReportFuel,
            report_source_type=report_source_type,
            report_version=test_infrastructure.report_version,
            json_data={"test_report_unit": True},
            report_unit=None,
        )
        report_fuel_2 = make(
            ReportFuel,
            report_source_type=report_source_type_2,
            report_version=ti2.report_version,
            json_data={"test_report_unit": True},
            report_unit=None,
        )

        report_emission = make(
            ReportEmission,
            report_fuel=report_fuel,
            report_source_type=report_source_type,
            report_version=test_infrastructure.report_version,
            json_data={"equivalentEmission": 101},
        )

        report_emission_2 = make(
            ReportEmission,
            report_fuel=report_fuel,
            report_source_type=report_source_type,
            report_version=test_infrastructure.report_version,
            json_data={"equivalentEmission": 99.4151},
        )

        report_emission_a = make(
            ReportEmission,
            report_fuel=report_fuel_2,
            report_source_type=report_source_type_2,
            report_version=ti2.report_version,
            json_data={"equivalentEmission": 45},
        )

        report_emission_b = make(
            ReportEmission,
            report_fuel=report_fuel_2,
            report_source_type=report_source_type_2,
            report_version=ti2.report_version,
            json_data={"equivalentEmission": 55},
        )

        # id 1 = Flaring
        # id 2 = Fugitive
        report_emission.emission_categories.set([1])
        report_emission_2.emission_categories.set([1])
        report_emission_a.emission_categories.set([1])
        report_emission_b.emission_categories.set([1])

        # assert that emissions are properly aggregated by faclity before checking operation
        ti1_flaring_return_value = EmissionCategoryService.get_total_emissions_by_emission_category(
            report_activity.facility_report.id, 1
        )
        ti2_flaring_return_value = EmissionCategoryService.get_total_emissions_by_emission_category(
            report_activity_2.facility_report.id, 1
        )
        assert ti1_flaring_return_value == Decimal('200.4151')
        assert ti2_flaring_return_value == Decimal('100')

        # assert that the emissions from different facilities are properly aggregated by operation
        operation_summary = EmissionCategoryService.get_emission_category_totals_by_operation(
            test_infrastructure.report_version.id
        )
        assert operation_summary == {
            'flaring': Decimal('300.4151'),
            'fugitive': 0,
            'industrial_process': 0,
            'onsite': 0,
            'stationary': 0,
            'venting_useful': 0,
            'venting_non_useful': 0,
            'waste': 0,
            'wastewater': 0,
            'woody_biomass': 0,
            'excluded_biomass': 0,
            'excluded_non_biomass': 0,
            'lfo_excluded': 0,
            'attributable_for_reporting': Decimal('300.4151'),
            'attributable_for_threshold': Decimal('300.4151'),
            'reporting_only': 0,
        }
