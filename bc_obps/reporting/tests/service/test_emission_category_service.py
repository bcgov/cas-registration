from django.test import TestCase
from reporting.models.report_fuel import ReportFuel
from reporting.models.report_emission import ReportEmission
from reporting.models.report_source_type import ReportSourceType
from reporting.service.emission_category_service import EmissionCategoryService
from reporting.tests.service.test_report_activity_save_service.infrastructure import TestInfrastructure
from decimal import Decimal, getcontext
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
            json_data={"emission": 101},
        )

        report_emission_2 = make(
            ReportEmission,
            report_fuel=report_fuel,
            report_source_type=report_source_type,
            report_version=test_infrastructure.report_version,
            json_data={"emission": 99.4151},
        )

        # id 1 = Flaring
        report_emission.emission_categories.set([1])
        report_emission_2.emission_categories.set([1])
        # id 2 = Woody Biomass (should not be double counted)
        report_emission_2.emission_categories.set(
            [
                1,
            ]
        )

        flaring_return_value = EmissionCategoryService.get_total_emissions_by_emission_category(
            report_activity.facility_report.id, 1
        )
        assert flaring_return_value == Decimal('200.41510')

    def test_returns_correct_value_all_categories(self):
        getcontext().prec = 5  # Set precision to 5 to match our precision set in the report_emission model manager
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
            json_data={"emission": 100.00001},
        )

        report_emission_2 = make(
            ReportEmission,
            report_fuel=report_fuel,
            report_source_type=report_source_type,
            report_version=test_infrastructure.report_version,
            json_data={"emission": 200.00002},
        )

        report_emission_3 = make(
            ReportEmission,
            report_fuel=report_fuel,
            report_source_type=report_source_type,
            report_version=test_infrastructure.report_version,
            json_data={"emission": 300.00003},
        )

        report_emission_4 = make(
            ReportEmission,
            report_fuel=report_fuel,
            report_source_type=report_source_type,
            report_version=test_infrastructure.report_version,
            json_data={"emission": 400.00004},
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
        assert flaring_value == Decimal('300.00003')
        assert woody_biomass_value == Decimal('100.00001')
        assert excluded_non_biomass_value == Decimal('200.00002')

        report_emission_3.emission_categories.set([2])
        report_emission_4.emission_categories.set([2])
        fugitive_value = EmissionCategoryService.get_total_emissions_by_emission_category(
            report_activity.facility_report.id, 2
        )
        assert fugitive_value == Decimal('700.00007')

        all_categories = EmissionCategoryService.get_all_category_totals(report_activity.facility_report.id)
        assert all_categories == {
            'flaring': Decimal('300.00003'),
            'fugitive': Decimal('700.00007'),
            'industrial_process': 0,
            'onsite': 0,
            'stationary': 0,
            'venting_useful': 0,
            'venting_non_useful': 0,
            'waste': 0,
            'wastewater': 0,
            'woody_biomass': Decimal('100.00001'),
            'excluded_biomass': 0,
            'excluded_non_biomass': Decimal('200.00002'),
            'lfo_excluded': 0,
        }
