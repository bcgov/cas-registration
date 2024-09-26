import datetime
from django.test import TestCase
import pytest
from model_bakery.baker import make_recipe
from registration.models.activity import Activity
from registration.models.user import User
from reporting.models.activity_json_schema import ActivityJsonSchema
from reporting.models.activity_source_type_json_schema import ActivitySourceTypeJsonSchema
from reporting.models.configuration import Configuration
from reporting.models.facility_report import FacilityReport
from reporting.models.fuel_type import FuelType
from reporting.models.gas_type import GasType
from reporting.models.report_activity import ReportActivity
from reporting.models.report_emission import ReportEmission
from reporting.models.report_fuel import ReportFuel
from reporting.models.report_source_type import ReportSourceType
from reporting.models.report_unit import ReportUnit
from reporting.models.source_type import SourceType
from reporting.service.report_activity_save_service import ReportActivitySaveService
from reporting.tests.service.data import report_activity_save_service_test_data


def get_report_unit(report_activity: ReportActivity, source_type_index: int, report_unit_index: int):
    return report_activity.reportsourcetype_records.order_by('id')[source_type_index].reportunit_records.order_by("id")[
        report_unit_index
    ]


def get_report_fuel(
    report_activity: ReportActivity, source_type_index: int, report_unit_index: int | None, report_fuel_index: int
):
    if report_unit_index is not None:
        return (
            report_activity.reportsourcetype_records.order_by('id')[source_type_index]
            .reportunit_records.order_by("id")[report_unit_index]
            .reportfuel_records.order_by('id')[report_fuel_index]
        )
    else:
        return report_activity.reportsourcetype_records.order_by('id')[source_type_index].reportfuel_records.order_by(
            'id'
        )[report_fuel_index]


class TestReportActivitySaveService(TestCase):
    facility_report: FacilityReport
    user: User
    configuration: Configuration

    def setUp(self):
        self.facility_report = make_recipe(
            'reporting.tests.utils.facility_report', report_version__report__created_at=datetime.date(2024, 9, 1)
        )
        self.user = make_recipe('registration.tests.utils.industry_operator_user')
        self.configuration = Configuration.objects.get(slug='2024')
        breakpoint()

    def save_test_data(self) -> ReportActivity:
        activity = Activity.objects.get(slug='gsc_non_compression')
        service_under_test = ReportActivitySaveService(
            self.facility_report.report_version.id,
            self.facility_report.facility.id,
            activity.id,
            self.user.user_guid,
        )
        return service_under_test.save(report_activity_save_service_test_data.test_data)

    #######################
    #  Tests: error case  #
    #######################

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

    def test_errors_out_if_no_emission_record(self):
        activity = Activity.objects.get(slug='gsc_non_compression')
        service_under_test = ReportActivitySaveService(
            self.facility_report.report_version.id,
            self.facility_report.facility.id,
            activity.id,
            self.user.user_guid,
        )
        with pytest.raises(ValueError):
            service_under_test.save(report_activity_save_service_test_data.no_emission_test_data)

    ########################
    #  Tests: create case  #
    ########################

    def test_creates_report_activity_data(self):
        report_activity = self.save_test_data()

        assert report_activity.json_data == {
            "test_activity_number": 12345,
            "test_activity_bool": True,
            "test_activity_str": "act",
            "gscFuelOrWasteLinearFacilitiesUsefulEnergy": True,
        }
        assert report_activity.facility_report == self.facility_report
        assert report_activity.activity == Activity.objects.get(slug='gsc_non_compression')
        assert report_activity.activity_base_schema == ActivityJsonSchema.objects.get(
            activity=self.activity, valid_from=self.configuration, valid_to=self.configuration
        )
        assert report_activity.report_version == self.facility_report.report_version

    def test_creates_source_type_data(self):
        report_activity = self.save_test_data()
        report_source_types = list(
            ReportSourceType.objects.filter(report_activity=report_activity).order_by("source_type__json_key")
        )
        assert report_source_types.count() == 2

        assert report_source_types[0].activity_source_type_base_schema == ActivitySourceTypeJsonSchema.objects.get(
            activity=Activity.objects.get(slug='gsc_non_compression'),
            source_type=SourceType.objects.get(json_key="gscFuelOrWasteLinearFacilitiesUsefulEnergy"),
            valid_from=self.configuration,
            valid_to=self.configuration,
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
            valid_from=self.configuration,
            valid_to=self.configuration,
        )
        assert report_source_types[1].source_type == SourceType.objects.get(
            json_key="fieldProcessVentGasLinearFacilities"
        )
        assert report_source_types[1].json_data == {}

    def test_creates_unit_data(self):
        report_activity = self.save_test_data()

        # Ordering by ID ensures we get them in order of creation
        report_units = list(
            ReportUnit.objects.filter(report_source_type__report_activity=report_activity).order_by("id")
        )

        assert len(report_units) == 3

        assert report_units[0].report_version == self.facility_report.report_version
        assert report_units[0].report_source_type.report_activity == report_activity
        assert report_units[0].report_source_type.source_type.json_key == "gscFuelOrWasteLinearFacilitiesUsefulEnergy"
        assert report_units[0].json_data == {}

        assert report_units[1].report_version == self.facility_report.report_version
        assert report_units[1].report_source_type.report_activity == report_activity
        assert report_units[1].report_source_type.source_type.json_key == "fieldProcessVentGasLinearFacilities"
        assert report_units[1].json_data == {}

        assert report_units[2].report_version == self.facility_report.report_version
        assert report_units[2].report_source_type.report_activity == report_activity
        assert report_units[2].report_source_type.source_type.json_key == "fieldProcessVentGasLinearFacilities"
        assert report_units[2].json_data == {}

    def test_creates_fuel_data(self):
        report_activity = self.save_test_data()

        report_fuels = list(
            ReportFuel.objects.filter(report_source_type__report_activity=report_activity).order_by("id")
        )

        assert len(report_fuels) == 5

        assert report_fuels[0].json_data == {}
        assert report_fuels[0].report_version == self.facility_report.report_version
        assert (
            report_fuels[0].report_unit
            == report_activity.reportsourcetype_records.order_by('id')[0].reportunit_records.order_by("id")[0]
        )
        assert (
            report_fuels[0].report_unit.report_source_type.source_type.json_key
            == "gscFuelOrWasteLinearFacilitiesUsefulEnergy"
        )
        assert report_fuels[0].fuel_type == FuelType.objects.get(name="C/D Waste - Plastic")

        assert report_fuels[1].json_data == {}
        assert report_fuels[1].report_version == self.facility_report.report_version
        assert report_fuels[1].report_unit.report_source_type.report_activity == report_activity
        assert (
            report_fuels[1].report_unit.report_source_type.source_type.json_key == "fieldProcessVentGasLinearFacilities"
        )
        assert report_fuels[1].fuel_type == FuelType.objects.get(name="C/D Waste - Plastic")

        assert report_fuels[2].json_data == {}
        assert report_fuels[2].report_version == self.facility_report.report_version
        assert report_fuels[2].report_unit.report_source_type.report_activity == report_activity
        assert (
            report_fuels[2].report_unit.report_source_type.source_type.json_key == "fieldProcessVentGasLinearFacilities"
        )
        assert report_fuels[2].fuel_type == FuelType.objects.get(name="C/D Waste - Plastic")

        assert report_fuels[3].json_data == {}
        assert report_fuels[3].report_version == self.facility_report.report_version
        assert report_fuels[3].report_unit.report_source_type.report_activity == report_activity
        assert (
            report_fuels[3].report_unit.report_source_type.source_type.json_key == "fieldProcessVentGasLinearFacilities"
        )
        assert report_fuels[3].fuel_type == FuelType.objects.get(name="C/D Waste - Plastic")

        assert report_fuels[4].json_data == {}
        assert report_fuels[4].report_version == self.facility_report.report_version
        assert report_fuels[4].report_unit.report_source_type.report_activity == report_activity
        assert (
            report_fuels[4].report_unit.report_source_type.source_type.json_key == "fieldProcessVentGasLinearFacilities"
        )
        assert report_fuels[4].fuel_type == FuelType.objects.get(name="C/D Waste - Plastic")

    def test_creates_emission_data(self):
        report_activity = self.save_test_data()

        report_emissions = list(
            ReportEmission.objects.filter(report_source_type__report_activity=report_activity).order_by("id")
        )
        assert len(report_emissions) == 9

        assert report_emissions[0].json_data == {}
        assert report_emissions[0].report_version == self.facility_report.report_version
        assert report_emissions[0].gas_type == GasType.objects.get(chemical_formula='CH4')
        assert report_emissions[0].report_fuel == report_activity

        assert report_emissions[0].json_data == {}
        assert report_emissions[0].report_version == self.facility_report.report_version
        assert report_emissions[0].gas_type == GasType.objects.get(chemical_formula='CH4')
        assert report_emissions[0].report_fuel.report_unit.report_source_type.report_activity == report_activity

        assert report_emissions[0].json_data == {}
        assert report_emissions[0].report_version == self.facility_report.report_version
        assert report_emissions[0].gas_type == GasType.objects.get(chemical_formula='CH4')
        assert report_emissions[0].report_fuel.report_unit.report_source_type.report_activity == report_activity

        assert report_emissions[0].json_data == {}
        assert report_emissions[0].report_version == self.facility_report.report_version
        assert report_emissions[0].gas_type == GasType.objects.get(chemical_formula='CH4')
        assert report_emissions[0].report_fuel.report_unit.report_source_type.report_activity == report_activity

        assert report_emissions[0].json_data == {}
        assert report_emissions[0].report_version == self.facility_report.report_version
        assert report_emissions[0].gas_type == GasType.objects.get(chemical_formula='CH4')
        assert report_emissions[0].report_fuel.report_unit.report_source_type.report_activity == report_activity

        assert report_emissions[0].json_data == {}
        assert report_emissions[0].report_version == self.facility_report.report_version
        assert report_emissions[0].gas_type == GasType.objects.get(chemical_formula='CH4')
        assert report_emissions[0].report_fuel.report_unit.report_source_type.report_activity == report_activity

    def test_creates_with_no_unit_in_schema(self):
        raise

    def test_creates_with_no_unit_no_fuel_in_schema(self):
        raise

    ########################
    #  Tests: update case  #
    ########################

    def test_updates_activity_data(self):
        raise

    def test_updates_source_type_data(self):
        pass

    def test_updates_unit_data(self):
        pass
