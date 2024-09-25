from cgi import test
import datetime
import pytest
from model_bakery.baker import make_recipe
from registration.models.activity import Activity
from reporting.models.activity_source_type_json_schema import ActivitySourceTypeJsonSchema
from reporting.models.configuration import Configuration
from reporting.models.source_type import SourceType
from reporting.service.report_activity_save_service import ReportActivitySaveService


@pytest.mark.django_db
class TestReportActivitySaveService:

    def setup_method(self):
        self.facility_report = make_recipe(
            'reporting.tests.utils.facility_report', report_version__report__created_at=datetime.date(2024, 9, 1)
        )
        self.user = make_recipe('registration.tests.utils.industry_operator_user')

    def test_creates_nothing_if_empty(self):
        pass

    def test_creates_data_with_unit_and_fuel(self):
        activity = Activity.objects.get(slug='gsc_non_compression')

        test_data = {
            "test_activity_number": 12345,
            "test_activity_bool": True,
            "test_activity_str": "act",
            "gscFuelOrWasteLinearFacilitiesUsefulEnergy": True,
            "sourceTypes": {
                "gscFuelOrWasteLinearFacilitiesUsefulEnergy": {
                    "test_st_number": 12345,
                    "test_st_bool": True,
                    "test_st_str": "st",
                    "units": [
                        {
                            "test_unit_number": 12345,
                            "test_unit_bool": True,
                            "test_unit_str": "unit",
                            "description": "test description",
                            "fuels": [
                                {
                                    "test_fuel_number": 12345,
                                    "test_fuel_bool": True,
                                    "test_fuel_str": "test",
                                    "fuelName": "C/D Waste - Plastic",
                                    "emissions": [
                                        {
                                            "gasType": "CH4",
                                            "test_emission_number": 12345,
                                            "test_emission_bool": True,
                                            "test_emission_str": "test",
                                        },
                                    ],
                                },
                            ],
                        }
                    ],
                },
                "fieldProcessVentGasLinearFacilities": {
                    "units": [
                        {
                            "fuels": [
                                {
                                    "fuelName": "Diesel",
                                    "emissions": [
                                        {
                                            "gasType": "CO2",
                                        },
                                        {
                                            "gasType": "N2O",
                                        },
                                    ],
                                },
                                {
                                    "fuelName": "Plastics",
                                    "emissions": [
                                        {
                                            "gasType": "CO2",
                                        },
                                        {
                                            "gasType": "N2O",
                                        },
                                    ],
                                },
                            ]
                        },
                        {
                            "fuels": [
                                {
                                    "fuelName": "Diesel",
                                    "emissions": [
                                        {
                                            "gasType": "CO2",
                                        },
                                        {
                                            "gasType": "N2O",
                                        },
                                    ],
                                },
                                {
                                    "fuelName": "Plastics",
                                    "emissions": [
                                        {
                                            "gasType": "CO2",
                                        },
                                        {
                                            "gasType": "N2O",
                                        },
                                    ],
                                },
                            ]
                        },
                    ]
                },
            },
        }

        service_under_test = ReportActivitySaveService(
            self.facility_report.report_version.id,
            self.facility_report.facility.id,
            activity.id,  # GSC Excluding line tracing
            self.user.user_guid,
        )

        report_activity = service_under_test.save(test_data)

        assert report_activity.json_data == {
            "test_activity_number": 12345,
            "test_activity_bool": True,
            "test_activity_str": "act",
            "gscFuelOrWasteLinearFacilitiesUsefulEnergy": True,
        }
        assert report_activity.reportsourcetype_records.count() == 2

        report_source_types = list(report_activity.reportsourcetype_records.all())
        assert report_source_types[0].json_data == {
            "test_st_number": 12345,
            "test_st_bool": True,
            "test_st_str": "st",
        }

        assert report_source_types[1].json_data == {}

    def test_updates_activity_data(self):
        raise

    def test_updates_source_type_data(self):
        pass

    def test_updates_unit_data(self):
        pass
