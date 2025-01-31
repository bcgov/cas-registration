from unittest.mock import MagicMock, call, patch
from django.test import TestCase
from django.core.exceptions import ValidationError
import pytest
from reporting.models.report_emission import ReportEmission
from reporting.models.report_fuel import ReportFuel
from reporting.models.report_unit import ReportUnit
from reporting.models.source_type import SourceType
from reporting.service.report_activity_save_service import ReportActivitySaveService
from reporting.tests.service.test_report_activity_save_service.infrastructure import (
    TestInfrastructure,
)
from model_bakery.baker import make_recipe, make


class TestSaveReportSourceType(TestCase):
    @patch("reporting.service.report_activity_save_service.ReportActivitySaveService.save_emission")
    @patch("reporting.service.report_activity_save_service.ReportActivitySaveService.save_fuel")
    @patch("reporting.service.report_activity_save_service.ReportActivitySaveService.save_unit")
    def test_save_source_type_with_unit(
        self,
        mock_save_unit: MagicMock,
        mock_save_fuel: MagicMock,
        mock_save_emission: MagicMock,
    ):
        test_infrastructure = TestInfrastructure.build()
        act_st = test_infrastructure.make_activity_source_type(
            source_type__json_key="sourceTypeWithUnit", has_unit=True, has_fuel=True
        )
        report_activity = test_infrastructure.make_report_activity()
        service_under_test = ReportActivitySaveService(
            report_activity.facility_report.report_version.id,
            report_activity.facility_report.facility.id,
            report_activity.activity.id,
            test_infrastructure.user.user_guid,
        )

        with pytest.raises(SourceType.DoesNotExist):
            service_under_test.save_source_type(report_activity, "thisIsNotAValidSourceTypeSlug", {"test": 123})

        with pytest.raises(ValueError, match="Source type sourceTypeWithUnit is expecting unit data"):
            service_under_test.save_source_type(report_activity, "sourceTypeWithUnit", {"test": 123})

        return_value = service_under_test.save_source_type(
            report_activity,
            "sourceTypeWithUnit",
            {
                "test": "source type with unit",
                "units": [{"unit_data_1": 1}, {"unit_data_2": 2}],
            },
        )

        assert return_value.json_data == {"test": "source type with unit"}
        assert return_value.activity_source_type_base_schema == act_st
        assert return_value.source_type == act_st.source_type
        assert return_value.report_activity == report_activity
        assert return_value.report_version == test_infrastructure.facility_report.report_version

        mock_save_unit.assert_has_calls(
            [
                call(return_value, {"unit_data_1": 1}),
                call(return_value, {"unit_data_2": 2}),
            ]
        )
        mock_save_fuel.assert_not_called()
        mock_save_emission.assert_not_called()

    @patch("reporting.service.report_activity_save_service.ReportActivitySaveService.save_emission")
    @patch("reporting.service.report_activity_save_service.ReportActivitySaveService.save_fuel")
    @patch("reporting.service.report_activity_save_service.ReportActivitySaveService.save_unit")
    def test_save_source_type_with_unit_update(
        self,
        mock_save_unit: MagicMock,
        mock_save_fuel: MagicMock,
        mock_save_emission: MagicMock,
    ):
        # Update case
        test_infrastructure = TestInfrastructure.build()
        act_st = test_infrastructure.make_activity_source_type(
            source_type__json_key="sourceTypeWithUnit", has_unit=True, has_fuel=True
        )
        report_activity = test_infrastructure.make_report_activity()
        service_under_test = ReportActivitySaveService(
            report_activity.facility_report.report_version.id,
            report_activity.facility_report.facility.id,
            report_activity.activity.id,
            test_infrastructure.user.user_guid,
        )
        report_source_type = service_under_test.save_source_type(
            report_activity,
            "sourceTypeWithUnit",
            {
                "test": "source type with unit",
                "units": [{"unit_data_1": 1}, {"unit_data_2": 2}],
            },
        )

        mock_save_unit.reset_mock()
        mock_save_fuel.reset_mock()
        mock_save_emission.reset_mock()

        # If no report_source_type.id is provided, an error is expeced for the source type
        # Since it exists already
        with pytest.raises(ValidationError):
            service_under_test.save_source_type(
                report_activity,
                "sourceTypeWithUnit",
                {
                    "test": "source type with unit",
                    "units": [{"unit_data_1": 1}, {"unit_data_2": 2}],
                },
            )
        # If the report_source_type.id doesn't match the existing record, an error is expected
        with pytest.raises(ValidationError):
            service_under_test.save_source_type(
                report_activity,
                "sourceTypeWithUnit",
                {
                    "id": report_source_type.id + 1,
                    "test": "source type with unit",
                    "units": [{"unit_data_1": 1}, {"unit_data_2": 2}],
                },
            )

        # If the report_source_type with that id targets a new source type, it's also an error
        with pytest.raises(ValidationError):
            test_infrastructure.make_activity_source_type(
                source_type__json_key="newSourceTypeWithUnit",
                has_unit=True,
                has_fuel=True,
            )
            service_under_test.save_source_type(
                report_activity,
                "newSourceTypeWithUnit",
                {
                    "id": report_source_type.id,
                    "test": "boing!",
                    "units": [{"unit_data_1": 1}],
                },
            )

        update_return_value = service_under_test.save_source_type(
            report_activity,
            "sourceTypeWithUnit",
            {
                "id": report_source_type.id,
                "test": "updated!",
                "new key": True,
                "units": [{"another_unit": "test"}],
            },
        )

        assert report_source_type == update_return_value
        assert update_return_value.json_data == {"test": "updated!", "new key": True}
        assert update_return_value.activity_source_type_base_schema == act_st
        assert update_return_value.source_type == act_st.source_type
        assert update_return_value.report_activity == report_activity
        assert update_return_value.report_version == test_infrastructure.facility_report.report_version

        mock_save_unit.assert_called_once_with(update_return_value, {"another_unit": "test"})
        mock_save_fuel.assert_not_called()
        mock_save_emission.assert_not_called()

    @patch("reporting.service.report_activity_save_service.ReportActivitySaveService.save_emission")
    @patch("reporting.service.report_activity_save_service.ReportActivitySaveService.save_fuel")
    @patch("reporting.service.report_activity_save_service.ReportActivitySaveService.save_unit")
    def test_save_source_type_with_fuel(
        self,
        mock_save_unit: MagicMock,
        mock_save_fuel: MagicMock,
        mock_save_emission: MagicMock,
    ):
        test_infrastructure = TestInfrastructure.build()
        act_st = test_infrastructure.make_activity_source_type(
            source_type__json_key="sourceTypeWithFuel", has_unit=False, has_fuel=True
        )
        report_activity = test_infrastructure.make_report_activity()
        service_under_test = ReportActivitySaveService(
            report_activity.facility_report.report_version.id,
            report_activity.facility_report.facility.id,
            report_activity.activity.id,
            test_infrastructure.user.user_guid,
        )

        with pytest.raises(ValueError, match="Source type sourceTypeWithFuel is expecting fuel data"):
            service_under_test.save_source_type(report_activity, "sourceTypeWithFuel", {"test": 123})

        return_value = service_under_test.save_source_type(
            report_activity,
            "sourceTypeWithFuel",
            {"test": 123, "fuels": [{"fuel": 1}, {"fuel_too": 2}]},
        )

        assert return_value.json_data == {"test": 123}
        assert return_value.activity_source_type_base_schema == act_st
        assert return_value.source_type == act_st.source_type
        assert return_value.report_activity == report_activity
        assert return_value.report_version == test_infrastructure.facility_report.report_version

        mock_save_unit.assert_not_called()
        mock_save_fuel.assert_has_calls(
            [
                call(return_value, None, {"fuel": 1}),
                call(return_value, None, {"fuel_too": 2}),
            ]
        )
        mock_save_emission.assert_not_called()

    @patch("reporting.service.report_activity_save_service.ReportActivitySaveService.save_emission")
    @patch("reporting.service.report_activity_save_service.ReportActivitySaveService.save_fuel")
    @patch("reporting.service.report_activity_save_service.ReportActivitySaveService.save_unit")
    def test_save_source_type_without_unit_or_fuel(
        self,
        mock_save_unit: MagicMock,
        mock_save_fuel: MagicMock,
        mock_save_emission: MagicMock,
    ):
        test_infrastructure = TestInfrastructure.build()
        act_st = test_infrastructure.make_activity_source_type(
            source_type__json_key="sourceTypeWithoutFuelOrUnit",
            has_unit=False,
            has_fuel=False,
        )
        report_activity = test_infrastructure.make_report_activity()
        service_under_test = ReportActivitySaveService(
            report_activity.facility_report.report_version.id,
            report_activity.facility_report.facility.id,
            report_activity.activity.id,
            test_infrastructure.user.user_guid,
        )

        with pytest.raises(
            ValueError,
            match="Source type sourceTypeWithoutFuelOrUnit is expecting emission data",
        ):
            service_under_test.save_source_type(report_activity, "sourceTypeWithoutFuelOrUnit", {"test": 123})

        return_value = service_under_test.save_source_type(
            report_activity,
            "sourceTypeWithoutFuelOrUnit",
            {"test_emission": 123, "emissions": [{"a": 1}, {"b": 2}]},
        )

        assert return_value.json_data == {"test_emission": 123}
        assert return_value.activity_source_type_base_schema == act_st
        assert return_value.source_type == act_st.source_type
        assert return_value.report_activity == report_activity
        assert return_value.report_version == test_infrastructure.facility_report.report_version

        mock_save_unit.assert_not_called()
        mock_save_fuel.assert_not_called()
        mock_save_emission.assert_has_calls(
            [
                call(return_value, None, None, {"a": 1}),
                call(return_value, None, None, {"b": 2}),
            ]
        )

    @patch("reporting.service.report_activity_save_service.ReportActivitySaveService.save_emission")
    @patch("reporting.service.report_activity_save_service.ReportActivitySaveService.save_fuel")
    @patch("reporting.service.report_activity_save_service.ReportActivitySaveService.save_unit")
    def test_removes_deleted_units(
        self,
        mock_save_unit: MagicMock,
        mock_save_fuel: MagicMock,
        mock_save_emission: MagicMock,
    ):
        test_infrastructure = TestInfrastructure.build()
        test_infrastructure.make_activity_source_type(
            source_type__json_key="sourceTypeWithUnit", has_unit=True, has_fuel=True
        )
        report_activity = test_infrastructure.make_report_activity()
        service_under_test = ReportActivitySaveService(
            report_activity.facility_report.report_version.id,
            report_activity.facility_report.facility.id,
            report_activity.activity.id,
            test_infrastructure.user.user_guid,
        )

        report_source_type = service_under_test.save_source_type(
            report_activity,
            "sourceTypeWithUnit",
            {
                "test": "source type with unit",
                "units": [{"unit_data_1": 1}, {"unit_data_2": 2}],
            },
        )

        report_units = make(
            ReportUnit,
            report_source_type=report_source_type,
            report_version=test_infrastructure.report_version,
            json_data={"unit": True},
            _quantity=8,
        )
        report_fuels_to_be_deleted = make(
            ReportFuel,
            report_source_type=report_source_type,
            report_unit=report_units[0],
            fuel_type=make_recipe("reporting.tests.utils.fuel_type"),
            report_version=test_infrastructure.report_version,
            json_data={"aaaa": "bbbb"},
            _quantity=2,
        )
        report_fuels_to_be_kept = make(
            ReportFuel,
            report_source_type=report_source_type,
            report_unit=report_units[3],
            fuel_type=make_recipe("reporting.tests.utils.fuel_type"),
            report_version=test_infrastructure.report_version,
            json_data={"aaaa": "bbbb"},
            _quantity=2,
        )
        # ReportEmission records that will be deleted
        make(
            ReportEmission,
            gas_type=make_recipe("reporting.tests.utils.gas_type"),
            report_source_type=report_source_type,
            report_fuel=report_fuels_to_be_deleted[0],
            report_version=test_infrastructure.report_version,
            json_data={"cccc": "dddd"},
            _quantity=3,
        )
        report_emissions_to_be_kept = make(
            ReportEmission,
            gas_type=make_recipe("reporting.tests.utils.gas_type"),
            report_source_type=report_source_type,
            report_fuel=report_fuels_to_be_kept[0],
            report_version=test_infrastructure.report_version,
            json_data={"cccc": "dddd"},
            _quantity=3,
        )

        assert ReportUnit.objects.filter(report_source_type=report_source_type).count() == 8
        assert ReportFuel.objects.filter(report_source_type=report_source_type).count() == 4
        assert ReportEmission.objects.filter(report_source_type=report_source_type).count() == 6

        service_under_test.save_source_type(
            report_activity,
            "sourceTypeWithUnit",
            {
                "id": report_source_type.id,
                "units": [
                    {"id": report_units[3].id, "unit": "test"},
                    {"id": report_units[6].id},
                    {"id": report_units[7].id},
                ],
            },
        )

        self.assertQuerySetEqual(
            ReportUnit.objects.filter(report_source_type=report_source_type),
            [report_units[3], report_units[6], report_units[7]],
            ordered=False,
        )
        # Only fuels and emissions not children of the deleted items are still around
        self.assertQuerySetEqual(
            ReportFuel.objects.filter(report_source_type=report_source_type),
            report_fuels_to_be_kept,
            ordered=False,
        )
        self.assertQuerySetEqual(
            ReportEmission.objects.filter(report_source_type=report_source_type),
            report_emissions_to_be_kept,
            ordered=False,
        )

    @patch("reporting.service.report_activity_save_service.ReportActivitySaveService.save_emission")
    @patch("reporting.service.report_activity_save_service.ReportActivitySaveService.save_fuel")
    @patch("reporting.service.report_activity_save_service.ReportActivitySaveService.save_unit")
    def test_removes_deleted_fuels(
        self,
        mock_save_unit: MagicMock,
        mock_save_fuel: MagicMock,
        mock_save_emission: MagicMock,
    ):
        test_infrastructure = TestInfrastructure.build()
        test_infrastructure.make_activity_source_type(
            source_type__json_key="sourceTypeWithFuel", has_unit=False, has_fuel=True
        )
        report_activity = test_infrastructure.make_report_activity()
        service_under_test = ReportActivitySaveService(
            report_activity.facility_report.report_version.id,
            report_activity.facility_report.facility.id,
            report_activity.activity.id,
            test_infrastructure.user.user_guid,
        )

        report_source_type = service_under_test.save_source_type(
            report_activity,
            "sourceTypeWithFuel",
            {"test": "123", "fuels": [{"data_1": 1}, {"data_2": 2}]},
        )

        report_units = make(
            ReportUnit,
            report_source_type=report_source_type,
            report_version=test_infrastructure.report_version,
            json_data={"unit": True},
            _quantity=8,
        )
        report_fuels = make(
            ReportFuel,
            report_source_type=report_source_type,
            report_unit=report_units[0],
            fuel_type=make_recipe("reporting.tests.utils.fuel_type"),
            report_version=test_infrastructure.report_version,
            json_data={"aaaa": "bbbb"},
            _quantity=5,
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
        report_emission_to_be_kept = make(
            ReportEmission,
            gas_type=make_recipe("reporting.tests.utils.gas_type"),
            report_source_type=report_source_type,
            report_fuel=report_fuels[3],
            report_version=test_infrastructure.report_version,
            json_data={"cccc": "dddd"},
            _quantity=3,
        )

        assert ReportUnit.objects.filter(report_source_type=report_source_type).count() == 8
        assert ReportFuel.objects.filter(report_source_type=report_source_type).count() == 5
        assert ReportEmission.objects.filter(report_source_type=report_source_type).count() == 6

        service_under_test.save_source_type(
            report_activity,
            "sourceTypeWithFuel",
            {
                "id": report_source_type.id,
                "fuels": [
                    {"id": report_fuels[2].id, "fuel": "test"},
                    {"id": report_fuels[3].id},
                ],
            },
        )

        assert ReportUnit.objects.filter(report_source_type=report_source_type).count() == 8
        self.assertQuerySetEqual(
            ReportFuel.objects.filter(report_source_type=report_source_type),
            [report_fuels[2], report_fuels[3]],
            ordered=False,
        )
        self.assertQuerySetEqual(
            ReportEmission.objects.filter(report_source_type=report_source_type),
            report_emission_to_be_kept,
            ordered=False,
        )

    @patch("reporting.service.report_activity_save_service.ReportActivitySaveService.save_emission")
    @patch("reporting.service.report_activity_save_service.ReportActivitySaveService.save_fuel")
    @patch("reporting.service.report_activity_save_service.ReportActivitySaveService.save_unit")
    def test_removes_deleted_emissions(
        self,
        mock_save_unit: MagicMock,
        mock_save_fuel: MagicMock,
        mock_save_emission: MagicMock,
    ):
        test_infrastructure = TestInfrastructure.build()
        test_infrastructure.make_activity_source_type(
            source_type__json_key="sourceType", has_unit=False, has_fuel=False
        )
        report_activity = test_infrastructure.make_report_activity()
        service_under_test = ReportActivitySaveService(
            report_activity.facility_report.report_version.id,
            report_activity.facility_report.facility.id,
            report_activity.activity.id,
            test_infrastructure.user.user_guid,
        )

        report_source_type = service_under_test.save_source_type(
            report_activity,
            "sourceType",
            {"test": "123", "emissions": [{"data_1": 1}, {"data_2": 2}]},
        )

        report_units = make(
            ReportUnit,
            report_source_type=report_source_type,
            report_version=test_infrastructure.report_version,
            json_data={"unit": True},
            _quantity=8,
        )
        report_fuels = make(
            ReportFuel,
            report_source_type=report_source_type,
            report_unit=report_units[0],
            fuel_type=make_recipe("reporting.tests.utils.fuel_type"),
            report_version=test_infrastructure.report_version,
            json_data={"aaaa": "bbbb"},
            _quantity=5,
        )
        report_emissions = make(
            ReportEmission,
            gas_type=make_recipe("reporting.tests.utils.gas_type"),
            report_source_type=report_source_type,
            report_fuel=report_fuels[0],
            report_version=test_infrastructure.report_version,
            json_data={"cccc": "dddd"},
            _quantity=4,
        )

        assert ReportUnit.objects.filter(report_source_type=report_source_type).count() == 8
        assert ReportFuel.objects.filter(report_source_type=report_source_type).count() == 5
        assert ReportEmission.objects.filter(report_source_type=report_source_type).count() == 4

        service_under_test.save_source_type(
            report_activity,
            "sourceType",
            {
                "id": report_source_type.id,
                "emissions": [
                    {"id": report_emissions[0].id, "emission": "test"},
                ],
            },
        )

        assert ReportUnit.objects.filter(report_source_type=report_source_type).count() == 8
        assert ReportFuel.objects.filter(report_source_type=report_source_type).count() == 5
        self.assertQuerySetEqual(
            ReportEmission.objects.filter(report_source_type=report_source_type),
            [report_emissions[0]],
            ordered=False,
        )
