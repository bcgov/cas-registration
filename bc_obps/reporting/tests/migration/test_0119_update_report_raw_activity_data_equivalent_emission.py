import importlib
from django.test import TestCase
from django.apps import apps
from reporting.models import GasType

migration_module = importlib.import_module(
    'reporting.migrations.0119_update_report_raw_activity_data_equivalent_emission'
)
handle_emissions = migration_module.handle_emissions
find_emissions = migration_module.find_emissions
migrate_json_data = migration_module.migrate_json_data


class TestMigration0119Functions(TestCase):
    """Test migration 0119 functions."""

    def setUp(self):
        """Set up test data."""
        self.co2_gas = GasType.objects.create(
            name="Carbon Dioxide", chemical_formula="CO2", gwp=1, cas_number="124-38-9"
        )
        self.ch4_gas = GasType.objects.create(name="Methane", chemical_formula="CH4", gwp=28, cas_number="74-82-8")
        self.n2o_gas = GasType.objects.create(
            name="Nitrous Oxide", chemical_formula="N2O", gwp=265, cas_number="10024-97-2"
        )

    def test_handle_emissions_function(self):
        """Test the handle_emissions function with various scenarios."""
        emissions_list = [
            {"gasType": "CO2", "emission": 100.5, "equivalentEmission": "Value will be computed upon saving"},
            {"gasType": "CH4", "emission": 2.5, "equivalentEmission": "Value will be computed upon saving"},
            {"gasType": "N2O", "emission": 1.0, "equivalentEmission": "Value will be computed upon saving"},
        ]

        handle_emissions(apps, emissions_list)
        self.assertEqual(emissions_list[0]["equivalentEmission"], 100.5)
        self.assertEqual(emissions_list[1]["equivalentEmission"], 70.0)
        self.assertEqual(emissions_list[2]["equivalentEmission"], 265.0)

    def test_handle_emissions_decimal_precision(self):
        """Test that decimal calculations maintain correct precision."""
        emissions_list = [
            {"gasType": "CH4", "emission": 1.23456789, "equivalentEmission": "Value will be computed upon saving"},
            {"gasType": "N2O", "emission": 0.123456789, "equivalentEmission": "Value will be computed upon saving"},
        ]

        handle_emissions(apps, emissions_list)
        self.assertEqual(emissions_list[0]["equivalentEmission"], 34.5679)
        self.assertEqual(emissions_list[1]["equivalentEmission"], 32.716)

    def test_find_emissions_nested_dict(self):
        """Test find_emissions function with nested dictionary structures."""
        test_data = {
            "sourceTypes": {
                "flaringStacks": {
                    "units": [
                        {
                            "emissions": [
                                {
                                    "gasType": "CO2",
                                    "emission": 10.0,
                                    "equivalentEmission": "Value will be computed upon saving",
                                },
                                {
                                    "gasType": "CH4",
                                    "emission": 1.5,
                                    "equivalentEmission": "Value will be computed upon saving",
                                },
                            ]
                        }
                    ]
                },
                "otherSource": {
                    "emissions": [
                        {"gasType": "N2O", "emission": 0.5, "equivalentEmission": "Value will be computed upon saving"}
                    ]
                },
            }
        }

        updated_data = find_emissions(apps, test_data, "emissions")

        flaring_emissions = updated_data["sourceTypes"]["flaringStacks"]["units"][0]["emissions"]
        self.assertEqual(flaring_emissions[0]["equivalentEmission"], 10.0)
        self.assertEqual(flaring_emissions[1]["equivalentEmission"], 42.0)

        other_emissions = updated_data["sourceTypes"]["otherSource"]["emissions"]
        self.assertEqual(other_emissions[0]["equivalentEmission"], 132.5)

    def test_find_emissions_nested_arrays(self):
        """Test find_emissions function with nested array structures."""
        test_data = {
            "arrayLevel": [
                {
                    "emissions": [
                        {"gasType": "CH4", "emission": 2.0, "equivalentEmission": "Value will be computed upon saving"}
                    ]
                },
                {
                    "nested": {
                        "emissions": [
                            {
                                "gasType": "CO2",
                                "emission": 5.0,
                                "equivalentEmission": "Value will be computed upon saving",
                            }
                        ]
                    }
                },
            ]
        }

        updated_data = find_emissions(apps, test_data, "emissions")

        self.assertEqual(updated_data["arrayLevel"][0]["emissions"][0]["equivalentEmission"], 56.0)

        self.assertEqual(updated_data["arrayLevel"][1]["nested"]["emissions"][0]["equivalentEmission"], 5.0)

    def test_find_emissions_deeply_nested(self):
        """Test find_emissions function with deeply nested structures."""
        test_data = {
            "level1": {
                "level2": {
                    "level3": {
                        "level4": {
                            "emissions": [
                                {
                                    "gasType": "CO2",
                                    "emission": 50.0,
                                    "equivalentEmission": "Value will be computed upon saving",
                                }
                            ]
                        }
                    }
                }
            }
        }

        updated_data = find_emissions(apps, test_data, "emissions")

        # Check deeply nested emission
        deep_emission = updated_data["level1"]["level2"]["level3"]["level4"]["emissions"][0]
        self.assertEqual(deep_emission["equivalentEmission"], 50.0)

    def test_find_emissions_preserves_other_data(self):
        """Test that find_emissions preserves all other data."""
        test_data = {
            "id": 1190,
            "sourceTypes": {
                "flaringStacks": {
                    "units": [
                        {
                            "type": "Source sub-type",
                            "sourceSubType": "Onshore Petroleum and Natural Gas Production",
                            "fuels": [
                                {
                                    "fuelType": {
                                        "fuelName": "Natural Gas",
                                        "fuelUnit": "Sm^3",
                                        "fuelClassification": "Non-biomass",
                                    },
                                    "emissions": [
                                        {
                                            "gasType": "CO2",
                                            "emission": 317.0829,
                                            "methodology": {"methodology": "WCI.363 (k)"},
                                            "equivalentEmission": "Value will be computed upon saving",
                                        }
                                    ],
                                    "annualFuelAmount": 139800,
                                }
                            ],
                        }
                    ]
                }
            },
            "flaringStacks": True,
        }

        updated_data = find_emissions(apps, test_data, "emissions")

        # Check that all other data is preserved
        self.assertEqual(updated_data["id"], 1190)
        self.assertEqual(updated_data["flaringStacks"], True)
        self.assertEqual(updated_data["sourceTypes"]["flaringStacks"]["units"][0]["type"], "Source sub-type")
        self.assertEqual(
            updated_data["sourceTypes"]["flaringStacks"]["units"][0]["fuels"][0]["fuelType"]["fuelName"], "Natural Gas"
        )
        self.assertEqual(
            updated_data["sourceTypes"]["flaringStacks"]["units"][0]["fuels"][0]["annualFuelAmount"], 139800
        )
        self.assertEqual(
            updated_data["sourceTypes"]["flaringStacks"]["units"][0]["fuels"][0]["emissions"][0]["methodology"][
                "methodology"
            ],
            "WCI.363 (k)",
        )

        # Check that equivalentEmission was updated
        self.assertEqual(
            updated_data["sourceTypes"]["flaringStacks"]["units"][0]["fuels"][0]["emissions"][0]["equivalentEmission"],
            317.0829,
        )
