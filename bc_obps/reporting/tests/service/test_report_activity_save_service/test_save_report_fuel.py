from unittest.mock import MagicMock, call, patch
from django.test import TestCase
import pytest
from reporting.models.fuel_type import FuelType
from reporting.models.report_source_type import ReportSourceType
from reporting.models.report_unit import ReportUnit
from reporting.service.report_activity_save_service import ReportActivitySaveService
from reporting.tests.service.test_report_activity_save_service.infrastructure import TestInfrastructure
from model_bakery.baker import make_recipe, make


class TestSaveReportFuel(TestCase):

    @patch("reporting.service.report_activity_save_service.ReportActivitySaveService.save_emission")
    def test_save_fuel(self, mock_save_emission: MagicMock):
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
            json_data={"test_report_unit": True},
        )
        fuel_type = make_recipe("reporting.tests.utils.fuel_type", name="Test Fuel Type")

        service_under_test = ReportActivitySaveService(
            report_activity.report_version.id,
            report_activity.facility_report.facility.id,
            report_activity.activity.id,
            make_recipe('registration.tests.utils.industry_operator_user'),
        )

        with pytest.raises(KeyError, match="fuelName"):
            service_under_test.save_fuel(report_source_type, report_unit, {"no_fuel_name": True})
        with pytest.raises(FuelType.DoesNotExist):
            service_under_test.save_fuel(report_source_type, report_unit, {"fuelName": "fuelThatDoesntExist"})
        with pytest.raises(ValueError, match="Fuel is expecting emission data"):
            service_under_test.save_fuel(
                report_source_type, report_unit, {"fuelName": "Test Fuel Type", "no_emission_data": True}
            )

        with_none_report_unit = service_under_test.save_fuel(
            report_source_type, None, {"fuelName": fuel_type.name, "emissions": []}
        )

        assert with_none_report_unit.report_unit is None

        return_value = service_under_test.save_fuel(
            report_source_type,
            report_unit,
            {
                "test_fuel_prop": "fuel_value",
                "fuelName": fuel_type.name,
                "emissions": [{"small_emission": 1}, {"large_emission": 2}],
            },
        )

        assert return_value.json_data == {"test_fuel_prop": "fuel_value"}
        assert return_value.report_source_type == report_source_type
        assert return_value.report_unit == report_unit
        assert return_value.report_version == test_infrastructure.report_version

        mock_save_emission.assert_has_calls(
            [
                call(report_source_type, return_value, {"small_emission": 1}),
                call(report_source_type, return_value, {"large_emission": 2}),
            ]
        )

    def test_removes_deleted_emissions(self):
        raise
