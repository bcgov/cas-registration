from django.test import TestCase
from reporting.models.report_fuel import ReportFuel
from reporting.models.report_emission import ReportEmission
from reporting.models.report_source_type import ReportSourceType
from reporting.service.emission_category_service import EmissionCategoryService
from reporting.tests.service.test_report_activity_save_service.infrastructure import TestInfrastructure
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

        flaring_return_value = EmissionCategoryService.get_flaring_emission_category_total(
            report_activity.facility_report.id
        )
        assert flaring_return_value == 200.41510

    def test_ignores_other_categ(self):
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

        report_emission.emission_categories.set([1])
        report_emission_2.emission_categories.set([1])

        return_value = EmissionCategoryService.get_flaring_emission_category_total(report_activity.facility_report.id)
        assert return_value == 200.41510
