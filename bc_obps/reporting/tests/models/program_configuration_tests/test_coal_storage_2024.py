from django.test import TestCase
from .base_program_configuration_test import BaseProgramConfigurationTest
from registration.models.activity import Activity
from reporting.models import CustomMethodologySchema
from reporting.models.configuration import Configuration


class CoalStorage2024Test(BaseProgramConfigurationTest, TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.activity_name = "Coal storage at facilities that combust coal"
        cls.year = 2024
        cls.config_element_count = 3
        cls.config = {
            "Stored coal piles": {
                "CH4": {
                    "Default EF": 0,
                    "Alternative Parameter Measurement Methodology": 1,
                    "Replacement Methodology": 1,
                },
            },
        }

    def testCustomMethodologySchema(self):
        # Fetch the activity and configuration objects
        activity = Activity.objects.get(name='Coal storage at facilities that combust coal')
        config = Configuration.objects.get(slug='2024')

        # Fetch the custom methodology schemas
        custom_schemas = CustomMethodologySchema.objects.filter(activity=activity, valid_from=config, valid_to=config)

        # Define the expected schema for the "Default EF" methodology
        expected_schema = {
            "coalPurchases": {
                "type": "array",
                "title": "Coal Purchases",
                "default": [{}],
                "items": {
                    "type": "object",
                    "properties": {
                        "annualCoalPurchaseAmount": {
                            "title": "Annual Amount Purchased Coal (tonnes)",
                            "type": "number",
                            "minimum": 0,
                        },
                        "coalBasin": {
                            "title": "Coal Basin/Field",
                            "type": "string",
                            "enum": [
                                "Battle River",
                                "Cadomin-Luscar",
                                "Central Appalachia (E KY)",
                                "Central Appalachia (VA)",
                                "Central Appalachia (WV)",
                                "Coalspur",
                                "Comox",
                                "Crowness",
                                "Elk Valley",
                                "Estavan",
                                "Illinois",
                                "N. Great Plains",
                                "Northwest (AK)",
                                "Northwest (WA)",
                                "Northern Appalachia",
                                "Obed Mountain",
                                "Peace River",
                                "Rockies (Green River Basin)",
                                "Rockies (Piceance Basin)",
                                "Rockies (Raton Basin)",
                                "Rockies (San Juan Basin)",
                                "Rockies (Uinta Basin)",
                                "Sheerness",
                                "Smokey River",
                                "Wabamun",
                                "Warrior",
                                "West Interior (Arkoma Basin)",
                                "West Interior (Forest City, Cherokee Basins)",
                                "West Interior (Gulf Coast Basin)",
                                "Willow Bunch",
                                "Other",
                            ],
                        },
                        "provinceState": {
                            "title": "Province/State",
                            "type": "string",
                            "enum": [
                                "Alabama",
                                "Alaska",
                                "Alberta",
                                "Arizona",
                                "Arkansas",
                                "British Columbia",
                                "California",
                                "Colorado",
                                "Illinois",
                                "Indiana",
                                "Iowa",
                                "Kansas",
                                "Kentucky West",
                                "Louisiana",
                                "Maryland",
                                "Mississippi",
                                "Missouri",
                                "Montana",
                                "New Brunswick",
                                "New Mexico",
                                "North Dakota",
                                "Nova Scotia",
                                "Ohio",
                                "Oklahoma",
                                "Pennsylvania",
                                "Saskatchewan",
                                "Tennessee",
                                "Texas",
                                "Utah",
                                "Virginia",
                                "Washington",
                                "West Virginia North",
                                "West Virginia South",
                                "Wyoming",
                                "Other",
                            ],
                        },
                        "mineType": {"title": "Mine Type", "type": "string", "enum": ["Underground", "Open-pit"]},
                        "defaultCH4EmissionFactor": {
                            "title": "Default CH4 Emission Factor",
                            "type": "number",
                            "minimum": 0,
                        },
                    },
                    "dependencies": {
                        "coalBasin": {
                            "oneOf": [
                                {
                                    "properties": {
                                        "coalBasin": {"enum": ["Other"]},
                                        "basinName": {"title": "Basin Name", "type": "string"},
                                        "basinDescription": {"title": "Basin Description", "type": "string"},
                                    }
                                },
                                {"not": {"properties": {"coalBasin": {"enum": ["Other"]}}}},
                            ]
                        }
                    },
                },
            }
        }

        # Check if the expected schema is present for "Default EF"
        coal_purchase_schema_exists = custom_schemas.filter(methodology__name='Default EF').exists()

        self.assertTrue(coal_purchase_schema_exists, msg='Default EF methodology schema is missing')

        for custom_schema in custom_schemas:
            if custom_schema.methodology.name == 'Default EF':
                actual_schema = custom_schema.json_schema['properties']

                # Assert equality
                self.assertEqual(
                    actual_schema,
                    expected_schema,
                    msg='Custom schema for Default EF does not match the expected schema',
                )
