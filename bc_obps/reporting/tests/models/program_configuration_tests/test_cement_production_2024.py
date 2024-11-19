from django.test import TestCase
from django.db.models import Count
from registration.models.activity import Activity
from reporting.models.configuration import Configuration
from reporting.models.configuration_element import ConfigurationElement


class TestCementProduction2024(TestCase):
    def testDataExists(self):
        activity = Activity.objects.get(name='Cement production')
        config = Configuration.objects.get(slug='2024')

        config_elements = ConfigurationElement.objects.filter(
            valid_from__lte=config, valid_to__gte=config, activity=activity
        )

        # For each gas, the list of methodologies and their associated field's count
        gas_config = {
            'CO2': {
                'CEMS': 0,
                'Calcination Emissions': 11,
                'Oxidation Emissions': 2,
                'Alternative Parameter Methodology': 1,
                'Replacement Methodology': 1,
            },
        }

        config = {
            'Calcination of limestone, shale, sand, slag or other raw materials used to produce clinker, as well as the oxidization of organic carbon in the raw material': gas_config,
        }

        self.assertQuerysetEqual(
            config_elements.values_list('source_type__name', flat=True).distinct(),
            config.keys(),
            ordered=False,
            msg=f'{activity} contains config for the proper source types',
        )

        for source_type_name, gas_config in config.items():
            self.assertQuerysetEqual(
                config_elements.filter(source_type__name=source_type_name)
                .values_list('gas_type__chemical_formula', flat=True)
                .distinct(),
                gas_config.keys(),
                ordered=False,
                msg=f'{source_type_name} contains config for the proper gas types',
            )
            for gas_name, methods in gas_config.items():
                self.assertQuerysetEqual(
                    config_elements.filter(source_type__name=source_type_name, gas_type__chemical_formula=gas_name)
                    .annotate(field_count=Count('reporting_fields'))
                    .values_list('methodology__name', 'field_count'),
                    list(methods.items()),
                    ordered=False,
                    msg=f'{source_type_name}:{gas_name} contains config for the proper methods and field counts',
                )

        assert len(config_elements) == 5
