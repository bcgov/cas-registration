from unittest.mock import MagicMock, call, patch
from django.test import TestCase
import pytest
from model_bakery.baker import make_recipe, make
from registration.models.activity import Activity
from reporting.models.activity_source_type_json_schema import ActivitySourceTypeJsonSchema
from reporting.models.fuel_type import FuelType
from reporting.models.gas_type import GasType
from reporting.models.report_activity import ReportActivity
from reporting.models.report_emission import ReportEmission
from reporting.models.report_fuel import ReportFuel
from reporting.models.report_source_type import ReportSourceType
from reporting.models.report_unit import ReportUnit
from reporting.models.source_type import SourceType
from reporting.service.report_activity_save_service import ReportActivitySaveService
from reporting.tests.service.test_report_activity_save_service import data
from reporting.tests.service.test_report_activity_save_service.utils import (
    TestInfrastructure,
    get_report_fuel_by_index,
    get_report_unit_by_index,
)


class TestReportActivitySaveService(TestCase):

    #######################
    #  Tests: error case  #
    #######################
    @pytest.mark.skip()
    def test_errors_out_if_empty_json(self):
        activity = make_recipe('reporting.tests.utils.activity')
        service_under_test = ReportActivitySaveService(
            self.facility_report.report_version.id,
            self.facility_report.facility.id,
            activity.id,
            self.user.user_guid,
        )

        with pytest.raises(ValueError):
            service_under_test.save({})

    @pytest.mark.skip()
    def test_errors_out_if_no_emission_record(self):
        activity = Activity.objects.get(slug='gsc_non_compression')
        service_under_test = ReportActivitySaveService(
            self.facility_report.report_version.id,
            self.facility_report.facility.id,
            activity.id,
            self.user.user_guid,
        )
        with pytest.raises(ValueError):
            service_under_test.save(data.no_emission_test_data)

    ########################
    #  Tests: create case  #
    ########################
    @pytest.mark.skip()
    def test_creates_report_activity_data(self):
        """
        This test represents a real-life scenario with complex test data
        """
        test_infrastructure = TestInfrastructure.build_from_real_config()
        service_under_test = ReportActivitySaveService(
            test_infrastructure.facility_report.report_version.id,
            test_infrastructure.facility_report.facility.id,
            test_infrastructure.activity.id,
            test_infrastructure.user.user_guid,
        )
        report_activity = service_under_test.save(data.test_data)

        # Report Activity
        assert report_activity.json_data == {
            "test_activity_number": 12345,
            "test_activity_bool": True,
            "test_activity_str": "act",
            "gscFuelOrWasteLinearFacilitiesUsefulEnergy": True,
            "fieldProcessVentGasLinearFacilities": True,
        }
        assert report_activity.facility_report == test_infrastructure.facility_report
        assert report_activity.activity == Activity.objects.get(slug='gsc_non_compression')
        assert report_activity.activity_base_schema == test_infrastructure.activity_json_schema
        assert report_activity.report_version == test_infrastructure.facility_report.report_version

        # Report Source Types
        report_source_types = ReportSourceType.objects.filter(report_activity=report_activity).order_by("id")

        assert report_source_types.count() == 2

        assert report_source_types[0].activity_source_type_base_schema == ActivitySourceTypeJsonSchema.objects.get(
            activity=Activity.objects.get(slug='gsc_non_compression'),
            source_type=SourceType.objects.get(json_key="gscFuelOrWasteLinearFacilitiesUsefulEnergy"),
            valid_from=test_infrastructure.configuration,
            valid_to=test_infrastructure.configuration,
        )
        assert report_source_types[0].source_type == SourceType.objects.get(
            json_key="gscFuelOrWasteLinearFacilitiesUsefulEnergy"
        )
        assert report_source_types[0].json_data == {
            "test_st_number": 12345,
            "test_st_bool": True,
            "test_st_str": "st",
        }

        assert report_source_types[1].activity_source_type_base_schema == ActivitySourceTypeJsonSchema.objects.get(
            activity=Activity.objects.get(slug='gsc_non_compression'),
            source_type=SourceType.objects.get(json_key="fieldProcessVentGasLinearFacilities"),
            valid_from=test_infrastructure.configuration,
            valid_to=test_infrastructure.configuration,
        )
        assert report_source_types[1].source_type == SourceType.objects.get(
            json_key="fieldProcessVentGasLinearFacilities"
        )
        assert report_source_types[1].json_data == {}

        # Report Units
        report_units = ReportUnit.objects.filter(report_source_type__report_activity=report_activity).order_by("id")

        assert report_units.count() == 3

        assert report_units[0].report_version == test_infrastructure.facility_report.report_version
        assert report_units[0].report_source_type.report_activity == report_activity
        assert report_units[0].report_source_type.source_type.json_key == "gscFuelOrWasteLinearFacilitiesUsefulEnergy"
        assert report_units[0].json_data == {
            'description': 'test description',
            'test_unit_bool': True,
            'test_unit_number': 12345,
            'test_unit_str': 'unit',
        }

        assert report_units[1].report_version == test_infrastructure.facility_report.report_version
        assert report_units[1].report_source_type.report_activity == report_activity
        assert report_units[1].report_source_type.source_type.json_key == "fieldProcessVentGasLinearFacilities"
        assert report_units[1].json_data == {}

        assert report_units[2].report_version == test_infrastructure.facility_report.report_version
        assert report_units[2].report_source_type.report_activity == report_activity
        assert report_units[2].report_source_type.source_type.json_key == "fieldProcessVentGasLinearFacilities"
        assert report_units[2].json_data == {}

        # Report Fuels

        report_fuels = list(
            ReportFuel.objects.filter(report_source_type__report_activity=report_activity).order_by("id")
        )

        assert len(report_fuels) == 5

        assert report_fuels[0].json_data == {'test_fuel_bool': True, 'test_fuel_number': 12345, 'test_fuel_str': 'test'}
        assert report_fuels[0].report_version == test_infrastructure.facility_report.report_version
        assert report_fuels[0].report_unit == get_report_unit_by_index(report_activity, 0, 0)
        assert report_fuels[0].fuel_type == FuelType.objects.get(name="C/D Waste - Plastic")

        assert report_fuels[1].json_data == {}
        assert report_fuels[1].report_version == test_infrastructure.facility_report.report_version
        assert report_fuels[1].report_unit == get_report_unit_by_index(report_activity, 1, 0)
        assert report_fuels[1].fuel_type == FuelType.objects.get(name="Diesel")

        assert report_fuels[2].json_data == {}
        assert report_fuels[2].report_version == test_infrastructure.facility_report.report_version
        assert report_fuels[2].report_unit == get_report_unit_by_index(report_activity, 1, 0)
        assert report_fuels[2].fuel_type == FuelType.objects.get(name="Plastics")

        assert report_fuels[3].json_data == {}
        assert report_fuels[3].report_version == test_infrastructure.facility_report.report_version
        assert report_fuels[3].report_unit == get_report_unit_by_index(report_activity, 1, 1)
        assert report_fuels[3].fuel_type == FuelType.objects.get(name="Kerosene")

        assert report_fuels[4].json_data == {}
        assert report_fuels[4].report_version == test_infrastructure.facility_report.report_version
        assert report_fuels[4].report_unit == get_report_unit_by_index(report_activity, 1, 1)
        assert report_fuels[4].fuel_type == FuelType.objects.get(name="Wood Waste")

        # Report Emissions
        report_emissions = ReportEmission.objects.filter(report_source_type__report_activity=report_activity).order_by(
            "id"
        )

        assert report_emissions.count() == 9

        assert report_emissions[0].json_data == {
            "test_emission_number": 12345,
            "test_emission_bool": True,
            "test_emission_str": "test",
        }
        assert report_emissions[0].report_version == test_infrastructure.facility_report.report_version
        assert report_emissions[0].gas_type == GasType.objects.get(chemical_formula='CH4')
        assert report_emissions[0].report_fuel == get_report_fuel_by_index(report_activity, 0, 0, 0)

        assert report_emissions[1].json_data == {}
        assert report_emissions[1].report_version == test_infrastructure.facility_report.report_version
        assert report_emissions[1].gas_type == GasType.objects.get(chemical_formula='CO2')
        assert report_emissions[1].report_fuel == get_report_fuel_by_index(report_activity, 1, 0, 0)

        assert report_emissions[2].json_data == {}
        assert report_emissions[2].report_version == test_infrastructure.facility_report.report_version
        assert report_emissions[2].gas_type == GasType.objects.get(chemical_formula='N2O')
        assert report_emissions[2].report_fuel == get_report_fuel_by_index(report_activity, 1, 0, 0)

        assert report_emissions[3].json_data == {}
        assert report_emissions[3].report_version == test_infrastructure.facility_report.report_version
        assert report_emissions[3].gas_type == GasType.objects.get(chemical_formula='CO2')
        assert report_emissions[3].report_fuel == get_report_fuel_by_index(report_activity, 1, 0, 1)

        assert report_emissions[4].json_data == {}
        assert report_emissions[4].report_version == test_infrastructure.facility_report.report_version
        assert report_emissions[4].gas_type == GasType.objects.get(chemical_formula='N2O')
        assert report_emissions[4].report_fuel == get_report_fuel_by_index(report_activity, 1, 0, 1)

        assert report_emissions[5].json_data == {}
        assert report_emissions[5].report_version == test_infrastructure.facility_report.report_version
        assert report_emissions[5].gas_type == GasType.objects.get(chemical_formula='CO2')
        assert report_emissions[5].report_fuel == get_report_fuel_by_index(report_activity, 1, 1, 0)

        assert report_emissions[6].json_data == {}
        assert report_emissions[6].report_version == test_infrastructure.facility_report.report_version
        assert report_emissions[6].gas_type == GasType.objects.get(chemical_formula='N2O')
        assert report_emissions[6].report_fuel == get_report_fuel_by_index(report_activity, 1, 1, 0)

        assert report_emissions[7].json_data == {}
        assert report_emissions[7].report_version == test_infrastructure.facility_report.report_version
        assert report_emissions[7].gas_type == GasType.objects.get(chemical_formula='CO2')
        assert report_emissions[7].report_fuel == get_report_fuel_by_index(report_activity, 1, 1, 1)

        assert report_emissions[8].json_data == {}
        assert report_emissions[8].report_version == test_infrastructure.facility_report.report_version
        assert report_emissions[8].gas_type == GasType.objects.get(chemical_formula='N2O')
        assert report_emissions[8].report_fuel == get_report_fuel_by_index(report_activity, 1, 1, 1)

    @pytest.mark.skip()
    @patch("reporting.service.report_activity_save_service.ReportActivitySaveService.save_source_type")
    def test_save(self, mock_save_source_type: MagicMock):
        test_infrastructure = TestInfrastructure.build()
        activity_data = {
            "stuff": "testing",
            "number": 1234,
            "sourceTypes": {"testSourceType": {"stuff": True}},
        }

        service_under_test = ReportActivitySaveService(
            test_infrastructure.facility_report.report_version.id,
            test_infrastructure.facility_report.facility.id,
            test_infrastructure.activity_json_schema.activity.id,
            test_infrastructure.user.user_guid,
        )

        # Create case
        assert (
            ReportActivity.objects.filter(
                facility_report=test_infrastructure.facility_report,
                activity=test_infrastructure.activity_json_schema.activity,
            ).count()
            == 0
        )
        return_value = service_under_test.save(activity_data)
        report_activity = ReportActivity.objects.get(
            facility_report=test_infrastructure.facility_report,
            activity=test_infrastructure.activity_json_schema.activity,
        )

        assert return_value == report_activity
        assert return_value.activity_base_schema == test_infrastructure.activity_json_schema
        assert return_value.facility_report == test_infrastructure.facility_report
        assert return_value.json_data == {"stuff": "testing", "number": 1234}
        assert return_value.report_version == test_infrastructure.facility_report.report_version
        mock_save_source_type.assert_called_with(report_activity, "testSourceType", {"stuff": True})

        # Update case
        updated_activity_data = {
            "id": return_value.id,
            "stuff": "testing updated",
            "number": 123456,
            "extra_boolean": True,
            "sourceTypes": {"anotherSourceType": {"more_stuff": True}},
        }

        service_under_test.save(updated_activity_data)
        return_value.refresh_from_db()

        assert return_value == report_activity
        assert return_value.activity_base_schema == test_infrastructure.activity_json_schema
        assert return_value.facility_report == test_infrastructure.facility_report
        assert return_value.json_data == {"stuff": "testing updated", "number": 123456, "extra_boolean": True}
        assert return_value.report_version == test_infrastructure.facility_report.report_version
        mock_save_source_type.assert_called_with(report_activity, "anotherSourceType", {"more_stuff": True})

    @pytest.mark.skip()
    @patch("reporting.service.report_activity_save_service.ReportActivitySaveService.save_emission")
    @patch("reporting.service.report_activity_save_service.ReportActivitySaveService.save_fuel")
    @patch("reporting.service.report_activity_save_service.ReportActivitySaveService.save_unit")
    def test_save_source_type_with_unit(
        self, mock_save_unit: MagicMock, mock_save_fuel: MagicMock, mock_save_emission: MagicMock
    ):
        test_infrastructure = TestInfrastructure.build()
        act_st = make_recipe(
            "reporting.tests.utils.activity_source_type_json_schema",
            activity=test_infrastructure.activity,
            valid_from=test_infrastructure.configuration,
            valid_to=test_infrastructure.configuration,
            source_type__json_key="sourceTypeWithUnit",
            has_unit=True,
            has_fuel=False,
        )
        report_activity = make(
            ReportActivity,
            activity=test_infrastructure.activity,
            activity_base_schema=test_infrastructure.activity_json_schema,
            facility_report=test_infrastructure.facility_report,
            report_version=test_infrastructure.facility_report.report_version,
            json_data={"test": "test"},
        )
        service_under_test = ReportActivitySaveService(
            report_activity.facility_report.report_version.id,
            report_activity.facility_report.facility.id,
            report_activity.activity.id,
            make_recipe('registration.tests.utils.industry_operator_user'),
        )

        with pytest.raises(SourceType.DoesNotExist):
            service_under_test.save_source_type(report_activity, "thisIsNotAValidSourceTypeSlug", {"test": 123})

        with pytest.raises(ValueError, match="Source type sourceTypeWithUnit is expecting unit data"):
            service_under_test.save_source_type(report_activity, "sourceTypeWithUnit", {"test": 123})

        return_value = service_under_test.save_source_type(
            report_activity,
            "sourceTypeWithUnit",
            {"test": "source type with unit", "units": [{"unit_data_1": 1}, {"unit_data_2": 2}]},
        )

        assert return_value.json_data == {"test": "source type with unit"}
        assert return_value.activity_source_type_base_schema == act_st
        assert return_value.source_type == act_st.source_type
        assert return_value.report_activity == report_activity
        assert return_value.report_version == test_infrastructure.facility_report.report_version

        mock_save_unit.assert_has_calls(
            [call(return_value, {"unit_data_1": 1}), call(return_value, {"unit_data_2": 2})]
        )
        mock_save_fuel.assert_not_called()
        mock_save_emission.assert_not_called()

    @pytest.mark.skip()
    @patch("reporting.service.report_activity_save_service.ReportActivitySaveService.save_emission")
    @patch("reporting.service.report_activity_save_service.ReportActivitySaveService.save_fuel")
    @patch("reporting.service.report_activity_save_service.ReportActivitySaveService.save_unit")
    def test_save_source_type_with_fuel(
        self, mock_save_unit: MagicMock, mock_save_fuel: MagicMock, mock_save_emission: MagicMock
    ):
        test_infrastructure = TestInfrastructure.build()
        act_st = make_recipe(
            "reporting.tests.utils.activity_source_type_json_schema",
            activity=test_infrastructure.activity,
            valid_from=test_infrastructure.configuration,
            valid_to=test_infrastructure.configuration,
            source_type__json_key="sourceTypeWithFuel",
            has_unit=False,
            has_fuel=True,
        )
        report_activity = make(
            ReportActivity,
            activity=test_infrastructure.activity,
            activity_base_schema=test_infrastructure.activity_json_schema,
            facility_report=test_infrastructure.facility_report,
            report_version=test_infrastructure.facility_report.report_version,
            json_data={"test": "test"},
        )
        service_under_test = ReportActivitySaveService(
            report_activity.facility_report.report_version.id,
            report_activity.facility_report.facility.id,
            report_activity.activity.id,
            make_recipe('registration.tests.utils.industry_operator_user'),
        )

        with pytest.raises(ValueError, match="Source type sourceTypeWithFuel is expecting fuel data"):
            service_under_test.save_source_type(report_activity, "sourceTypeWithFuel", {"test": 123})

        return_value = service_under_test.save_source_type(
            report_activity, "sourceTypeWithFuel", {"test": 123, "fuels": [{"fuel": 1}, {"fuel_too": 2}]}
        )

        assert return_value.json_data == {"test": 123}
        assert return_value.activity_source_type_base_schema == act_st
        assert return_value.source_type == act_st.source_type
        assert return_value.report_activity == report_activity
        assert return_value.report_version == test_infrastructure.facility_report.report_version

        mock_save_unit.assert_not_called()
        mock_save_fuel.assert_has_calls(
            [call(return_value, None, {"fuel": 1}), call(return_value, None, {"fuel_too": 2})]
        )
        mock_save_emission.assert_not_called()

    @pytest.mark.skip()
    @patch("reporting.service.report_activity_save_service.ReportActivitySaveService.save_emission")
    @patch("reporting.service.report_activity_save_service.ReportActivitySaveService.save_fuel")
    @patch("reporting.service.report_activity_save_service.ReportActivitySaveService.save_unit")
    def test_save_source_type_without_unit_or_fuel(
        self, mock_save_unit: MagicMock, mock_save_fuel: MagicMock, mock_save_emission: MagicMock
    ):
        test_infrastructure = TestInfrastructure.build()
        act_st = make_recipe(
            "reporting.tests.utils.activity_source_type_json_schema",
            activity=test_infrastructure.activity,
            valid_from=test_infrastructure.configuration,
            valid_to=test_infrastructure.configuration,
            source_type__json_key="sourceTypeWithoutFuelOrUnit",
            has_unit=False,
            has_fuel=False,
        )
        report_activity = make(
            ReportActivity,
            activity=test_infrastructure.activity,
            activity_base_schema=test_infrastructure.activity_json_schema,
            facility_report=test_infrastructure.facility_report,
            report_version=test_infrastructure.facility_report.report_version,
            json_data={"test": "test"},
        )
        service_under_test = ReportActivitySaveService(
            report_activity.facility_report.report_version.id,
            report_activity.facility_report.facility.id,
            report_activity.activity.id,
            make_recipe('registration.tests.utils.industry_operator_user'),
        )

        with pytest.raises(ValueError, match="Source type sourceTypeWithoutFuelOrUnit is expecting emission data"):
            service_under_test.save_source_type(report_activity, "sourceTypeWithoutFuelOrUnit", {"test": 123})

        return_value = service_under_test.save_source_type(
            report_activity, "sourceTypeWithoutFuelOrUnit", {"test_emission": 123, "emissions": [{"a": 1}, {"b": 2}]}
        )

        assert return_value.json_data == {"test_emission": 123}
        assert return_value.activity_source_type_base_schema == act_st
        assert return_value.source_type == act_st.source_type
        assert return_value.report_activity == report_activity
        assert return_value.report_version == test_infrastructure.facility_report.report_version

        mock_save_unit.assert_not_called()
        mock_save_fuel.assert_not_called()
        mock_save_emission.assert_has_calls([call(return_value, None, {"a": 1}), call(return_value, None, {"b": 2})])

    @pytest.mark.skip()
    @patch("reporting.service.report_activity_save_service.ReportActivitySaveService.save_emission")
    @patch("reporting.service.report_activity_save_service.ReportActivitySaveService.save_fuel")
    def test_save_unit_with_fuel(self, mock_save_fuel: MagicMock, mock_save_emission: MagicMock):
        test_infrastructure = TestInfrastructure.build()
        act_st = make_recipe(
            "reporting.tests.utils.activity_source_type_json_schema",
            activity=test_infrastructure.activity,
            valid_from=test_infrastructure.configuration,
            valid_to=test_infrastructure.configuration,
            source_type__json_key="sourceTypeWithUnitAndFuel",
            has_unit=True,
            has_fuel=True,
        )
        report_activity = make(
            ReportActivity,
            activity=test_infrastructure.activity,
            activity_base_schema=test_infrastructure.activity_json_schema,
            facility_report=test_infrastructure.facility_report,
            report_version=test_infrastructure.report_version,
            json_data={"test": "test"},
        )
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
        act_st = make_recipe(
            "reporting.tests.utils.activity_source_type_json_schema",
            activity=test_infrastructure.activity,
            valid_from=test_infrastructure.configuration,
            valid_to=test_infrastructure.configuration,
            source_type__json_key="sourceTypeWithUnitAndFuel",
            has_unit=True,
            has_fuel=False,
        )
        report_activity = make(
            ReportActivity,
            activity=test_infrastructure.activity,
            activity_base_schema=test_infrastructure.activity_json_schema,
            facility_report=test_infrastructure.facility_report,
            report_version=test_infrastructure.report_version,
            json_data={"test": "test"},
        )
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

    @pytest.mark.skip()
    def test_save_fuel(self):
        raise

    @pytest.mark.skip()
    def test_save_emission(self):
        raise

    ########################
    #  Tests: update case  #
    ########################
    @pytest.mark.skip()
    def test_updates_activity_data(self):
        raise

    @pytest.mark.skip()
    def test_updates_source_type_data(self):
        pass

    @pytest.mark.skip()
    def test_updates_unit_data(self):
        pass
