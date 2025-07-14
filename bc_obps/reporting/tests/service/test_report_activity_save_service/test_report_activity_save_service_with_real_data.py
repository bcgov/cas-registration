from django.test import TestCase
from registration.models.activity import Activity
from reporting.models.activity_source_type_json_schema import ActivitySourceTypeJsonSchema
from reporting.models.fuel_type import FuelType
from reporting.models.gas_type import GasType
from reporting.models.report_methodology import ReportMethodology
from reporting.models.report_emission import ReportEmission
from reporting.models.report_fuel import ReportFuel
from reporting.models.report_source_type import ReportSourceType
from reporting.models.report_unit import ReportUnit
from reporting.models.source_type import SourceType
from reporting.service.report_activity_save_service import ReportActivitySaveService
from reporting.tests.service.test_report_activity_save_service import data
from reporting.tests.service.test_report_activity_save_service.infrastructure import (
    TestInfrastructure,
    get_report_fuel_by_index,
    get_report_unit_by_index,
)
from django.core.exceptions import ValidationError


class TestReportActivitySaveService(TestCase):
    def test_errors_out_if_empty_json(self):
        t = TestInfrastructure.build()
        service_under_test = ReportActivitySaveService(
            t.report_version.id,
            t.facility_report.facility.id,
            t.activity.id,
            t.user.user_guid,
        )

        try:
            service_under_test.save({})
        except ValidationError as e:
            assert 'json_data' in e.message_dict
            assert 'This field cannot be blank.' in e.message_dict['json_data']

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
            "emission": 1,
            "equivalentEmission": 28.0000,
        }
        assert report_emissions[0].report_version == test_infrastructure.facility_report.report_version
        assert report_emissions[0].gas_type == GasType.objects.get(chemical_formula='CH4')
        assert report_emissions[0].report_fuel == get_report_fuel_by_index(report_activity, 0, 0, 0)

        assert report_emissions[1].json_data == {"emission": 1, "equivalentEmission": 1.0000}
        assert report_emissions[1].report_version == test_infrastructure.facility_report.report_version
        assert report_emissions[1].gas_type == GasType.objects.get(chemical_formula='CO2')
        assert report_emissions[1].report_fuel == get_report_fuel_by_index(report_activity, 1, 0, 0)

        assert report_emissions[2].json_data == {"emission": 1, "equivalentEmission": 265.0000}
        assert report_emissions[2].report_version == test_infrastructure.facility_report.report_version
        assert report_emissions[2].gas_type == GasType.objects.get(chemical_formula='N2O')
        assert report_emissions[2].report_fuel == get_report_fuel_by_index(report_activity, 1, 0, 0)

        assert report_emissions[3].json_data == {"emission": 1, "equivalentEmission": 1.0000}
        assert report_emissions[3].report_version == test_infrastructure.facility_report.report_version
        assert report_emissions[3].gas_type == GasType.objects.get(chemical_formula='CO2')
        assert report_emissions[3].report_fuel == get_report_fuel_by_index(report_activity, 1, 0, 1)

        assert report_emissions[4].json_data == {"emission": 1, "equivalentEmission": 265.0000}
        assert report_emissions[4].report_version == test_infrastructure.facility_report.report_version
        assert report_emissions[4].gas_type == GasType.objects.get(chemical_formula='N2O')
        assert report_emissions[4].report_fuel == get_report_fuel_by_index(report_activity, 1, 0, 1)

        assert report_emissions[5].json_data == {"emission": 1, "equivalentEmission": 1.0000}
        assert report_emissions[5].report_version == test_infrastructure.facility_report.report_version
        assert report_emissions[5].gas_type == GasType.objects.get(chemical_formula='CO2')
        assert report_emissions[5].report_fuel == get_report_fuel_by_index(report_activity, 1, 1, 0)

        assert report_emissions[6].json_data == {"emission": 1, "equivalentEmission": 265.0000}
        assert report_emissions[6].report_version == test_infrastructure.facility_report.report_version
        assert report_emissions[6].gas_type == GasType.objects.get(chemical_formula='N2O')
        assert report_emissions[6].report_fuel == get_report_fuel_by_index(report_activity, 1, 1, 0)

        assert report_emissions[7].json_data == {"emission": 1, "equivalentEmission": 1.0000}
        assert report_emissions[7].report_version == test_infrastructure.facility_report.report_version
        assert report_emissions[7].gas_type == GasType.objects.get(chemical_formula='CO2')
        assert report_emissions[7].report_fuel == get_report_fuel_by_index(report_activity, 1, 1, 1)

        assert report_emissions[8].json_data == {"emission": 1, "equivalentEmission": 265.0000}
        assert report_emissions[8].report_version == test_infrastructure.facility_report.report_version
        assert report_emissions[8].gas_type == GasType.objects.get(chemical_formula='N2O')
        assert report_emissions[8].report_fuel == get_report_fuel_by_index(report_activity, 1, 1, 1)

        # Report Methodologies
        report_methodology = ReportMethodology.objects.filter(
            report_version=test_infrastructure.facility_report.report_version.id
        ).order_by("id")
        assert report_methodology.count() == 9

        assert report_methodology[0].json_data == {
            "fuelDefaultHighHeatingValue": 10,
            "unitFuelCo2DefaultEmissionFactor": 20,
            "unitFuelCo2DefaultEmissionFactorFieldUnits": "kg/GJ",
        }
        assert report_methodology[0].methodology_id == 1
        assert report_methodology[0].report_emission_id == report_emissions[0].id
        assert report_methodology[0].report_version_id == test_infrastructure.facility_report.report_version.id

        assert report_methodology[1].json_data == {
            "fuelDefaultHighHeatingValue": 11,
            "unitFuelCo2DefaultEmissionFactor": 23,
            "unitFuelCo2DefaultEmissionFactorFieldUnits": "kg/GJ",
        }
        assert report_methodology[1].methodology_id == 1
        assert report_methodology[1].report_emission_id == report_emissions[1].id
        assert report_methodology[1].report_version_id == test_infrastructure.facility_report.report_version.id

        assert report_methodology[2].json_data == {
            "unitFuelCo2DefaultEmissionFactor": 3,
            "unitFuelCo2DefaultEmissionFactorFieldUnits": "kg/GJ",
        }
        assert report_methodology[2].methodology_id == 2
        assert report_methodology[2].report_emission_id == report_emissions[2].id
        assert report_methodology[2].report_version_id == test_infrastructure.facility_report.report_version.id

        assert report_methodology[3].json_data == {
            "unitFuelCo2DefaultEmissionFactor": 4,
            "unitFuelCo2DefaultEmissionFactorFieldUnits": "kg/GJ",
            "fuelAnnualWeightedAverageHighHeatingValue": 4,
        }
        assert report_methodology[3].methodology_id == 3
        assert report_methodology[3].report_emission_id == report_emissions[3].id
        assert report_methodology[3].report_version_id == test_infrastructure.facility_report.report_version.id

        assert report_methodology[4].json_data == {
            "unitFuelAnnualSteamGenerated": 5,
            "boilerRatio": 5,
            "unitFuelCo2EmissionFactor": 5,
            "unitFuelCo2EmissionFactorFieldUnits": "kg/GJ",
        }
        assert report_methodology[4].methodology_id == 4
        assert report_methodology[4].report_emission_id == report_emissions[4].id
        assert report_methodology[4].report_version_id == test_infrastructure.facility_report.report_version.id

        assert report_methodology[5].json_data == {"fuelAnnualWeightedAverageCarbonContentWeightFraction": 6}
        assert report_methodology[5].methodology_id == 5
        assert report_methodology[5].report_emission_id == report_emissions[5].id
        assert report_methodology[5].report_version_id == test_infrastructure.facility_report.report_version.id

        assert report_methodology[6].json_data == {
            "unitFuelAnnualSteamGenerated": 7,
            "unitFuelCo2MeasuredEmissionFactor": 7,
            "unitFuelCo2MeasuredEmissionFactorFieldUnits": "kg/fuel units",
        }
        assert report_methodology[6].methodology_id == 6
        assert report_methodology[6].report_emission_id == report_emissions[6].id
        assert report_methodology[6].report_version_id == test_infrastructure.facility_report.report_version.id

        assert report_methodology[7].json_data == {"description": "eight"}
        assert report_methodology[7].methodology_id == 7
        assert report_methodology[7].report_emission_id == report_emissions[7].id
        assert report_methodology[7].report_version_id == test_infrastructure.facility_report.report_version.id

        assert report_methodology[8].json_data == {"description": "nine"}
        assert report_methodology[8].methodology_id == 8
        assert report_methodology[8].report_emission_id == report_emissions[8].id
        assert report_methodology[8].report_version_id == test_infrastructure.facility_report.report_version.id

    def test_save_raw_data(self):
        """Test that raw activity data is saved correctly"""
        t = TestInfrastructure.build()
        service_under_test = ReportActivitySaveService(
            t.report_version.id,
            t.facility_report.facility.id,
            t.activity.id,
            t.user.user_guid,
        )
        test_data = {"sourceTypes": {"test_source": {"value": 123, "name": "test"}}}

        # Save the raw data using imported test data
        raw_activity = service_under_test.save_raw_data(test_data)

        # Assertions
        assert raw_activity is not None
        assert raw_activity.json_data == test_data

    def test_save_raw_data_updates_existing(self):
        """Test that raw activity data is updated correctly when it already exists"""
        t = TestInfrastructure.build()
        service_under_test = ReportActivitySaveService(
            t.report_version.id,
            t.facility_report.facility.id,
            t.activity.id,
            t.user.user_guid,
        )

        # Initial data
        initial_data = {"sourceTypes": {"test": {"value": "initial"}}}
        initial_raw = service_under_test.save_raw_data(initial_data)

        # Updated data
        updated_data = {"sourceTypes": {"test": {"value": "updated"}}}
        updated_raw = service_under_test.save_raw_data(updated_data)

        # Assertions
        assert updated_raw.id == initial_raw.id  # Same record was updated
        assert updated_raw.json_data == updated_data  # Data was updated
