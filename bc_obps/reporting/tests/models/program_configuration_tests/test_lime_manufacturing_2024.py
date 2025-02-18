from django.test import TestCase
from .base_program_configuration_test import BaseProgramConfigurationTest
from registration.models.activity import Activity
from reporting.models import CustomMethodologySchema
from reporting.models.configuration import Configuration


class LimeManufacturing2024Test(BaseProgramConfigurationTest, TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.activity_name = "Lime manufacturing"
        cls.year = 2024
        cls.config_element_count = 4
        cls.config = {
            "Calcination of carbonate materials in lime manufacturing": {
                "CO2": {
                    "Calculated": 0,
                    "CEMS": 0,
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                },
            },
        }

    def testCustomMethodologySchema(self):
        # Fetch the activity and configuration objects
        activity = Activity.objects.get(name='Lime manufacturing')
        config = Configuration.objects.get(slug='2024')

        # Fetch the custom methodology schemas
        custom_schemas = CustomMethodologySchema.objects.filter(activity=activity, valid_from=config, valid_to=config)

        # Define the expected schema for the "Calculated" methodology
        expected_schema = {
            "limeTypes": {
                "type": "array",
                "title": "Lime Types",
                "items": {
                    "type": "object",
                    "properties": {
                        "limeType": {
                            "type": "string",
                            "title": "Lime Type",
                            "enum": [
                                "Calcium Oxide",
                                "High Calcium Quicklime",
                                "Calcium Hydroxide",
                                "Hydrated Lime",
                                "Dolomitic Quick Lime",
                                "Dolomitic Hydrate",
                                "Other",
                            ],
                        },
                        "limeDescription": {"type": "string", "title": "Lime Description"},
                        "monthlyData": {
                            "type": "array",
                            "title": "Monthly Data",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "month": {
                                        "type": "string",
                                        "title": "Month",
                                        "enum": [
                                            "January",
                                            "February",
                                            "March",
                                            "April",
                                            "May",
                                            "June",
                                            "July",
                                            "August",
                                            "September",
                                            "October",
                                            "November",
                                            "December",
                                        ],
                                    },
                                    "emissionFactor": {"type": "number", "title": "Emission Factor (t CO2/t lime)"},
                                    "amountProduced": {"type": "number", "title": "Amount Produced (t)"},
                                    "caoContent": {"type": "number", "title": "CaO Content (weight fraction)"},
                                    "mgoContent": {"type": "number", "title": "MgO Content (weight fraction)"},
                                },
                            },
                        },
                    },
                },
            },
            "byproductWaste": {
                "type": "array",
                "title": "Byproduct / Waste",
                "items": {
                    "type": "object",
                    "properties": {
                        "byproductWasteID": {"type": "string", "title": "Byproduct / Waste ID"},
                        "byproductWasteDescription": {"type": "string", "title": "Byproduct / Waste Description"},
                        "quarterlyData": {
                            "type": "array",
                            "title": "Quarterly Data",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "quarter": {"type": "string", "title": "Quarter", "enum": ["Q1", "Q2", "Q3", "Q4"]},
                                    "emissionFactor": {"type": "number", "title": "Emission Factor (t CO2/t lime)"},
                                    "amountProduced": {"type": "number", "title": "Amount Produced (t)"},
                                    "caoContent": {"type": "number", "title": "CaO Content (weight fraction)"},
                                    "mgoContent": {"type": "number", "title": "MgO Content (weight fraction)"},
                                },
                            },
                        },
                    },
                },
            },
            "missingDataProcedures": {
                "type": "number",
                "title": "Number of times in the reporting year that missing data procedures were followed",
            },
        }

        # Check if the expected schema is present for "Calculated"
        lime_manufacturing_schema_exists = custom_schemas.filter(methodology__name='Calculated').exists()

        self.assertTrue(lime_manufacturing_schema_exists, msg='Calculated methodology schema is missing')

        for custom_schema in custom_schemas:
            if custom_schema.methodology.name == 'Calculated':
                actual_schema = custom_schema.json_schema['properties']

                # Assert equality
                self.assertEqual(
                    actual_schema,
                    expected_schema,
                    msg='Custom schema for Calculated does not match the expected schema',
                )
