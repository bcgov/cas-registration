from django.test import TestCase
from reporting.models.report_fuel import ReportFuel
from reporting.models.report_source_type import ReportSourceType
from reporting.models.source_type import SourceType
from reporting.models.fuel_type import FuelType
from reporting.service.report_activity_save_service import ReportActivitySaveService
from reporting.tests.service.test_report_activity_save_service.infrastructure import (
    TestInfrastructure,
)
from model_bakery.baker import make_recipe, make


class TestSaveReportEmission(TestCase):
    def test_apply_emission_categories(self):
        test_infrastructure = TestInfrastructure.build()
        act_st = test_infrastructure.make_activity_source_type(
            source_type__json_key="sourceTypeWithUnitAndFuel",
            has_unit=True,
            has_fuel=True,
        )
        report_activity = test_infrastructure.make_report_activity(activity_id=1)
        report_source_type = make(
            ReportSourceType,
            activity_source_type_base_schema=act_st,
            source_type=SourceType.objects.get(pk=1),
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
            # Woody Biomass Fuel
            fuel_type=FuelType.objects.get(pk=11),
        )
        make_recipe("reporting.tests.utils.gas_type", chemical_formula="GGIRCA")

        service_under_test = ReportActivitySaveService(
            report_activity.report_version.id,
            report_activity.facility_report.facility.id,
            report_activity.activity.id,
            test_infrastructure.user.user_guid,
        )

        return_value = service_under_test.save_emission(
            report_source_type,
            None,
            report_fuel,
            {
                "test_emission_prop": "something",
                "gasType": "GGIRCA",
                "emission": 1,
                "methodology": {"methodology": "Default HHV/Default EF"},
            },
        )

        assert len(return_value.emission_categories.all()) == 2
        assert (
            return_value.emission_categories.get(category_type="basic").category_name
            == "Stationary fuel combustion emissions"
        )
        assert (
            return_value.emission_categories.get(category_type="fuel_excluded").category_name
            == "CO2 emissions from excluded woody biomass"
        )

    def test_update_emission_categories(self):
        test_infrastructure = TestInfrastructure.build()
        act_st = test_infrastructure.make_activity_source_type(
            source_type__json_key="sourceTypeWithUnitAndFuel",
            has_unit=True,
            has_fuel=True,
        )
        report_activity = test_infrastructure.make_report_activity(activity_id=1)
        report_source_type = make(
            ReportSourceType,
            activity_source_type_base_schema=act_st,
            source_type=SourceType.objects.get(pk=1),
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
            # Woody Biomass Fuel
            fuel_type=FuelType.objects.get(pk=11),
        )
        make_recipe("reporting.tests.utils.gas_type", chemical_formula="GGIRCA")

        service_under_test = ReportActivitySaveService(
            report_activity.report_version.id,
            report_activity.facility_report.facility.id,
            report_activity.activity.id,
            test_infrastructure.user.user_guid,
        )

        return_value = service_under_test.save_emission(
            report_source_type,
            None,
            report_fuel,
            {
                "test_emission_prop": "something",
                "gasType": "GGIRCA",
                "emission": 1,
                "methodology": {"id": 9002, "methodology": "Default HHV/Default EF"},
            },
        )

        assert len(return_value.emission_categories.all()) == 2
        assert (
            return_value.emission_categories.get(category_type="basic").category_name
            == "Stationary fuel combustion emissions"
        )
        assert (
            return_value.emission_categories.get(category_type="fuel_excluded").category_name
            == "CO2 emissions from excluded woody biomass"
        )

        updated_report_fuel = make(
            ReportFuel,
            report_source_type=report_source_type,
            report_version=test_infrastructure.report_version,
            json_data={"test_report_unit": True},
            report_unit=None,
            # Other Exempted Biomass Fuel
            fuel_type=FuelType.objects.get(pk=19),
        )

        updated_value = service_under_test.save_emission(
            report_source_type,
            None,
            updated_report_fuel,
            {
                "test_emission_prop": "something",
                "gasType": "GGIRCA",
                "emission": 1,
                "methodology": {"id": 9002, "methodology": "Default HHV/Default EF"},
            },
        )

        # Categories were properly updated
        assert len(updated_value.emission_categories.all()) == 2
        assert (
            updated_value.emission_categories.get(category_type="basic").category_name
            == "Stationary fuel combustion emissions"
        )
        assert (
            updated_value.emission_categories.get(category_type="fuel_excluded").category_name
            == "Other emissions from excluded biomass"
        )

    def test_flaring_category(self):
        test_infrastructure = TestInfrastructure.build()
        act_st = test_infrastructure.make_activity_source_type(
            source_type__json_key="sourceTypeWithUnitAndFuel",
            has_unit=True,
            has_fuel=True,
        )
        report_activity = test_infrastructure.make_report_activity(activity_id=20)
        report_source_type = make(
            ReportSourceType,
            activity_source_type_base_schema=act_st,
            source_type=SourceType.objects.get(pk=31),
            report_activity=report_activity,
            report_version=test_infrastructure.report_version,
            json_data={"test_report_source_type": "yes"},
        )
        make_recipe("reporting.tests.utils.gas_type", chemical_formula="GGIRCA")

        service_under_test = ReportActivitySaveService(
            report_activity.report_version.id,
            report_activity.facility_report.facility.id,
            report_activity.activity.id,
            test_infrastructure.user.user_guid,
        )

        return_value = service_under_test.save_emission(
            report_source_type,
            None,
            None,
            {
                "test_emission_prop": "something",
                "gasType": "GGIRCA",
                "emission": 1,
                "methodology": {"methodology": "Default HHV/Default EF"},
            },
        )

        assert len(return_value.emission_categories.all()) == 1
        assert return_value.emission_categories.get(category_type="basic").category_name == "Flaring emissions"

    def test_fugitive_category(self):
        test_infrastructure = TestInfrastructure.build()
        act_st = test_infrastructure.make_activity_source_type(
            source_type__json_key="sourceTypeWithUnitAndFuel",
            has_unit=True,
            has_fuel=True,
        )
        report_activity = test_infrastructure.make_report_activity(activity_id=4)
        report_source_type = make(
            ReportSourceType,
            activity_source_type_base_schema=act_st,
            source_type=SourceType.objects.get(pk=6),
            report_activity=report_activity,
            report_version=test_infrastructure.report_version,
            json_data={"test_report_source_type": "yes"},
        )
        make_recipe("reporting.tests.utils.gas_type", chemical_formula="GGIRCA")

        service_under_test = ReportActivitySaveService(
            report_activity.report_version.id,
            report_activity.facility_report.facility.id,
            report_activity.activity.id,
            test_infrastructure.user.user_guid,
        )

        return_value = service_under_test.save_emission(
            report_source_type,
            None,
            None,
            {
                "test_emission_prop": "something",
                "gasType": "GGIRCA",
                "emission": 1,
                "methodology": {"methodology": "Default HHV/Default EF"},
            },
        )

        assert len(return_value.emission_categories.all()) == 1
        assert return_value.emission_categories.get(category_type="basic").category_name == "Fugitive emissions"

    def test_industrial_process_category(self):
        test_infrastructure = TestInfrastructure.build()
        act_st = test_infrastructure.make_activity_source_type(
            source_type__json_key="sourceTypeWithUnitAndFuel",
            has_unit=True,
            has_fuel=True,
        )
        report_activity = test_infrastructure.make_report_activity(activity_id=9)
        report_source_type = make(
            ReportSourceType,
            activity_source_type_base_schema=act_st,
            source_type=SourceType.objects.get(pk=14),
            report_activity=report_activity,
            report_version=test_infrastructure.report_version,
            json_data={"test_report_source_type": "yes"},
        )
        make_recipe("reporting.tests.utils.gas_type", chemical_formula="GGIRCA")

        service_under_test = ReportActivitySaveService(
            report_activity.report_version.id,
            report_activity.facility_report.facility.id,
            report_activity.activity.id,
            test_infrastructure.user.user_guid,
        )

        return_value = service_under_test.save_emission(
            report_source_type,
            None,
            None,
            {
                "test_emission_prop": "something",
                "gasType": "GGIRCA",
                "emission": 1,
                "methodology": {"methodology": "Default HHV/Default EF"},
            },
        )

        assert len(return_value.emission_categories.all()) == 1
        assert (
            return_value.emission_categories.get(category_type="basic").category_name == "Industrial process emissions"
        )

    def test_onsite_transportation_category(self):
        test_infrastructure = TestInfrastructure.build()
        act_st = test_infrastructure.make_activity_source_type(
            source_type__json_key="sourceTypeWithUnitAndFuel",
            has_unit=True,
            has_fuel=True,
        )
        report_activity = test_infrastructure.make_report_activity(activity_id=3)
        report_source_type = make(
            ReportSourceType,
            activity_source_type_base_schema=act_st,
            source_type=SourceType.objects.get(pk=3),
            report_activity=report_activity,
            report_version=test_infrastructure.report_version,
            json_data={"test_report_source_type": "yes"},
        )
        make_recipe("reporting.tests.utils.gas_type", chemical_formula="GGIRCA")

        service_under_test = ReportActivitySaveService(
            report_activity.report_version.id,
            report_activity.facility_report.facility.id,
            report_activity.activity.id,
            test_infrastructure.user.user_guid,
        )

        return_value = service_under_test.save_emission(
            report_source_type,
            None,
            None,
            {
                "test_emission_prop": "something",
                "gasType": "GGIRCA",
                "emission": 1,
                "methodology": {"methodology": "Default HHV/Default EF"},
            },
        )

        assert len(return_value.emission_categories.all()) == 1
        assert (
            return_value.emission_categories.get(category_type="basic").category_name
            == "On-site transportation emissions"
        )

    def test_venting_useful_category(self):
        test_infrastructure = TestInfrastructure.build()
        act_st = test_infrastructure.make_activity_source_type(
            source_type__json_key="sourceTypeWithUnitAndFuel",
            has_unit=True,
            has_fuel=True,
        )
        report_activity = test_infrastructure.make_report_activity(activity_id=33)
        report_source_type = make(
            ReportSourceType,
            activity_source_type_base_schema=act_st,
            source_type=SourceType.objects.get(pk=57),
            report_activity=report_activity,
            report_version=test_infrastructure.report_version,
            json_data={"test_report_source_type": "yes"},
        )
        make_recipe("reporting.tests.utils.gas_type", chemical_formula="GGIRCA")

        service_under_test = ReportActivitySaveService(
            report_activity.report_version.id,
            report_activity.facility_report.facility.id,
            report_activity.activity.id,
            test_infrastructure.user.user_guid,
        )

        return_value = service_under_test.save_emission(
            report_source_type,
            None,
            None,
            {
                "test_emission_prop": "something",
                "gasType": "GGIRCA",
                "emission": 1,
                "methodology": {"methodology": "Default HHV/Default EF"},
            },
        )

        assert len(return_value.emission_categories.all()) == 1
        assert return_value.emission_categories.get(category_type="basic").category_name == "Venting emissions — useful"

    def test_venting_non_useful_category(self):
        test_infrastructure = TestInfrastructure.build()
        act_st = test_infrastructure.make_activity_source_type(
            source_type__json_key="sourceTypeWithUnitAndFuel",
            has_unit=True,
            has_fuel=True,
        )
        report_activity = test_infrastructure.make_report_activity(activity_id=20)
        report_source_type = make(
            ReportSourceType,
            activity_source_type_base_schema=act_st,
            source_type=SourceType.objects.get(pk=32),
            report_activity=report_activity,
            report_version=test_infrastructure.report_version,
            json_data={"test_report_source_type": "yes"},
        )
        make_recipe("reporting.tests.utils.gas_type", chemical_formula="GGIRCA")

        service_under_test = ReportActivitySaveService(
            report_activity.report_version.id,
            report_activity.facility_report.facility.id,
            report_activity.activity.id,
            test_infrastructure.user.user_guid,
        )

        return_value = service_under_test.save_emission(
            report_source_type,
            None,
            None,
            {
                "test_emission_prop": "something",
                "gasType": "GGIRCA",
                "emission": 1,
                "methodology": {"methodology": "Default HHV/Default EF"},
            },
        )

        assert len(return_value.emission_categories.all()) == 1
        assert (
            return_value.emission_categories.get(category_type="basic").category_name
            == "Venting emissions — non-useful"
        )

    def test_waste_category(self):
        test_infrastructure = TestInfrastructure.build()
        act_st = test_infrastructure.make_activity_source_type(
            source_type__json_key="sourceTypeWithUnitAndFuel",
            has_unit=True,
            has_fuel=True,
        )
        report_activity = test_infrastructure.make_report_activity(activity_id=31)
        report_source_type = make(
            ReportSourceType,
            activity_source_type_base_schema=act_st,
            source_type=SourceType.objects.get(pk=55),
            report_activity=report_activity,
            report_version=test_infrastructure.report_version,
            json_data={"test_report_source_type": "yes"},
        )
        make_recipe("reporting.tests.utils.gas_type", chemical_formula="GGIRCA")

        service_under_test = ReportActivitySaveService(
            report_activity.report_version.id,
            report_activity.facility_report.facility.id,
            report_activity.activity.id,
            test_infrastructure.user.user_guid,
        )

        return_value = service_under_test.save_emission(
            report_source_type,
            None,
            None,
            {
                "test_emission_prop": "something",
                "gasType": "GGIRCA",
                "emission": 1,
                "methodology": {"methodology": "Default HHV/Default EF"},
            },
        )

        assert len(return_value.emission_categories.all()) == 1
        assert return_value.emission_categories.get(category_type="basic").category_name == "Emissions from waste"

    def test_wastewater_category(self):
        test_infrastructure = TestInfrastructure.build()
        act_st = test_infrastructure.make_activity_source_type(
            source_type__json_key="sourceTypeWithUnitAndFuel",
            has_unit=True,
            has_fuel=True,
        )
        report_activity = test_infrastructure.make_report_activity(activity_id=21)
        report_source_type = make(
            ReportSourceType,
            activity_source_type_base_schema=act_st,
            source_type=SourceType.objects.get(pk=43),
            report_activity=report_activity,
            report_version=test_infrastructure.report_version,
            json_data={"test_report_source_type": "yes"},
        )
        make_recipe("reporting.tests.utils.gas_type", chemical_formula="GGIRCA")

        service_under_test = ReportActivitySaveService(
            report_activity.report_version.id,
            report_activity.facility_report.facility.id,
            report_activity.activity.id,
            test_infrastructure.user.user_guid,
        )

        return_value = service_under_test.save_emission(
            report_source_type,
            None,
            None,
            {
                "test_emission_prop": "something",
                "gasType": "GGIRCA",
                "emission": 1,
                "methodology": {"methodology": "Default HHV/Default EF"},
            },
        )

        assert len(return_value.emission_categories.all()) == 1
        assert return_value.emission_categories.get(category_type="basic").category_name == "Emissions from wastewater"

    def test_pulp_and_paper_exception(self):
        pulp_paper_activity_id = 23
        pulping_source_type_id = 49
        test_infrastructure = TestInfrastructure.build()
        act_st = test_infrastructure.make_activity_source_type(
            source_type__json_key="sourceTypeWithUnitAndFuel",
            has_unit=True,
            has_fuel=True,
        )
        report_activity = test_infrastructure.make_report_activity(activity_id=pulp_paper_activity_id)
        report_source_type = make(
            ReportSourceType,
            activity_source_type_base_schema=act_st,
            source_type=SourceType.objects.get(pk=pulping_source_type_id),
            report_activity=report_activity,
            report_version=test_infrastructure.report_version,
            json_data={"test_report_source_type": "yes"},
        )
        make_recipe("reporting.tests.utils.gas_type", chemical_formula="GGIRCA")

        service_under_test = ReportActivitySaveService(
            report_activity.report_version.id,
            report_activity.facility_report.facility.id,
            report_activity.activity.id,
            test_infrastructure.user.user_guid,
        )

        return_value = service_under_test.save_emission(
            report_source_type,
            None,
            None,
            {
                "test_emission_prop": "something",
                "gasType": "GGIRCA",
                "emission": 1,
                "methodology": {
                    "methodology": "Replacement Methodology",
                    'description': 'test description',
                    'isWoodyBiomass': True,
                },
            },
        )
        assert len(return_value.emission_categories.all()) == 2
        assert (
            return_value.emission_categories.get(category_type="fuel_excluded").category_name
            == "CO2 emissions from excluded woody biomass"
        )
