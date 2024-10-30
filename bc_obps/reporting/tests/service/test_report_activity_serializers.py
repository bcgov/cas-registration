from unittest.mock import patch, MagicMock
from django.test import SimpleTestCase
from reporting.models.report_emission import ReportEmission
from model_bakery.baker import prepare
from reporting.models.report_fuel import ReportFuel
from reporting.models.report_source_type import ReportSourceType
from reporting.models.report_unit import ReportUnit
from reporting.service.report_activity_serializers import (
    ReportEmissionIterableSerializer,
    ReportFuelIterableSerializer,
    ReportSourceTypeIterableSerializer,
    ReportUnitIterableSerializer,
)


class TestReportActivityDataSerializers(SimpleTestCase):
    def test_report_emissions_serializer(self):

        report_emissions = [
            prepare(
                ReportEmission,
                id=92871,
                gas_type__chemical_formula="CaS",
                json_data={"testprop1": "test", "emission": 1234},
            ),
            prepare(
                ReportEmission,
                id=987134,
                gas_type__chemical_formula="GaS",
                json_data={"testprop2": "test", "emission": 0},
            ),
        ]

        serialized = ReportEmissionIterableSerializer.serialize(report_emissions)

        print(serialized)

        assert serialized == [
            {
                'emission': 1234,
                'gasType': 'CaS',
                'id': 92871,
                'testprop1': 'test',
            },
            {
                'emission': 0,
                'gasType': 'GaS',
                'id': 987134,
                'testprop2': 'test',
            },
        ]

    @patch("reporting.models.report_fuel.ReportFuel.reportemission_records")
    @patch("reporting.service.report_activity_serializers.ReportEmissionIterableSerializer.serialize")
    def test_report_fuel_serializer(self, mock_emissions_serializer: MagicMock, mock_reverse_manager: MagicMock):
        mock_emissions_serializer.return_value = "mock serialized!!"
        report_fuels = [
            prepare(
                ReportFuel,
                id=2,
                fuel_type__name='testFuelName',
                fuel_type__unit='testFuelUnit',
                fuel_type__classification='testFuelClass',
                json_data={"aaa": "bbb", "ccc": 123},
            ),
            prepare(
                ReportFuel,
                id=9876,
                fuel_type__name='fuel2',
                fuel_type__unit='unit2',
                fuel_type__classification='class2',
                json_data={"x": "y", "z": 1},
            ),
        ]

        serialized = ReportFuelIterableSerializer.serialize(report_fuels)

        assert mock_emissions_serializer.call_count == 2
        assert mock_reverse_manager.all.call_count == 2
        assert serialized == [
            {
                'aaa': 'bbb',
                'ccc': 123,
                'emissions': 'mock serialized!!',
                'fuelType': {
                    'fuelClassification': 'testFuelClass',
                    'fuelName': 'testFuelName',
                    'fuelUnit': 'testFuelUnit',
                },
                'id': 2,
            },
            {
                'emissions': 'mock serialized!!',
                'fuelType': {
                    'fuelClassification': 'class2',
                    'fuelName': 'fuel2',
                    'fuelUnit': 'unit2',
                },
                'id': 9876,
                'x': 'y',
                'z': 1,
            },
        ]

    @patch("reporting.models.report_unit.ReportUnit.reportfuel_records")
    @patch("reporting.service.report_activity_serializers.ReportFuelIterableSerializer.serialize")
    def test_report_unit_serializer(self, mock_fuels_serializer: MagicMock, mock_reverse_manager: MagicMock):
        mock_fuels_serializer.return_value = 'serialized!'

        report_units = [
            prepare(ReportUnit, id=8971, json_data={"mock_json_prop": True}),
            prepare(ReportUnit, id=999999, json_data={"real_json_prop": False}),
        ]

        serialized = ReportUnitIterableSerializer.serialize(report_units)

        assert mock_fuels_serializer.call_count == 2
        assert mock_reverse_manager.all.call_count == 2
        assert serialized == [
            {
                'fuels': 'serialized!',
                'id': 8971,
                'mock_json_prop': True,
            },
            {
                'fuels': 'serialized!',
                'id': 999999,
                'real_json_prop': False,
            },
        ]

    @patch("reporting.models.report_source_type.ReportSourceType.reportunit_records")
    @patch("reporting.models.report_source_type.ReportSourceType.reportfuel_records")
    @patch("reporting.models.report_source_type.ReportSourceType.reportemission_records")
    @patch("reporting.service.report_activity_serializers.ReportUnitIterableSerializer.serialize")
    @patch("reporting.service.report_activity_serializers.ReportFuelIterableSerializer.serialize")
    @patch("reporting.service.report_activity_serializers.ReportEmissionIterableSerializer.serialize")
    def test_report_source_type_serializer(
        self,
        mock_emissions_serializer: MagicMock,
        mock_fuels_serializer: MagicMock,
        mock_units_serializer: MagicMock,
        mock_emission_reverse_manager: MagicMock,
        mock_fuel_reverse_manager: MagicMock,
        mock_unit_reverse_manager: MagicMock,
    ):
        mock_emissions_serializer.return_value = "emissions serialized!"
        mock_fuels_serializer.return_value = "fuels serialized!"
        mock_units_serializer.return_value = "units serialized!"

        report_source_types = [
            prepare(
                ReportSourceType,
                id=1,
                json_data={"with_unit_1": 1},
                source_type__json_key="stWithUnit",
                activity_source_type_base_schema__has_unit=True,
                activity_source_type_base_schema__has_fuel=True,
            ),
            prepare(
                ReportSourceType,
                id=2,
                json_data={"with_unit_2": 1},
                source_type__json_key="anotherStWithUnit",
                activity_source_type_base_schema__has_unit=True,
                activity_source_type_base_schema__has_fuel=True,
            ),
            prepare(
                ReportSourceType,
                id=3,
                json_data={"with_fuel_only": 1},
                source_type__json_key="stWithFuelOnly",
                activity_source_type_base_schema__has_unit=False,
                activity_source_type_base_schema__has_fuel=True,
            ),
            prepare(
                ReportSourceType,
                id=4,
                json_data={"with_emission_only": 1},
                source_type__json_key="stWithEmissionOnly",
                activity_source_type_base_schema__has_unit=False,
                activity_source_type_base_schema__has_fuel=False,
            ),
        ]

        serialized = ReportSourceTypeIterableSerializer.serialize(report_source_types)

        assert mock_units_serializer.call_count == 2
        assert mock_fuels_serializer.call_count == 1
        assert mock_emissions_serializer.call_count == 1

        assert mock_unit_reverse_manager.all.call_count == 2
        assert mock_fuel_reverse_manager.all.call_count == 1
        assert mock_emission_reverse_manager.all.call_count == 1
        assert serialized == {
            'anotherStWithUnit': {
                'id': 1,
                'units': 'units serialized!',
                'with_unit_2': 1,
            },
            'stWithEmissionOnly': {
                'emissions': 'emissions serialized!',
                'id': 1,
                'with_emission_only': 1,
            },
            'stWithFuelOnly': {
                'fuels': 'fuels serialized!',
                'id': 1,
                'with_fuel_only': 1,
            },
            'stWithUnit': {
                'id': 1,
                'units': 'units serialized!',
                'with_unit_1': 1,
            },
        }
