from django.test import TestCase
from django.db.models import Count
from registration.models.activity import Activity
from reporting.models import CustomMethodologySchema
from reporting.models.configuration import Configuration
from reporting.models.configuration_element import ConfigurationElement


class HydrogenProduction2024Test(TestCase):
    def testDataExists(self):
        # Fetch the activity and configuration objects
        activity = Activity.objects.get(name='Hydrogen production')
        config = Configuration.objects.get(slug='2024')

        # Filter ConfigurationElement objects
        config_elements = ConfigurationElement.objects.filter(
            valid_from__lte=config, valid_to__gte=config, activity=activity
        )

        # Define the expected configuration for each gas type
        gas_config = {
            'CO2': {
                'CEMS': 0,
                'Feedstock Material Balance': 0,
                'Alternative Parameter Measurement Methodology': 1,
                'Replacement Methodology': 1,
            }
        }

        config = {
            'Steam reformation of hydrocarbons, partial oxidation of hydrocarbons or other transformation of hydrocarbon feedstock': gas_config
        }

        # Check if the source types match the expected values
        expected_source_types = config.keys()
        actual_source_types = config_elements.values_list('source_type__name', flat=True).distinct()

        self.assertQuerySetEqual(
            actual_source_types,
            expected_source_types,
            ordered=False,
            msg=f'{activity} contains config for the proper source types',
        )

        # For each source type, check if the gas types and methodology counts match the expected values
        for source_type_name, gas_config in config.items():
            actual_gas_types = (
                config_elements.filter(source_type__name=source_type_name)
                .values_list('gas_type__chemical_formula', flat=True)
                .distinct()
            )

            self.assertQuerySetEqual(
                actual_gas_types,
                gas_config.keys(),
                ordered=False,
                msg=f'{source_type_name} contains config for the proper gas types',
            )

            for gas_name, methods in gas_config.items():
                actual_methodologies = (
                    config_elements.filter(source_type__name=source_type_name, gas_type__chemical_formula=gas_name)
                    .annotate(field_count=Count('reporting_fields'))
                    .values_list('methodology__name', 'field_count')
                )

                expected_methodologies = list(methods.items())

                # Print actual vs. expected for debugging purposes
                print(f"Checking {source_type_name}:{gas_name}")
                print(f"Expected: {expected_methodologies}")
                print(f"Actual: {list(actual_methodologies)}")

                self.assertQuerySetEqual(
                    actual_methodologies,
                    expected_methodologies,
                    ordered=False,
                    msg=f'{source_type_name}:{gas_name} contains config for the proper methods and field counts',
                )

        # Ensure there are exactly 4 configuration elements
        self.assertEqual(len(config_elements), 4)

    def testCustomMethodologySchema(self):
        # Fetch the activity and configuration objects
        activity = Activity.objects.get(name='Hydrogen production')
        config = Configuration.objects.get(slug='2024')

        # Fetch the custom methodology schemas
        custom_schemas = CustomMethodologySchema.objects.filter(activity=activity, valid_from=config, valid_to=config)

        # Define the expected schema for the "Feedstock Material Balance" methodology
        expected_schema = {
            "feedstocks": {
                "type": "array",
                "title": "Feedstocks",
                "items": {
                    "type": "object",
                    "properties": {
                        "feedstock": {"type": "string", "title": "Feedstock"},
                        "annualFeedstockAmount": {"type": "string", "title": "Annual Feedstock Amount"},
                        "annualHydrogenProduction": {
                            "type": "number",
                            "title": "Annual Hydrogen Production",
                            "minimum": 0,
                        },
                        "unitForAnnualFeedstockAmount": {
                            "type": "string",
                            "title": "Unit for Annual Feedstock Amount",
                            "enum": ["Kilolitres", "Tonnes", "Bone dry tonnes"],
                        },
                    },
                },
            }
        }

        # Check if the expected schema is present for "Feedstock Material Balance"
        feedstock_schema_exists = custom_schemas.filter(methodology__name='Feedstock Material Balance').exists()

        self.assertTrue(feedstock_schema_exists, msg='Feedstock Material Balance methodology schema is missing')

        for custom_schema in custom_schemas:
            if custom_schema.methodology.name == 'Feedstock Material Balance':
                actual_schema = custom_schema.json_schema['properties']

                # Assert equality
                self.assertEqual(
                    actual_schema,
                    expected_schema,
                    msg='Custom schema for Feedstock Material Balance does not match the expected schema',
                )
