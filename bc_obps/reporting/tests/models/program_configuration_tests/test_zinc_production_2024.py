from django.test import TestCase
from .base_program_configuration_test import BaseProgramConfigurationTest
from registration.models.activity import Activity
from reporting.models import CustomMethodologySchema
from reporting.models.configuration import Configuration


class LeadProduction2024Test(BaseProgramConfigurationTest, TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.activity_name = "Zinc production"
        cls.year = 2024
        cls.config_element_count = 4
        cls.config = {
            "Use of reducing agents during zinc production": {
                "CO2": {
                    "Measured CC": 0,
                    "CEMS": 0,
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                },
            },
        }

    def testCustomMethodologySchema(self):
        # Fetch the activity and configuration objects
        activity = Activity.objects.get(name='Zinc production')
        config = Configuration.objects.get(slug='2024')

        # Fetch the custom methodology schemas
        custom_schemas = CustomMethodologySchema.objects.filter(activity=activity, valid_from=config, valid_to=config)

        # Define the expected schema for the "Measured CC" methodology
        expected_schema = {
            "monthsMissingDataProcedures": {
                "type": "number",
                "title": "Number of months the missing data procedures were used",
            },
            "missingDataDescription": {
                "type": "string",
                "title": "Description of how the monthly mass of materials with missing data was determined",
            },
            "reducingAgents": {
                "type": "array",
                "title": "Reducing Agent",
                "default": [{}],
                "items": {
                    "type": "object",
                    "properties": {
                        "amountUsed": {"type": "number", "title": "Amount Used of Reducing Agent (t)"},
                        "carbonContent": {
                            "type": "number",
                            "title": "Reducing Agent Carbon Content (weight fraction)",
                            "minimum": 0,
                            "maximum": 1,
                        },
                        "emissionFactor": {
                            "type": "number",
                            "title": "Emission Factor (tonnes CO2/tonnes reducing agent)",
                        },
                    },
                },
            },
        }

        # Check if the expected schema is present for "Measured CC"
        zinc_production_schema_exists = custom_schemas.filter(methodology__name='Measured CC').exists()

        self.assertTrue(zinc_production_schema_exists, msg='Measured CC methodology schema is missing')

        for custom_schema in custom_schemas:
            if custom_schema.methodology.name == 'Measured CC':
                actual_schema = custom_schema.json_schema['properties']

                # Assert equality
                self.assertEqual(
                    actual_schema,
                    expected_schema,
                    msg='Custom schema for Measured CC does not match the expected schema',
                )
