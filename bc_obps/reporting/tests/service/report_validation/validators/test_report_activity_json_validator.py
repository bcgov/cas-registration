import json
from unittest.mock import patch
from model_bakery.baker import make_recipe
import pytest
from registration.models.activity import Activity
from reporting.models.reporting_year import ReportingYear
from reporting.service.report_validation.report_validation_error import (
    ReportValidationError,
    Severity,
)
from reporting.service.report_validation.validators.report_activity_json_validation import (
    enable_jsonschema_draft_2020_validation,
    validate,
)


@pytest.mark.django_db
class TestReportActivityJsonValidator:
    def test_enable_jsonschema_draft_2020_validation(self):
        schema = {
            "type": "object",
            "properties": {
                "name": {"type": "string"},
                "test_prop": {
                    "type": "object",
                    "properties": {
                        "test_prop_1": {"type": "string"},
                        "test_prop_2": {"type": "string"},
                    },
                    "dependencies": {
                        "test_prop_1": {
                            "properties": {
                                "test_prop_2": {
                                    "type": "object",
                                    "properties": {"test_prop_3": {}},
                                },
                            }
                        }
                    },
                },
            },
            "dependencies": {"name": {"minLength": 3}},
        }

        enable_jsonschema_draft_2020_validation(schema)

        assert not schema["unevaluatedProperties"]
        assert not schema["properties"]["test_prop"]["unevaluatedProperties"]
        assert not schema["properties"]["test_prop"]["dependentSchemas"]["test_prop_1"]["properties"]["test_prop_2"][
            "unevaluatedProperties"
        ]

        assert "dependentSchemas" in schema and "dependencies" not in schema
        assert (
            "dependentSchemas" in schema["properties"]["test_prop"]
            and "dependencies" not in schema["properties"]["test_prop"]
        )

    @patch("service.form_builder_service.FormBuilderService.build_form_schema")
    def test_validate_with_extra_field(self, mock_build_form_schema):
        mock_build_form_schema.return_value = json.dumps(
            {
                "schema": {
                    "type": "object",
                    "properties": {
                        "testSourceType": {
                            "type": "boolean",
                        },
                        "sourceTypes": {
                            "type": "object",
                            "properties": {
                                "testSourceType": {
                                    "type": "object",
                                    "properties": {
                                        "prop1": {"type": "string"},
                                    },
                                }
                            },
                        },
                    },
                }
            }
        )

        raw_activity_data = make_recipe(
            "reporting.tests.utils.report_raw_activity_data",
            facility_report__facility__id="00000000-0000-0000-0000-000000000011",
            activity__slug="test-activity",
            json_data={
                "testSourceType": True,
                "sourceTypes": {
                    "testSourceType": {
                        "prop1": "value1",
                    }
                },
            },
        )

        errors = validate(raw_activity_data.facility_report.report_version)
        assert errors == {}

        raw_activity_data = make_recipe(
            "reporting.tests.utils.report_raw_activity_data",
            facility_report__facility__id="00000000-0000-0000-0000-000000000012",
            activity__slug="test-activity",
            json_data={
                "testSourceType": True,
                "sourceTypes": {
                    "testSourceType": {
                        "prop1": "value1",
                        "prop3": "value3",
                    }
                },
            },
        )

        errors = validate(raw_activity_data.facility_report.report_version)
        assert errors == {
            "facility_00000000-0000-0000-0000-000000000012_test-activity": ReportValidationError(
                Severity.ERROR,
                "Validation error: Unevaluated properties are not allowed ('prop3' was unexpected) at: sourceTypes > testSourceType",
            )
        }

    @patch("service.form_builder_service.FormBuilderService.build_form_schema")
    def test_validate_with_nested_dependent_schema(self, mock_build_form_schema):
        mock_build_form_schema.return_value = json.dumps(
            {
                "schema": {
                    "type": "object",
                    "properties": {
                        "testSourceType": {
                            "type": "boolean",
                        },
                        "sourceTypes": {
                            "type": "object",
                            "properties": {
                                "testSourceType": {
                                    "type": "object",
                                    "properties": {
                                        "prop1": {
                                            "type": "string",
                                            "enum": ["value1", "value2"],
                                        },
                                    },
                                    "dependencies": {
                                        "prop1": {
                                            "oneOf": [
                                                {
                                                    "properties": {
                                                        "prop1": {"enum": ["value1"]},
                                                        "prop2": {"type": "string"},
                                                    }
                                                },
                                                {
                                                    "properties": {
                                                        "prop1": {"enum": ["value2"]},
                                                        "prop3": {"type": "number"},
                                                    }
                                                },
                                            ]
                                        }
                                    },
                                }
                            },
                        },
                    },
                }
            }
        )

        raw_activity_data = make_recipe(
            "reporting.tests.utils.report_raw_activity_data",
            facility_report__facility__id="00000000-0000-0000-0000-000000000012",
            activity__slug="test-activity",
            json_data={
                "testSourceType": True,
                "sourceTypes": {
                    "testSourceType": {
                        "prop1": "value2",
                        "prop3": 1234,
                    }
                },
            },
        )

        errors = validate(raw_activity_data.facility_report.report_version)
        assert errors == {}

        raw_activity_data = make_recipe(
            "reporting.tests.utils.report_raw_activity_data",
            facility_report__facility__id="00000000-0000-0000-0000-000000000013",
            activity__slug="test-activity",
            json_data={
                "testSourceType": True,
                "sourceTypes": {
                    "testSourceType": {
                        "prop1": "value2",
                    }
                },
            },
        )

        errors = validate(raw_activity_data.facility_report.report_version)
        assert errors == {}

    def test_validate_integration(self):
        test_data = {
            "fuelCombustionForElectricityGeneration": True,
            "sourceTypes": {
                "fuelCombustionForElectricityGeneration": {
                    "units": [
                        {
                            "fuels": [
                                {
                                    "fuelType": {
                                        "fuelName": "Acid Gas",
                                        "fuelUnit": "Sm^3",
                                        "fuelClassification": "Non-biomass",
                                    },
                                    "emissions": [
                                        {
                                            "gasType": "CH4",
                                            "emission": 777,
                                            "equivalentEmission": "Value will be computed upon saving",
                                            "methodology": {
                                                "methodology": "Default EF",
                                                "unitFuelCh4DefaultEf": 888,
                                                "unitFuelCh4DefaultEfFieldUnits": "g/fuel units",
                                            },
                                        }
                                    ],
                                    "fuelDescription": "test description",
                                    "annualFuelAmount": 666,
                                }
                            ],
                            "netPower": 555,
                            "unitName": "test unit",
                            "unitType": "Kiln",
                            "generationType": "Cogeneration",
                            "nameplateCapacity": 444,
                            "cycleType": "Topping",
                            "thermalOutput": 111,
                            "supplementalFiringPurpose": "Industrial output",
                            "steamHeatAcquisitionAmount": 222,
                            "steamHeatAcquisitionProvider": "333",
                        },
                        {
                            "fuels": [
                                {
                                    "fuelType": {
                                        "fuelName": "Diesel",
                                        "fuelUnit": "kilolitres",
                                        "fuelClassification": "Non-biomass",
                                    },
                                    "emissions": [
                                        {
                                            "gasType": "N2O",
                                            "emission": 4444,
                                            "equivalentEmission": "Value will be computed upon saving",
                                            "methodology": {
                                                "methodology": "Heat Input/Default EF",
                                                "unitFuelHeatInput": 5555,
                                                "unitFuelN2OHeatInputDefaultEf": 6666,
                                                "unitFuelN2OHeatInputDefaultEfFieldUnits": "g/GJ",
                                            },
                                        }
                                    ],
                                    "fuelDescription": "2222",
                                    "annualFuelAmount": 3333,
                                }
                            ],
                            "netPower": 1111,
                            "unitName": "test unit 2",
                            "unitType": "Other",
                            "generationType": "Non-Cogeneration",
                            "nameplateCapacity": 999,
                        },
                    ]
                }
            },
        }

        raw_activity_data = make_recipe(
            "reporting.tests.utils.report_raw_activity_data",
            facility_report__facility__id="00000000-0000-0000-0000-000000000014",
            facility_report__report_version__report__reporting_year=ReportingYear.objects.get(reporting_year=2024),
            activity=Activity.objects.get(slug="electricity_generation"),
            json_data=test_data,
        )

        errors = validate(raw_activity_data.facility_report.report_version)

        assert errors == {}
