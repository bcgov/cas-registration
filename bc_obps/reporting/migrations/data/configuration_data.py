from datetime import date
from django.apps.registry import Apps
from django.db.backends.base.schema import BaseDatabaseSchemaEditor as SchemaEditor


def init_configuration_data(apps: Apps, schema_editor: SchemaEditor):
    '''
    Add inital sample configuration for the reporting app
    '''

    '''
    0. Load models
    '''
    ReportingActivity = apps.get_model('registration', 'ReportingActivity')
    ReportingSourceType = apps.get_model('reporting', 'ReportingSourceType')
    ReportingGasType = apps.get_model('reporting', 'ReportingGasType')
    ReportingMethodology = apps.get_model('reporting', 'ReportingMethodology')

    '''
    1. Create the configuration record
    '''
    Configuration = apps.get_model('reporting', 'Configuration')
    Configuration.objects.create(
        slug='Sample Configuration 2024', valid_from=date(1900, 1, 1), valid_to=date(2099, 12, 31)
    )

    '''
    2. Create the configuration elementsd
    '''
    ConfigurationElement = apps.get_model('reporting', 'ConfigurationElement')
    ConfigurationElement.objects.bulk_create(
        [
            # Activity: GSC
            *[
                ConfigurationElement(
                    reporting_activity=ReportingActivity.objects.filter(name='General stationary combustion').first(),
                    reporting_source_type=ReportingSourceType.objects.filter(
                        name='General stationary combustion of fuel or waste with production of useful energy'
                    ).first(),
                    # All disaggregated combustion gasses
                    reporting_gas_type=disaggregated_combustion_gas,
                    # All applicable methods
                    reporting_methodology=method,
                    # All configs
                    valid_from=Configuration.objects.first(),
                    valid_to=Configuration.objects.first(),
                )
                for method in ReportingMethodology.objects.filter(
                    name__in=[
                        'Default HHV/Default EF',
                        'Default EF',
                        'Measured HHV/Default EF',
                        'Measured Steam/Default EF',
                        'Measured CC',
                        'Measured Steam/Measured EF',
                        'Alternative Parameter Measurement',
                        'Replacement Methodology',
                    ]
                )
                for disaggregated_combustion_gas in ReportingGasType.objects.filter(
                    name__in=[
                        'carbon dioxide from non-biomass not listed in Schedule C.1',
                        'carbon dioxide from non-biomass listed in Schedule C.1',
                        'carbon dioxide from biomass listed in Schedule C',
                        'carbon dioxide from biomass not listed in Schedule C',
                        'methane from non-biomass not listed in Schedule C.1',
                        'methane from non-biomass listed in Schedule C.',
                        'methane from biomass listed in Schedule C',
                        'methane from biomass not listed in Schedule C',
                        'nitrous oxide from non-biomass not listed in Schedule C.1',
                        'nitrous oxide from non-biomass listed in Schedule C.1',
                        'nitrous oxide from biomass listed in Schedule C',
                        'nitrous oxide from biomass not listed in Schedule C',
                    ]
                )
            ],
            *[
                ConfigurationElement(
                    reporting_activity=ReportingActivity.objects.filter(name='General stationary combustion').first(),
                    reporting_source_type=ReportingSourceType.objects.filter(
                        name='General stationary combustion of waste without production of useful energy'
                    ).first(),
                    # All disaggregated combustion gasses
                    reporting_gas_type=disaggregated_combustion_gas,
                    # All applicable methods
                    reporting_methodology=method,
                    # All configs
                    valid_from=Configuration.objects.first(),
                    valid_to=Configuration.objects.first(),
                )
                for method in ReportingMethodology.objects.filter(
                    name__in=[
                        'Default HHV/Default EF',
                        'Default EF',
                        'Measured HHV/Default EF',
                        'Measured Steam/Default EF',
                        'Measured CC',
                        'Measured Steam/Measured EF',
                        'Alternative Parameter Measurement',
                        'Replacement Methodology',
                    ]
                )
                for disaggregated_combustion_gas in ReportingGasType.objects.filter(
                    name__in=[
                        'carbon dioxide from non-biomass not listed in Schedule C.1',
                        'carbon dioxide from non-biomass listed in Schedule C.1',
                        'carbon dioxide from biomass listed in Schedule C',
                        'carbon dioxide from biomass not listed in Schedule C',
                        'methane from non-biomass not listed in Schedule C.1',
                        'methane from non-biomass listed in Schedule C.',
                        'methane from biomass listed in Schedule C',
                        'methane from biomass not listed in Schedule C',
                        'nitrous oxide from non-biomass not listed in Schedule C.1',
                        'nitrous oxide from non-biomass listed in Schedule C.1',
                        'nitrous oxide from biomass listed in Schedule C',
                        'nitrous oxide from biomass not listed in Schedule C',
                    ]
                )
            ],
            # ... etc etc etc for all the source types in that huge category
            # Activity: Aluminum or alumina production
            *[
                ConfigurationElement(
                    reporting_activity=ReportingActivity.objects.filter(name='Aluminum or alumina production').first(),
                    reporting_source_type=ReportingSourceType.objects.filter(
                        name='Anode consumption in electrolysis cells, anode and cathode baking or green coke calcination'
                    ).first(),
                    reporting_gas_type=ReportingGasType.objects.filter(name='Carbon dioxide').first(),
                    reporting_methodology=method,
                    valid_from=Configuration.objects.first(),
                    valid_to=Configuration.objects.first(),
                )
                for method in ReportingMethodology.objects.filter(
                    name__in=[['Anode Consumption', 'Replacement Methodology', 'Alternative Parameter Measurement']]
                )
            ],
            *[
                ConfigurationElement(
                    reporting_activity=ReportingActivity.objects.filter(name='Aluminum or alumina production').first(),
                    reporting_source_type=ReportingSourceType.objects.filter(name='Anode effects').first(),
                    reporting_gas_type=ReportingGasType.objects.filter(name='Tetraluoromethane').first(),
                    reporting_methodology=method,
                    valid_from=Configuration.objects.first(),
                    valid_to=Configuration.objects.first(),
                )
                for method in ReportingMethodology.objects.filter(
                    name__in=[
                        [
                            'Slope method',
                            'Overvoltage method',
                            'Replacement Methodology',
                            'Alternative Parameter Measurement',
                        ]
                    ]
                )
            ],
            *[
                ConfigurationElement(
                    reporting_activity=ReportingActivity.objects.filter(name='Aluminum or alumina production').first(),
                    reporting_source_type=ReportingSourceType.objects.filter(name='Anode effects').first(),
                    reporting_gas_type=ReportingGasType.objects.filter(name='Perfluoroethane').first(),
                    reporting_methodology=method,
                    valid_from=Configuration.objects.first(),
                    valid_to=Configuration.objects.first(),
                )
                for method in ReportingMethodology.objects.filter(
                    name__in=[
                        [
                            'C2F6 anode effects',
                            'Replacement Methodology',
                            'Alternative Parameter Measurement',
                        ]
                    ]
                )
            ],
            *[
                ConfigurationElement(
                    reporting_activity=ReportingActivity.objects.filter(name='Aluminum or alumina production').first(),
                    reporting_source_type=ReportingSourceType.objects.filter(
                        name='Cover gas from electrolysis cells'
                    ).first(),
                    reporting_gas_type=ReportingGasType.objects.filter(name='Sulfur Hexafluoride').first(),
                    reporting_methodology=method,
                    valid_from=Configuration.objects.first(),
                    valid_to=Configuration.objects.first(),
                )
                for method in ReportingMethodology.objects.filter(
                    name__in=[
                        [
                            'Inventory',
                            'Input/output',
                            'Replacement Methodology',
                            'Alternative Parameter Measurement',
                        ]
                    ]
                )
            ],
        ]
    )
