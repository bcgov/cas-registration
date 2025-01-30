from unittest.mock import MagicMock, call, patch
from django.test import TestCase
import pytest
from reporting.models.report_emission import ReportEmission
from reporting.models.report_fuel import ReportFuel
from reporting.models.report_source_type import ReportSourceType
from reporting.service.report_activity_save_service import ReportActivitySaveService
from reporting.tests.service.test_report_activity_save_service.infrastructure import (
    TestInfrastructure,
)
from model_bakery.baker import make_recipe, make


class TestSaveReportUnit(TestCase):
    @patch("reporting.service.report_activity_save_service.ReportActivitySaveService.save_emission")
    @patch("reporting.service.report_activity_save_service.ReportActivitySaveService.save_fuel")
    def test_save_unit(self, mock_save_fuel: MagicMock, mock_save_emission: MagicMock):
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

        service_under_test = ReportActivitySaveService(
            report_activity.report_version.id,
            report_activity.facility_report.facility.id,
            report_activity.activity.id,
            test_infrastructure.user.user_guid,
        )

        with pytest.raises(ValueError, match="Unit is expecting fuel data"):
            service_under_test.save_unit(report_source_type, {"key": True})

        return_value = service_under_test.save_unit(
            report_source_type,
            {
                "test_unit_prop": "unit_value",
                "fuels": [{"fuel1": 1}, {"more_fuels": 2}],
            },
        )

        assert return_value.json_data == {"test_unit_prop": "unit_value"}
        assert return_value.report_source_type == report_source_type
        assert return_value.report_version == test_infrastructure.report_version

        return_value.refresh_from_db()
        assert return_value.created_by == test_infrastructure.user
        assert return_value.updated_by is None

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
            has_unit=True,
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
            test_infrastructure.user.user_guid,
        )

        with pytest.raises(ValueError, match="Unit is expecting emissions data"):
            service_under_test.save_unit(report_source_type, {"key": True})

        return_value = service_under_test.save_unit(
            report_source_type,
            {
                "test_unit_prop": "unit_value",
                "emissions": [{"em": 1}, {"em2": 2}],
            },
        )

        assert return_value.json_data == {"test_unit_prop": "unit_value"}
        assert return_value.report_source_type == report_source_type
        assert return_value.report_version == test_infrastructure.report_version

        return_value.refresh_from_db()
        assert return_value.created_by == test_infrastructure.user
        assert return_value.updated_by is None

        mock_save_emission.assert_has_calls(
            [
                call(report_source_type, return_value, {"em": 1}),
                call(report_source_type, return_value, {"em2": 2}),
            ]
        )
        mock_save_fuel.assert_not_called()

    @patch("reporting.service.report_activity_save_service.ReportActivitySaveService.save_emission")
    @patch("reporting.service.report_activity_save_service.ReportActivitySaveService.save_fuel")
    def test_save_unit_update(self, mock_save_fuel: MagicMock, mock_save_emission: MagicMock):
        test_infrastructure = TestInfrastructure.build()
        act_st = test_infrastructure.make_activity_source_type(
            source_type__json_key="sourceTypeWithFuel",
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

        service_under_test = ReportActivitySaveService(
            report_activity.report_version.id,
            report_activity.facility_report.facility.id,
            report_activity.activity.id,
            test_infrastructure.user.user_guid,
        )

        report_unit = service_under_test.save_unit(
            report_source_type,
            {
                "test_unit_prop": "unit_value",
                "fuels": [{"fuel1": 1}, {"more_fuels": 2}],
            },
        )

        # Update
        update_return_value = service_under_test.save_unit(
            report_source_type,
            {
                "id": report_unit.id,
                "new_prop": "new_val",
                "fuels": [{"fuel1": 1}, {"more_fuels": 2}],
            },
        )

        assert update_return_value.json_data == {"new_prop": "new_val"}
        assert update_return_value.id == report_unit.id

        update_return_value.refresh_from_db()
        assert update_return_value.created_by == test_infrastructure.user
        assert update_return_value.updated_by == test_infrastructure.user

    @patch("reporting.service.report_activity_save_service.ReportActivitySaveService.save_emission")
    @patch("reporting.service.report_activity_save_service.ReportActivitySaveService.save_fuel")
    def test_removes_deleted_fuels(self, mock_save_fuel: MagicMock, mock_save_emission: MagicMock):
        test_infrastructure = TestInfrastructure.build()
        act_st = test_infrastructure.make_activity_source_type(
            source_type__json_key="sourceTypeWithFuel",
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
            make_recipe("registration.tests.utils.industry_operator_user"),
        )

        report_unit = service_under_test.save_unit(
            report_source_type,
            {
                "test_unit_prop": "unit_value",
                "fuels": [{"fuel1": 1}, {"more_fuels": 2}],
            },
        )

        report_fuels = make(
            ReportFuel,
            report_source_type=report_source_type,
            report_unit=report_unit,
            fuel_type=make_recipe("reporting.tests.utils.fuel_type"),
            report_version=test_infrastructure.report_version,
            json_data={"aaaa": "bbbb"},
            _quantity=2,
        )
        # Other potential existing report fuels under that source type
        another_report_unit = service_under_test.save_unit(
            report_source_type,
            {"another": "another", "fuels": [{"fuel1": 1}, {"more_fuels": 2}]},
        )
        another_report_fuels = make(
            ReportFuel,
            report_source_type=report_source_type,
            report_unit=another_report_unit,
            fuel_type=make_recipe("reporting.tests.utils.fuel_type"),
            report_version=test_infrastructure.report_version,
            json_data={"cccc": "eeee"},
            _quantity=2,
        )
        # ReportEmission records that will be deleted
        make(
            ReportEmission,
            gas_type=make_recipe("reporting.tests.utils.gas_type"),
            report_source_type=report_source_type,
            report_fuel=report_fuels[0],
            report_version=test_infrastructure.report_version,
            json_data={"cccc": "dddd"},
            _quantity=3,
        )
        report_emissions_to_be_kept = make(
            ReportEmission,
            gas_type=make_recipe("reporting.tests.utils.gas_type"),
            report_source_type=report_source_type,
            report_fuel=report_fuels[1],
            report_version=test_infrastructure.report_version,
            json_data={"cccc": "dddd"},
            _quantity=3,
        )

        assert ReportFuel.objects.filter(report_unit=report_unit).count() == 2
        assert ReportEmission.objects.filter(report_fuel__report_unit=report_unit).count() == 6

        service_under_test.save_unit(
            report_source_type,
            {
                "id": report_unit.id,
                "new_prop": "new",
                "fuels": [{"id": report_fuels[1].id, "fuel1": 1}, {"more_fuels": 2}],
            },
        )

        self.assertQuerySetEqual(
            ReportFuel.objects.filter(report_unit=report_unit),
            [report_fuels[1]],
            ordered=False,
        )
        self.assertQuerySetEqual(
            ReportEmission.objects.filter(report_fuel__report_unit=report_unit),
            report_emissions_to_be_kept,
            ordered=False,
        )
        self.assertQuerySetEqual(
            ReportFuel.objects.filter(report_unit=another_report_unit),
            another_report_fuels,
            ordered=False,
        )
