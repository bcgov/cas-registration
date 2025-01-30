from unittest.mock import MagicMock, call, patch
from django.test import TestCase
import pytest
from reporting.models.fuel_type import FuelType
from reporting.models.report_emission import ReportEmission
from reporting.models.report_source_type import ReportSourceType
from reporting.models.report_unit import ReportUnit
from reporting.service.report_activity_save_service import ReportActivitySaveService
from reporting.tests.service.test_report_activity_save_service.infrastructure import (
    TestInfrastructure,
)
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
            test_infrastructure.user.user_guid,
        )

        with pytest.raises(KeyError, match="fuelType"):
            service_under_test.save_fuel(report_source_type, report_unit, {"no_fuel_type": True})
        with pytest.raises(FuelType.DoesNotExist):
            service_under_test.save_fuel(
                report_source_type,
                report_unit,
                {"fuelType": {"fuelName": "fuelThatDoesntExist"}},
            )
        with pytest.raises(ValueError, match="Fuel is expecting emission data"):
            service_under_test.save_fuel(
                report_source_type,
                report_unit,
                {"fuelType": {"fuelName": "Test Fuel Type"}, "no_emission_data": True},
            )

        with_none_report_unit = service_under_test.save_fuel(
            report_source_type,
            None,
            {"fuelType": {"fuelName": fuel_type.name}, "emissions": []},
        )

        assert with_none_report_unit.report_unit is None

        return_value = service_under_test.save_fuel(
            report_source_type,
            report_unit,
            {
                "test_fuel_prop": "fuel_value",
                "fuelType": {"fuelName": fuel_type.name},
                "emissions": [{"small_emission": 1}, {"large_emission": 2}],
            },
        )

        assert return_value.json_data == {"test_fuel_prop": "fuel_value"}
        assert return_value.report_source_type == report_source_type
        assert return_value.report_unit == report_unit
        assert return_value.report_version == test_infrastructure.report_version

        return_value.refresh_from_db()
        assert return_value.created_by == test_infrastructure.user
        assert return_value.updated_by is None

        mock_save_emission.assert_has_calls(
            [
                call(report_source_type, None, return_value, {"small_emission": 1}),
                call(report_source_type, None, return_value, {"large_emission": 2}),
            ]
        )

    @patch("reporting.service.report_activity_save_service.ReportActivitySaveService.save_emission")
    def test_save_fuel_update(self, mock_save_emission: MagicMock):
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
            test_infrastructure.user.user_guid,
        )

        report_fuel = service_under_test.save_fuel(
            report_source_type,
            report_unit,
            {
                "test_fuel_prop": "fuel_value",
                "fuelType": {"fuelName": fuel_type.name},
                "emissions": [{"small_emission": 1}, {"large_emission": 2}],
            },
        )

        # Update
        new_fuel_type = make_recipe("reporting.tests.utils.fuel_type", name="Another Fuel Type")
        update_return_value = service_under_test.save_fuel(
            report_source_type,
            report_unit,
            {
                "id": report_fuel.id,
                "test_fuel_prop": "updated!",
                "fuelType": {"fuelName": new_fuel_type.name},
                "emissions": [{"small_emission": 1}, {"large_emission": 2}],
            },
        )

        assert update_return_value.id == report_fuel.id
        assert update_return_value.json_data == {"test_fuel_prop": "updated!"}
        assert update_return_value.fuel_type == new_fuel_type

        update_return_value.refresh_from_db()
        assert update_return_value.created_by == test_infrastructure.user
        assert update_return_value.updated_by == test_infrastructure.user

    @patch("reporting.service.report_activity_save_service.ReportActivitySaveService.save_emission")
    def test_removes_deleted_emissions(self, mock_save_emission: MagicMock):
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
            make_recipe("registration.tests.utils.industry_operator_user"),
        )

        report_fuel = service_under_test.save_fuel(
            report_source_type,
            report_unit,
            {
                "test_fuel_prop": "fuel_value",
                "fuelType": {"fuelName": fuel_type.name},
                "emissions": [{"small_emission": 1}, {"large_emission": 2}],
            },
        )

        report_emissions = make(
            ReportEmission,
            gas_type=make_recipe("reporting.tests.utils.gas_type"),
            report_source_type=report_source_type,
            report_fuel=report_fuel,
            report_version=test_infrastructure.report_version,
            json_data={"cccc": "dddd"},
            _quantity=6,
        )

        assert ReportEmission.objects.count() == 6

        service_under_test.save_fuel(
            report_source_type,
            report_unit,
            {
                "id": report_fuel.id,
                "test_fuel_prop": "updated!",
                "fuelType": {"fuelName": "Test Fuel Type"},
                "emissions": [
                    {"id": report_emissions[1].id, "small_emission": 1},
                    {"id": report_emissions[3].id, "large_emission": 2},
                ],
            },
        )

        self.assertQuerySetEqual(
            ReportEmission.objects.filter(report_fuel=report_fuel),
            [report_emissions[1], report_emissions[3]],
            ordered=False,
        )
