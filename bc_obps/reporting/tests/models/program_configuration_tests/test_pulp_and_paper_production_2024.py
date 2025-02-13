from django.test import TestCase
from django.db.models import Count
from registration.models.activity import Activity
from reporting.models.configuration import Configuration
from reporting.models.configuration_element import ConfigurationElement


class PulpAndPaperProduction2024TestCase(TestCase):
    def testDataExists(self):
        activity = Activity.objects.get(name='Pulp and paper production')
        config = Configuration.objects.get(slug='2024')

        config_elements = ConfigurationElement.objects.filter(
            valid_from__lte=config, valid_to__gte=config, activity=activity
        )

        # For each gas, the list of methodologies and their associated field's count
        gas_config = {
            'CO2': {
                'Solids-HHV': 3,
                'Solids-CC': 3,
                'Make-up Chemical Use Methodology': 2,
                'Alternative Parameter Measurement Methodology': 1,
                'Replacement Methodology': 1,
            },
            'CH4': {
                'Solids-HHV': 3,
                'Alternative Parameter Measurement Methodology': 1,
                'Replacement Methodology': 1,
            },
            'N2O': {
                'Solids-HHV': 3,
                'Alternative Parameter Measurement Methodology': 1,
                'Replacement Methodology': 1,
            },
        }

        config = {
            'Pulping and chemical recovery': gas_config,
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

        assert len(config_elements) == 11
