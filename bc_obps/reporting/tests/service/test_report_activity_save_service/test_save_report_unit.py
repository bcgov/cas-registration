from unittest.mock import MagicMock, call, patch
from django.test import TestCase
import pytest
from reporting.models.report_source_type import ReportSourceType
from reporting.service.report_activity_save_service import ReportActivitySaveService
from reporting.tests.service.test_report_activity_save_service.infrastructure import TestInfrastructure
from model_bakery.baker import make_recipe, make


class TestSaveReportUnit(TestCase):

    @patch("reporting.service.report_activity_save_service.ReportActivitySaveService.save_emission")
    @patch("reporting.service.report_activity_save_service.ReportActivitySaveService.save_fuel")
    def test_save_unit_with_fuel(self, mock_save_fuel: MagicMock, mock_save_emission: MagicMock):
        test_infrastructure = TestInfrastructure.build()
        act_st = test_infrastructure.make_activity_source_type(
            source_type__json_key="sourceTypeWithUnitAndFuel",
            has_unit=False,
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

        service_under_test = ReportActivitySaveService(
            report_activity.report_version.id,
            report_activity.facility_report.facility.id,
            report_activity.activity.id,
            make_recipe('registration.tests.utils.industry_operator_user'),
        )

        with pytest.raises(ValueError, match="Unit is expecting fuel data"):
            service_under_test.save_unit(report_source_type, {"key": True})

        return_value = service_under_test.save_unit(
            report_source_type, {"test_fuel_prop": "fuel_value", "fuels": [{"fuel1": 1}, {"more_fuels": 2}]}
        )

        assert return_value.json_data == {"test_fuel_prop": "fuel_value"}
        assert return_value.report_source_type == report_source_type
        assert return_value.report_version == test_infrastructure.report_version

        mock_save_fuel.assert_has_calls(
            [
                call(report_source_type, return_value, {"fuel1": 1}),
                call(report_source_type, return_value, {"more_fuels": 2}),
            ]
        )
        mock_save_emission.assert_not_called()

    @patch("reporting.service.report_activity_save_service.ReportActivitySaveService.save_emission")
    @patch("reporting.service.report_activity_save_service.ReportActivitySaveService.save_fuel")
    def test_save_unit_without_fuel(self, mock_save_fuel: MagicMock, mock_save_emission: MagicMock):
        test_infrastructure = TestInfrastructure.build()
        act_st = test_infrastructure.make_activity_source_type(
            source_type__json_key="sourceTypeWithUnitAndFuel",
            has_unit=False,
            has_fuel=False,
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

        service_under_test = ReportActivitySaveService(
            report_activity.report_version.id,
            report_activity.facility_report.facility.id,
            report_activity.activity.id,
            make_recipe('registration.tests.utils.industry_operator_user'),
        )

        with pytest.raises(ValueError, match="Unit is expecting emission data"):
            service_under_test.save_unit(report_source_type, {"key": True})

        return_value = service_under_test.save_unit(
            report_source_type,
            {"test_fuel_prop": "fuel_value", "emissions": [{"small_emission": 1}, {"large_emission": 2}]},
        )

        assert return_value.json_data == {"test_fuel_prop": "fuel_value"}
        assert return_value.report_source_type == report_source_type
        assert return_value.report_version == test_infrastructure.report_version

        mock_save_fuel.assert_not_called()
        mock_save_emission.assert_has_calls(
            [
                call(report_source_type, None, {"small_emission": 1}),
                call(report_source_type, None, {"large_emission": 2}),
            ]
        )

    def test_removes_deleted_fuels(self):
        raise

    def test_removes_deleted_emissions(self):
        raise
