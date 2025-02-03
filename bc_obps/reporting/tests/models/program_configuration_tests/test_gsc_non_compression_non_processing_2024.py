from django.test import TestCase
from django.db.models import Count
from registration.models.activity import Activity
from reporting.models.configuration import Configuration
from reporting.models.configuration_element import ConfigurationElement


class GSCNonCompressionNonProcessing2024Test(TestCase):
    def testDataExists(self):
        activity = Activity.objects.get(name='General stationary non-compression and non-processing combustion')
        config = Configuration.objects.get(slug='2024')

        config_elements = ConfigurationElement.objects.filter(
            valid_from__lte=config, valid_to__gte=config, activity=activity
        )

        # For each gas, the list of methodologies and their associated field's count
        gas_config = {
            'CO2': {
                'Default HHV/Default EF': 2,
                'Default EF': 1,
                'Measured HHV/Default EF': 2,
                'Measured Steam/Default EF': 3,
                'Measured CC': 1,
                'Measured Steam/Measured EF': 2,
                'CEMS': 0,
                'Alternative Parameter Measurement': 1,
                'Replacement Methodology': 1,
            },
            'CH4': {
                'Default HHV/Default EF': 2,
                'Default EF': 1,
                'Measured HHV/Default EF': 2,
                'Measured EF': 1,
                'Measured Steam/Default EF': 3,
                'Heat Input/Default EF': 2,
                'Alternative Parameter Measurement': 1,
                'Replacement Methodology': 1,
            },
            'N2O': {
                'Default HHV/Default EF': 2,
                'Default EF': 1,
                'Measured HHV/Default EF': 2,
                'Measured EF': 1,
                'Measured Steam/Default EF': 3,
                'Heat Input/Default EF': 2,
                'Alternative Parameter Measurement': 1,
                'Replacement Methodology': 1,
            },
        }

        config = {
            'Field gas or process vent gas combustion at a linear facilities operation': gas_config,
            'General stationary combustion of fuel or waste at a linear facilities operation resulting in the production of useful energy': gas_config,
            'General stationary combustion of fuel or waste at a linear facilities operation not resulting in the production of useful energy': gas_config,
        }

        self.assertQuerySetEqual(
            config_elements.values_list('source_type__name', flat=True).distinct(),
            config.keys(),
            ordered=False,
            msg=f'{activity} contains config for the proper source types',
        )

        for source_type_name, gas_config in config.items():
            self.assertQuerySetEqual(
                config_elements.filter(source_type__name=source_type_name)
                .values_list('gas_type__chemical_formula', flat=True)
                .distinct(),
                gas_config.keys(),
                ordered=False,
                msg=f'{source_type_name} contains config for the proper gas types',
            )
            for gas_name, methods in gas_config.items():
                self.assertQuerySetEqual(
                    config_elements.filter(source_type__name=source_type_name, gas_type__chemical_formula=gas_name)
                    .annotate(field_count=Count('reporting_fields'))
                    .values_list('methodology__name', 'field_count'),
                    list(methods.items()),
                    ordered=False,
                    msg=f'{source_type_name}:{gas_name} contains config for the proper methods and field counts',
                )

        assert len(config_elements) == 75
