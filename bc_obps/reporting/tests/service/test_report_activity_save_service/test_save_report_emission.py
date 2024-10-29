from django.test import TestCase
import pytest
from reporting.models.gas_type import GasType
from reporting.models.report_fuel import ReportFuel
from reporting.models.emission_category_mapping import EmissionCategoryMapping
from reporting.models.emission_category import EmissionCategory
from reporting.models.report_source_type import ReportSourceType
from reporting.service.report_activity_save_service import ReportActivitySaveService
from reporting.tests.service.test_report_activity_save_service.infrastructure import TestInfrastructure
from model_bakery.baker import make_recipe, make


class TestSaveReportEmission(TestCase):
    def test_save_emission(self):
        test_infrastructure = TestInfrastructure.build()
        act_st = test_infrastructure.make_activity_source_type(
            source_type__json_key="sourceTypeWithUnitAndFuel",
            has_unit=True,
            has_fuel=True,
        )
        report_activity = test_infrastructure.make_report_activity()
        report_source_type = make(
            ReportSourceType,
            activity_source_type_base_schema=act_st,
            source_type=act_st.source_type,
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
        make_recipe("reporting.tests.utils.gas_type", chemical_formula="GGIRCA")

        service_under_test = ReportActivitySaveService(
            report_activity.report_version.id,
            report_activity.facility_report.facility.id,
            report_activity.activity.id,
            test_infrastructure.user.user_guid,
        )

        # Ensure there is a mapped emission category for the activity/source type pair created above
        make(
            EmissionCategoryMapping,
            activity=report_activity.activity,
            source_type=report_source_type.source_type,
            emission_category=EmissionCategory.objects.get(pk=1),
        )

        with pytest.raises(KeyError, match="gasType"):
            service_under_test.save_emission(report_source_type, report_fuel, {"no_gas_type": True})
        with pytest.raises(GasType.DoesNotExist):
            service_under_test.save_emission(report_source_type, report_fuel, {"gasType": "gasTypeThatDoesntExist"})

        with_none_report_fuel = service_under_test.save_emission(
            report_source_type, None, {"gasType": "GGIRCA", "methodology": {"methodology": "Default HHV/Default EF"}}
        )
        assert with_none_report_fuel.report_fuel is None

        return_value = service_under_test.save_emission(
            report_source_type,
            report_fuel,
            {
                "test_emission_prop": "something",
                "gasType": "GGIRCA",
                "methodology": {"methodology": "Default HHV/Default EF"},
            },
        )

        assert return_value.json_data == {"test_emission_prop": "something"}
        assert return_value.report_source_type == report_source_type
        assert return_value.report_fuel == report_fuel
        assert return_value.report_version == test_infrastructure.report_version

        return_value.refresh_from_db()
        assert return_value.created_by == test_infrastructure.user
        assert return_value.updated_by is None

    def test_update_emission(self):
        test_infrastructure = TestInfrastructure.build()
        act_st = test_infrastructure.make_activity_source_type(
            source_type__json_key="sourceTypeWithUnitAndFuel",
            has_unit=True,
            has_fuel=True,
        )
        report_activity = test_infrastructure.make_report_activity()
        report_source_type = make(
            ReportSourceType,
            activity_source_type_base_schema=act_st,
            source_type=act_st.source_type,
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
        make_recipe("reporting.tests.utils.gas_type", chemical_formula="GGIRCA")

        service_under_test = ReportActivitySaveService(
            report_activity.report_version.id,
            report_activity.facility_report.facility.id,
            report_activity.activity.id,
            test_infrastructure.user.user_guid,
        )

        # Ensure there is a mapped emission category for the activity/source type pair created above
        make(
            EmissionCategoryMapping,
            activity=report_activity.activity,
            source_type=report_source_type.source_type,
            emission_category=EmissionCategory.objects.get(pk=1),
        )

        report_emission = service_under_test.save_emission(
            report_source_type,
            report_fuel,
            {
                "test_emission_prop": "something",
                "gasType": "GGIRCA",
                "methodology": {"methodology": "Default HHV/Default EF"},
            },
        )

        make_recipe("reporting.tests.utils.gas_type", chemical_formula="BCOBPS")
        updated_return_value = service_under_test.save_emission(
            report_source_type,
            report_fuel,
            {
                "id": report_emission.id,
                "test_emission_prop": "new something",
                "gasType": "BCOBPS",
                "methodology": {"methodology": "Default HHV/Default EF"},
            },
        )

        assert report_emission.id == updated_return_value.id
        assert updated_return_value.json_data == {"test_emission_prop": "new something"}
        assert updated_return_value.gas_type == GasType.objects.get(chemical_formula="BCOBPS")

        updated_return_value.refresh_from_db()
        assert updated_return_value.created_by == test_infrastructure.user
        assert updated_return_value.updated_by == test_infrastructure.user
