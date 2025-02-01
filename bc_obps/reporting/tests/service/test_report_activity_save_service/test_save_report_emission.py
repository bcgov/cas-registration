from unittest.mock import MagicMock, call, patch
from django.test import TestCase
import pytest
from reporting.models.gas_type import GasType
from reporting.models.report_fuel import ReportFuel
from reporting.models.emission_category_mapping import EmissionCategoryMapping
from reporting.models.emission_category import EmissionCategory
from reporting.models.report_source_type import ReportSourceType
from reporting.models.report_unit import ReportUnit
from reporting.service.report_activity_save_service import ReportActivitySaveService
from reporting.tests.service.test_report_activity_save_service.infrastructure import (
    TestInfrastructure,
)
from model_bakery.baker import make_recipe, make


class TestSaveReportEmission(TestCase):
    @patch("reporting.service.report_activity_save_service.ReportActivitySaveService.save_methodology")
    def test_save_emission(self, mock_save_methodology: MagicMock):
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
        report_unit = make(
            ReportUnit,
            report_source_type=report_source_type,
            report_version=test_infrastructure.report_version,
            json_data={"test_report_unit": "report_unit"},
        )
        report_fuel = make(
            ReportFuel,
            report_source_type=report_source_type,
            report_version=test_infrastructure.report_version,
            json_data={"test_report_unit": True},
            report_unit=None,
        )
        make_recipe("reporting.tests.utils.gas_type", chemical_formula="GGIRCA", gwp=100)

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
            service_under_test.save_emission(
                report_source_type,
                None,
                report_fuel,
                {"no_gas_type": True, "emission": 1},
            )
        with pytest.raises(GasType.DoesNotExist):
            service_under_test.save_emission(
                report_source_type,
                None,
                report_fuel,
                {"gasType": "gasTypeThatDoesntExist", "emission": 1},
            )

        with_none_report_fuel = service_under_test.save_emission(
            report_source_type,
            None,
            None,
            {
                "gasType": "GGIRCA",
                "emission": 1,
                "methodology": {"methodology": "Default HHV/Default EF"},
            },
        )
        assert with_none_report_fuel.report_fuel is None
        assert with_none_report_fuel.report_unit is None

        with_report_unit = service_under_test.save_emission(
            report_source_type,
            report_unit,
            None,
            {
                "gasType": "GGIRCA",
                "emission": 1,
                "methodology": {"methodology": "Default HHV/Default EF"},
            },
        )

        assert with_report_unit.report_fuel is None
        assert with_report_unit.report_unit == report_unit

        # With full data and methodology

        return_value = service_under_test.save_emission(
            report_source_type,
            None,
            report_fuel,
            {
                "test_emission_prop": "something",
                "gasType": "GGIRCA",
                "emission": 1,
                "methodology": {
                    "methodology": "Default HHV/Default EF",
                    "fuelDefaultHighHeatingValue": 10,
                    "unitFuelCo2DefaultEmissionFactor": 20,
                    "unitFuelCo2DefaultEmissionFactorFieldUnits": "kg/GJ",
                },
            },
        )

        assert return_value.json_data == {
            "test_emission_prop": "something",
            "emission": 1,
            "equivalentEmission": "100.0000",
        }
        assert return_value.report_source_type == report_source_type
        assert return_value.report_fuel == report_fuel
        assert return_value.report_version == test_infrastructure.report_version

        mock_save_methodology.assert_has_calls(
            [
                call(
                    return_value,
                    {
                        "methodology": "Default HHV/Default EF",
                        "fuelDefaultHighHeatingValue": 10,
                        "unitFuelCo2DefaultEmissionFactor": 20,
                        "unitFuelCo2DefaultEmissionFactorFieldUnits": "kg/GJ",
                    },
                ),
            ]
        )

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
        make_recipe("reporting.tests.utils.gas_type", chemical_formula="GGIRCA", gwp=100)

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
            None,
            report_fuel,
            {
                "test_emission_prop": "something",
                "gasType": "GGIRCA",
                "emission": 1,
                "methodology": {"id": 9003, "methodology": "Default HHV/Default EF"},
            },
        )
        make_recipe("reporting.tests.utils.gas_type", chemical_formula="BCOBPS", gwp=100)
        updated_return_value = service_under_test.save_emission(
            report_source_type,
            None,
            report_fuel,
            {
                "id": report_emission.id,
                "test_emission_prop": "new something",
                "gasType": "BCOBPS",
                "emission": 2,
                "methodology": {
                    "id": 9003,
                    "methodology": "Default EF",
                    "unitFuelCo2DefaultEmissionFactor": 3,
                    "unitFuelCo2DefaultEmissionFactorFieldUnits": "kg/GJ",
                },
            },
        )
        assert report_emission.id == updated_return_value.id
        assert updated_return_value.json_data == {
            "test_emission_prop": "new something",
            "emission": 2,
            "equivalentEmission": "200.0000",
        }
        assert updated_return_value.gas_type == GasType.objects.get(chemical_formula="BCOBPS")

    def test_save_equivalent_emission(self):
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
        make_recipe("reporting.tests.utils.gas_type", chemical_formula="GGIRCA", gwp=100)

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

        return_value = service_under_test.save_emission(
            report_source_type,
            None,
            report_fuel,
            {
                "test_emission_prop": "something",
                "gasType": "GGIRCA",
                "emission": "1.00123399",
                "methodology": {
                    "id": 9003,
                    "methodology": "Default EF",
                    "unitFuelCo2DefaultEmissionFactor": 3,
                    "unitFuelCo2DefaultEmissionFactorFieldUnits": "kg/GJ",
                },
            },
        )

        # Rounds to 4 decimal places and returns correct equivalentEmission value
        assert return_value.json_data["equivalentEmission"] == "100.1234"
