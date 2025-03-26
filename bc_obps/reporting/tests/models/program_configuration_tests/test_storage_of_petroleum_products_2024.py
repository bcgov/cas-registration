from django.test import TestCase
from django.db.models import Count
from registration.models.activity import Activity
from reporting.models.configuration import Configuration
from reporting.models.configuration_element import ConfigurationElement


class StorageOfPetroleumProducts2024Test(TestCase):
    def testDataExists(self):
        # Fetch the activity and configuration objects
        activity = Activity.objects.get(name='Storage of petroleum products')
        config = Configuration.objects.get(slug='2024')

        # Filter ConfigurationElement objects
        config_elements = ConfigurationElement.objects.filter(
            valid_from__lte=config, valid_to__gte=config, activity=activity
        )

        # Define the expected configuration for each gas type
        gas_config = {
            'CH4': {
                'WCI.203(f)(1)': 0,
                'WCI.203(f)(2)': 0,
                'Alternative Parameter Measurement Methodology': 1,
                'Replacement Methodology': 1,
            }
        }

        config = {'Above-ground storage tanks': gas_config}

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

                self.assertQuerySetEqual(
                    actual_methodologies,
                    expected_methodologies,
                    ordered=False,
                    msg=f'{source_type_name}:{gas_name} contains config for the proper methods and field counts',
                )

        # Ensure there are exactly 4 configuration elements
        self.assertEqual(len(config_elements), 4)
