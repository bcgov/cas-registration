from django.db import migrations
import json

#### CONFIG DATA ####


def init_configuration_element_data(apps, schema_monitor):
    '''
    Add initial data to erc.configuration_element
    '''

    ConfigurationElement = apps.get_model('reporting', 'ConfigurationElement')
    Activity = apps.get_model('registration', 'Activity')
    SourceType = apps.get_model('reporting', 'SourceType')
    GasType = apps.get_model('reporting', 'GasType')
    Methodology = apps.get_model('reporting', 'Methodology')
    Configuration = apps.get_model('reporting', 'Configuration')
    # General stationary combustion of fuel or waste with production of useful energy
    ConfigurationElement.objects.bulk_create(
        [
            # CO2
            ConfigurationElement(
                activity_id=Activity.objects.get(
                    name='General stationary combustion solely for the purpose of line tracing'
                ).id,
                source_type_id=SourceType.objects.get(
                    name='General stationary combustion of fuel or waste with production of useful energy'
                ).id,
                gas_type_id=GasType.objects.get(chemical_formula='CO2').id,
                methodology_id=Methodology.objects.get(name='Default HHV/Default EF').id,
                valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
                valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
            ),
            ConfigurationElement(
                activity_id=Activity.objects.get(
                    name='General stationary combustion solely for the purpose of line tracing'
                ).id,
                source_type_id=SourceType.objects.get(
                    name='General stationary combustion of fuel or waste with production of useful energy'
                ).id,
                gas_type_id=GasType.objects.get(chemical_formula='CO2').id,
                methodology_id=Methodology.objects.get(name='Default EF').id,
                valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
                valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
            ),
            ConfigurationElement(
                activity_id=Activity.objects.get(
                    name='General stationary combustion solely for the purpose of line tracing'
                ).id,
                source_type_id=SourceType.objects.get(
                    name='General stationary combustion of fuel or waste with production of useful energy'
                ).id,
                gas_type_id=GasType.objects.get(chemical_formula='CO2').id,
                methodology_id=Methodology.objects.get(name='Measured HHV/Default EF').id,
                valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
                valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
            ),
            ConfigurationElement(
                activity_id=Activity.objects.get(
                    name='General stationary combustion solely for the purpose of line tracing'
                ).id,
                source_type_id=SourceType.objects.get(
                    name='General stationary combustion of fuel or waste with production of useful energy'
                ).id,
                gas_type_id=GasType.objects.get(chemical_formula='CO2').id,
                methodology_id=Methodology.objects.get(name='Measured Steam/Default EF').id,
                valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
                valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
            ),
            ConfigurationElement(
                activity_id=Activity.objects.get(
                    name='General stationary combustion solely for the purpose of line tracing'
                ).id,
                source_type_id=SourceType.objects.get(
                    name='General stationary combustion of fuel or waste with production of useful energy'
                ).id,
                gas_type_id=GasType.objects.get(chemical_formula='CO2').id,
                methodology_id=Methodology.objects.get(name='Measured CC').id,
                valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
                valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
            ),
            ConfigurationElement(
                activity_id=Activity.objects.get(
                    name='General stationary combustion solely for the purpose of line tracing'
                ).id,
                source_type_id=SourceType.objects.get(
                    name='General stationary combustion of fuel or waste with production of useful energy'
                ).id,
                gas_type_id=GasType.objects.get(chemical_formula='CO2').id,
                methodology_id=Methodology.objects.get(name='Measured Steam/Measured EF').id,
                valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
                valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
            ),
            ConfigurationElement(
                activity_id=Activity.objects.get(
                    name='General stationary combustion solely for the purpose of line tracing'
                ).id,
                source_type_id=SourceType.objects.get(
                    name='General stationary combustion of fuel or waste with production of useful energy'
                ).id,
                gas_type_id=GasType.objects.get(chemical_formula='CO2').id,
                methodology_id=Methodology.objects.get(name='Alternative Parameter Measurement Methodology').id,
                valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
                valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
            ),
            ConfigurationElement(
                activity_id=Activity.objects.get(
                    name='General stationary combustion solely for the purpose of line tracing'
                ).id,
                source_type_id=SourceType.objects.get(
                    name='General stationary combustion of fuel or waste with production of useful energy'
                ).id,
                gas_type_id=GasType.objects.get(chemical_formula='CO2').id,
                methodology_id=Methodology.objects.get(name='Replacement Methodology').id,
                valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
                valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
            ),
            # CH4
            ConfigurationElement(
                activity_id=Activity.objects.get(
                    name='General stationary combustion solely for the purpose of line tracing'
                ).id,
                source_type_id=SourceType.objects.get(
                    name='General stationary combustion of fuel or waste with production of useful energy'
                ).id,
                gas_type_id=GasType.objects.get(chemical_formula='CH4').id,
                methodology_id=Methodology.objects.get(name='Default HHV/Default EF').id,
                valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
                valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
            ),
            ConfigurationElement(
                activity_id=Activity.objects.get(
                    name='General stationary combustion solely for the purpose of line tracing'
                ).id,
                source_type_id=SourceType.objects.get(
                    name='General stationary combustion of fuel or waste with production of useful energy'
                ).id,
                gas_type_id=GasType.objects.get(chemical_formula='CH4').id,
                methodology_id=Methodology.objects.get(name='Default EF').id,
                valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
                valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
            ),
            ConfigurationElement(
                activity_id=Activity.objects.get(
                    name='General stationary combustion solely for the purpose of line tracing'
                ).id,
                source_type_id=SourceType.objects.get(
                    name='General stationary combustion of fuel or waste with production of useful energy'
                ).id,
                gas_type_id=GasType.objects.get(chemical_formula='CH4').id,
                methodology_id=Methodology.objects.get(name='Measured HHV/Default EF').id,
                valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
                valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
            ),
            ConfigurationElement(
                activity_id=Activity.objects.get(
                    name='General stationary combustion solely for the purpose of line tracing'
                ).id,
                source_type_id=SourceType.objects.get(
                    name='General stationary combustion of fuel or waste with production of useful energy'
                ).id,
                gas_type_id=GasType.objects.get(chemical_formula='CH4').id,
                methodology_id=Methodology.objects.get(name='Measured EF').id,
                valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
                valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
            ),
            ConfigurationElement(
                activity_id=Activity.objects.get(
                    name='General stationary combustion solely for the purpose of line tracing'
                ).id,
                source_type_id=SourceType.objects.get(
                    name='General stationary combustion of fuel or waste with production of useful energy'
                ).id,
                gas_type_id=GasType.objects.get(chemical_formula='CH4').id,
                methodology_id=Methodology.objects.get(name='Measured Steam/Default EF').id,
                valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
                valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
            ),
            ConfigurationElement(
                activity_id=Activity.objects.get(
                    name='General stationary combustion solely for the purpose of line tracing'
                ).id,
                source_type_id=SourceType.objects.get(
                    name='General stationary combustion of fuel or waste with production of useful energy'
                ).id,
                gas_type_id=GasType.objects.get(chemical_formula='CH4').id,
                methodology_id=Methodology.objects.get(name='Heat Input/Default EF').id,
                valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
                valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
            ),
            ConfigurationElement(
                activity_id=Activity.objects.get(
                    name='General stationary combustion solely for the purpose of line tracing'
                ).id,
                source_type_id=SourceType.objects.get(
                    name='General stationary combustion of fuel or waste with production of useful energy'
                ).id,
                gas_type_id=GasType.objects.get(chemical_formula='CH4').id,
                methodology_id=Methodology.objects.get(name='Alternative Parameter Measurement Methodology').id,
                valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
                valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
            ),
            ConfigurationElement(
                activity_id=Activity.objects.get(
                    name='General stationary combustion solely for the purpose of line tracing'
                ).id,
                source_type_id=SourceType.objects.get(
                    name='General stationary combustion of fuel or waste with production of useful energy'
                ).id,
                gas_type_id=GasType.objects.get(chemical_formula='CH4').id,
                methodology_id=Methodology.objects.get(name='Replacement Methodology').id,
                valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
                valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
            ),
            # N2O
            ConfigurationElement(
                activity_id=Activity.objects.get(
                    name='General stationary combustion solely for the purpose of line tracing'
                ).id,
                source_type_id=SourceType.objects.get(
                    name='General stationary combustion of fuel or waste with production of useful energy'
                ).id,
                gas_type_id=GasType.objects.get(chemical_formula='N2O').id,
                methodology_id=Methodology.objects.get(name='Default HHV/Default EF').id,
                valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
                valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
            ),
            ConfigurationElement(
                activity_id=Activity.objects.get(
                    name='General stationary combustion solely for the purpose of line tracing'
                ).id,
                source_type_id=SourceType.objects.get(
                    name='General stationary combustion of fuel or waste with production of useful energy'
                ).id,
                gas_type_id=GasType.objects.get(chemical_formula='N2O').id,
                methodology_id=Methodology.objects.get(name='Default EF').id,
                valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
                valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
            ),
            ConfigurationElement(
                activity_id=Activity.objects.get(
                    name='General stationary combustion solely for the purpose of line tracing'
                ).id,
                source_type_id=SourceType.objects.get(
                    name='General stationary combustion of fuel or waste with production of useful energy'
                ).id,
                gas_type_id=GasType.objects.get(chemical_formula='N2O').id,
                methodology_id=Methodology.objects.get(name='Measured HHV/Default EF').id,
                valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
                valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
            ),
            ConfigurationElement(
                activity_id=Activity.objects.get(
                    name='General stationary combustion solely for the purpose of line tracing'
                ).id,
                source_type_id=SourceType.objects.get(
                    name='General stationary combustion of fuel or waste with production of useful energy'
                ).id,
                gas_type_id=GasType.objects.get(chemical_formula='N2O').id,
                methodology_id=Methodology.objects.get(name='Measured EF').id,
                valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
                valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
            ),
            ConfigurationElement(
                activity_id=Activity.objects.get(
                    name='General stationary combustion solely for the purpose of line tracing'
                ).id,
                source_type_id=SourceType.objects.get(
                    name='General stationary combustion of fuel or waste with production of useful energy'
                ).id,
                gas_type_id=GasType.objects.get(chemical_formula='N2O').id,
                methodology_id=Methodology.objects.get(name='Measured Steam/Default EF').id,
                valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
                valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
            ),
            ConfigurationElement(
                activity_id=Activity.objects.get(
                    name='General stationary combustion solely for the purpose of line tracing'
                ).id,
                source_type_id=SourceType.objects.get(
                    name='General stationary combustion of fuel or waste with production of useful energy'
                ).id,
                gas_type_id=GasType.objects.get(chemical_formula='N2O').id,
                methodology_id=Methodology.objects.get(name='Heat Input/Default EF').id,
                valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
                valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
            ),
            ConfigurationElement(
                activity_id=Activity.objects.get(
                    name='General stationary combustion solely for the purpose of line tracing'
                ).id,
                source_type_id=SourceType.objects.get(
                    name='General stationary combustion of fuel or waste with production of useful energy'
                ).id,
                gas_type_id=GasType.objects.get(chemical_formula='N2O').id,
                methodology_id=Methodology.objects.get(name='Alternative Parameter Measurement Methodology').id,
                valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
                valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
            ),
            ConfigurationElement(
                activity_id=Activity.objects.get(
                    name='General stationary combustion solely for the purpose of line tracing'
                ).id,
                source_type_id=SourceType.objects.get(
                    name='General stationary combustion of fuel or waste with production of useful energy'
                ).id,
                gas_type_id=GasType.objects.get(chemical_formula='N2O').id,
                methodology_id=Methodology.objects.get(name='Replacement Methodology').id,
                valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
                valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
            ),
        ]
    )


def reverse_init_configuration_element_data(apps, schema_monitor):
    '''
    Remove initial data from erc.configuration_element
    '''
    Configuration = apps.get_model('reporting', 'Configuration')
    ConfigurationElement = apps.get_model('reporting', 'ConfigurationElement')
    ConfigurationElement.objects.filter(
        valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).delete()


def init_configuration_element_reporting_fields_data(apps, schema_monitor):
    '''
    Add initial data to erc.activity_source_type_base_schema
    '''
    ConfigurationElement = apps.get_model('reporting', 'ConfigurationElement')
    Activity = apps.get_model('registration', 'Activity')
    SourceType = apps.get_model('reporting', 'SourceType')
    GasType = apps.get_model('reporting', 'GasType')
    Methodology = apps.get_model('reporting', 'Methodology')
    Configuration = apps.get_model('reporting', 'Configuration')
    ReportingField = apps.get_model('reporting', 'ReportingField')
    # SOURCE TYPE: with production of useful energy
    # CO2 - Default HHV/Default EF - Fuel Default High Heating Value
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(
            name='General stationary combustion solely for the purpose of line tracing'
        ).id,
        source_type_id=SourceType.objects.get(
            name='General stationary combustion of fuel or waste with production of useful energy'
        ).id,
        gas_type_id=GasType.objects.get(chemical_formula='CO2').id,
        methodology_id=Methodology.objects.get(name='Default HHV/Default EF').id,
        valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(
        ReportingField.objects.get(field_name='Fuel Default High Heating Value', field_units__isnull=True)
    )
    # CO2 - Default HHV/Default EF - Unit-Fuel-CO2 Default Emission Factor
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(
            name='General stationary combustion solely for the purpose of line tracing'
        ).id,
        source_type_id=SourceType.objects.get(
            name='General stationary combustion of fuel or waste with production of useful energy'
        ).id,
        gas_type_id=GasType.objects.get(chemical_formula='CO2').id,
        methodology_id=Methodology.objects.get(name='Default HHV/Default EF').id,
        valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(
        ReportingField.objects.get(field_name='Unit-Fuel-CO2 Default HHV-Default EF', field_units='kg/GJ')
    )
    # CO2 - Default EF - Unit-Fuel-CO2 Default Emission Factor
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(
            name='General stationary combustion solely for the purpose of line tracing'
        ).id,
        source_type_id=SourceType.objects.get(
            name='General stationary combustion of fuel or waste with production of useful energy'
        ).id,
        gas_type_id=GasType.objects.get(chemical_formula='CO2').id,
        methodology_id=Methodology.objects.get(name='Default EF').id,
        valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(
        ReportingField.objects.get(field_name='Unit-Fuel-CO2 Default EF', field_units='kg/fuel units')
    )
    # CO2 - Measured HHV/Default EF - Fuel Annual Weighted Average High Heating Value
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(
            name='General stationary combustion solely for the purpose of line tracing'
        ).id,
        source_type_id=SourceType.objects.get(
            name='General stationary combustion of fuel or waste with production of useful energy'
        ).id,
        gas_type_id=GasType.objects.get(chemical_formula='CO2').id,
        methodology_id=Methodology.objects.get(name='Measured HHV/Default EF').id,
        valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(
        ReportingField.objects.get(
            field_name='Fuel Annual Weighted Average High Heating Value', field_units__isnull=True
        )
    )
    # CO2 - Measured HHV/Default EF - Unit-Fuel-CO2 Default Emission Factor
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(
            name='General stationary combustion solely for the purpose of line tracing'
        ).id,
        source_type_id=SourceType.objects.get(
            name='General stationary combustion of fuel or waste with production of useful energy'
        ).id,
        gas_type_id=GasType.objects.get(chemical_formula='CO2').id,
        methodology_id=Methodology.objects.get(name='Measured HHV/Default EF').id,
        valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(
        ReportingField.objects.get(field_name='Unit-Fuel-CO2 Measured HHV-Default EF', field_units='kg/GJ')
    )
    # CO2 - Measured Steam/Default EF - Unit-Fuel Annual Steam Generated
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(
            name='General stationary combustion solely for the purpose of line tracing'
        ).id,
        source_type_id=SourceType.objects.get(
            name='General stationary combustion of fuel or waste with production of useful energy'
        ).id,
        gas_type_id=GasType.objects.get(chemical_formula='CO2').id,
        methodology_id=Methodology.objects.get(name='Measured Steam/Default EF').id,
        valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(
        ReportingField.objects.get(field_name='Unit-Fuel Annual Steam Generated', field_units__isnull=True)
    )
    # CO2 - Measured Steam/Default EF - Boiler Ratio
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(
            name='General stationary combustion solely for the purpose of line tracing'
        ).id,
        source_type_id=SourceType.objects.get(
            name='General stationary combustion of fuel or waste with production of useful energy'
        ).id,
        gas_type_id=GasType.objects.get(chemical_formula='CO2').id,
        methodology_id=Methodology.objects.get(name='Measured Steam/Default EF').id,
        valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(ReportingField.objects.get(field_name='Boiler Ratio', field_units__isnull=True))
    # CO2 - Measured Steam/Default EF - Unit-Fuel-CO2 Emission Factor
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(
            name='General stationary combustion solely for the purpose of line tracing'
        ).id,
        source_type_id=SourceType.objects.get(
            name='General stationary combustion of fuel or waste with production of useful energy'
        ).id,
        gas_type_id=GasType.objects.get(chemical_formula='CO2').id,
        methodology_id=Methodology.objects.get(name='Measured Steam/Default EF').id,
        valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(
        ReportingField.objects.get(field_name='Unit-Fuel-CO2 Measured Steam-Default EF', field_units='kg/GJ')
    )
    # CO2 - Measured CC - Fuel Annual Weighted Average Carbon Content (weight fraction)
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(
            name='General stationary combustion solely for the purpose of line tracing'
        ).id,
        source_type_id=SourceType.objects.get(
            name='General stationary combustion of fuel or waste with production of useful energy'
        ).id,
        gas_type_id=GasType.objects.get(chemical_formula='CO2').id,
        methodology_id=Methodology.objects.get(name='Measured CC').id,
        valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(
        ReportingField.objects.get(
            field_name='Fuel Annual Weighted Average Carbon Content (weight fraction)', field_units__isnull=True
        )
    )
    # CO2 - Measured Steam/Measured EF - Unit-Fuel Annual Steam Generated
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(
            name='General stationary combustion solely for the purpose of line tracing'
        ).id,
        source_type_id=SourceType.objects.get(
            name='General stationary combustion of fuel or waste with production of useful energy'
        ).id,
        gas_type_id=GasType.objects.get(chemical_formula='CO2').id,
        methodology_id=Methodology.objects.get(name='Measured Steam/Measured EF').id,
        valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(
        ReportingField.objects.get(field_name='Unit-Fuel Annual Steam Generated', field_units__isnull=True)
    )
    # CO2 - Measured Steam/Measured EF - Unit-Fuel-CO2 Measured Emission Factor
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(
            name='General stationary combustion solely for the purpose of line tracing'
        ).id,
        source_type_id=SourceType.objects.get(
            name='General stationary combustion of fuel or waste with production of useful energy'
        ).id,
        gas_type_id=GasType.objects.get(chemical_formula='CO2').id,
        methodology_id=Methodology.objects.get(name='Measured Steam/Measured EF').id,
        valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(
        ReportingField.objects.get(field_name='Unit-Fuel-CO2 Measured Steam-Measured EF', field_units='kg/fuel units')
    )
    # CO2 - Alternative Parameter Measurement Methodology - Description
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(
            name='General stationary combustion solely for the purpose of line tracing'
        ).id,
        source_type_id=SourceType.objects.get(
            name='General stationary combustion of fuel or waste with production of useful energy'
        ).id,
        gas_type_id=GasType.objects.get(chemical_formula='CO2').id,
        methodology_id=Methodology.objects.get(name='Alternative Parameter Measurement Methodology').id,
        valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(ReportingField.objects.get(field_name='Description', field_units__isnull=True))
    # CO2 - Replacement Methodology - Description
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(
            name='General stationary combustion solely for the purpose of line tracing'
        ).id,
        source_type_id=SourceType.objects.get(
            name='General stationary combustion of fuel or waste with production of useful energy'
        ).id,
        gas_type_id=GasType.objects.get(chemical_formula='CO2').id,
        methodology_id=Methodology.objects.get(name='Replacement Methodology').id,
        valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(ReportingField.objects.get(field_name='Description', field_units__isnull=True))

    # #CH4 - Default HHV/Default EF - Fuel Default High Heating Value
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(
            name='General stationary combustion solely for the purpose of line tracing'
        ).id,
        source_type_id=SourceType.objects.get(
            name='General stationary combustion of fuel or waste with production of useful energy'
        ).id,
        gas_type_id=GasType.objects.get(chemical_formula='CH4').id,
        methodology_id=Methodology.objects.get(name='Default HHV/Default EF').id,
        valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(
        ReportingField.objects.get(field_name='Fuel Default High Heating Value', field_units__isnull=True)
    )
    # CH4 - Default HHV/Default EF - Unit-Fuel-CH4 Default Emission Factor
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(
            name='General stationary combustion solely for the purpose of line tracing'
        ).id,
        source_type_id=SourceType.objects.get(
            name='General stationary combustion of fuel or waste with production of useful energy'
        ).id,
        gas_type_id=GasType.objects.get(chemical_formula='CH4').id,
        methodology_id=Methodology.objects.get(name='Default HHV/Default EF').id,
        valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(
        ReportingField.objects.get(field_name='Unit-Fuel-CH4 Default HHV-Default EF', field_units='kg/GJ')
    )
    # CH4 - Default EF - Unit-Fuel-CH4 Default Emission Factor
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(
            name='General stationary combustion solely for the purpose of line tracing'
        ).id,
        source_type_id=SourceType.objects.get(
            name='General stationary combustion of fuel or waste with production of useful energy'
        ).id,
        gas_type_id=GasType.objects.get(chemical_formula='CH4').id,
        methodology_id=Methodology.objects.get(name='Default EF').id,
        valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(
        ReportingField.objects.get(field_name='Unit-Fuel-CH4 Default EF', field_units='kg/fuel units')
    )
    # CH4 - Measured HHV/Default EF - Fuel Annual Weighted Average High Heating Value
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(
            name='General stationary combustion solely for the purpose of line tracing'
        ).id,
        source_type_id=SourceType.objects.get(
            name='General stationary combustion of fuel or waste with production of useful energy'
        ).id,
        gas_type_id=GasType.objects.get(chemical_formula='CH4').id,
        methodology_id=Methodology.objects.get(name='Measured HHV/Default EF').id,
        valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(
        ReportingField.objects.get(
            field_name='Fuel Annual Weighted Average High Heating Value', field_units__isnull=True
        )
    )
    # CH4 - Measured HHV/Default EF - Unit-Fuel-CH4 Default Emission Factor
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(
            name='General stationary combustion solely for the purpose of line tracing'
        ).id,
        source_type_id=SourceType.objects.get(
            name='General stationary combustion of fuel or waste with production of useful energy'
        ).id,
        gas_type_id=GasType.objects.get(chemical_formula='CH4').id,
        methodology_id=Methodology.objects.get(name='Measured HHV/Default EF').id,
        valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(
        ReportingField.objects.get(field_name='Unit-Fuel-CH4 Measured HHV-Default EF', field_units='kg/GJ')
    )
    # CH4 - Measured EF - Unit-Fuel-CH4 Measured Emission Factor
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(
            name='General stationary combustion solely for the purpose of line tracing'
        ).id,
        source_type_id=SourceType.objects.get(
            name='General stationary combustion of fuel or waste with production of useful energy'
        ).id,
        gas_type_id=GasType.objects.get(chemical_formula='CH4').id,
        methodology_id=Methodology.objects.get(name='Measured EF').id,
        valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(
        ReportingField.objects.get(field_name='Unit-Fuel-CH4 Measured EF', field_units='kg/fuel units')
    )
    # CH4 - Measured Steam/Default EF - Unit-Fuel Annual Steam Generated
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(
            name='General stationary combustion solely for the purpose of line tracing'
        ).id,
        source_type_id=SourceType.objects.get(
            name='General stationary combustion of fuel or waste with production of useful energy'
        ).id,
        gas_type_id=GasType.objects.get(chemical_formula='CH4').id,
        methodology_id=Methodology.objects.get(name='Measured Steam/Default EF').id,
        valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(
        ReportingField.objects.get(field_name='Unit-Fuel Annual Steam Generated', field_units__isnull=True)
    )
    # CH4 - Measured Steam/Default EF - Boiler Ratio
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(
            name='General stationary combustion solely for the purpose of line tracing'
        ).id,
        source_type_id=SourceType.objects.get(
            name='General stationary combustion of fuel or waste with production of useful energy'
        ).id,
        gas_type_id=GasType.objects.get(chemical_formula='CH4').id,
        methodology_id=Methodology.objects.get(name='Measured Steam/Default EF').id,
        valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(ReportingField.objects.get(field_name='Boiler Ratio', field_units__isnull=True))
    # CH4 - Measured Steam/Default EF - Unit-Fuel-CH4 Default Emission Factor
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(
            name='General stationary combustion solely for the purpose of line tracing'
        ).id,
        source_type_id=SourceType.objects.get(
            name='General stationary combustion of fuel or waste with production of useful energy'
        ).id,
        gas_type_id=GasType.objects.get(chemical_formula='CH4').id,
        methodology_id=Methodology.objects.get(name='Measured Steam/Default EF').id,
        valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(
        ReportingField.objects.get(field_name='Unit-Fuel-CH4 Measured Steam-Default EF', field_units='kg/GJ')
    )
    # CH4 - Heat Input/Default EF - Unit-Fuel Heat Input
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(
            name='General stationary combustion solely for the purpose of line tracing'
        ).id,
        source_type_id=SourceType.objects.get(
            name='General stationary combustion of fuel or waste with production of useful energy'
        ).id,
        gas_type_id=GasType.objects.get(chemical_formula='CH4').id,
        methodology_id=Methodology.objects.get(name='Heat Input/Default EF').id,
        valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(ReportingField.objects.get(field_name='Unit-Fuel Heat Input', field_units__isnull=True))
    # CH4 - Heat Input/Default EF - Unit-Fuel-CH4 Default Emission Factor
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(
            name='General stationary combustion solely for the purpose of line tracing'
        ).id,
        source_type_id=SourceType.objects.get(
            name='General stationary combustion of fuel or waste with production of useful energy'
        ).id,
        gas_type_id=GasType.objects.get(chemical_formula='CH4').id,
        methodology_id=Methodology.objects.get(name='Heat Input/Default EF').id,
        valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(
        ReportingField.objects.get(field_name='Unit-Fuel-CH4 Heat Input-Default EF', field_units='kg/GJ')
    )
    # CH4 - Alternative Parameter Measurement Methodology - Description
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(
            name='General stationary combustion solely for the purpose of line tracing'
        ).id,
        source_type_id=SourceType.objects.get(
            name='General stationary combustion of fuel or waste with production of useful energy'
        ).id,
        gas_type_id=GasType.objects.get(chemical_formula='CH4').id,
        methodology_id=Methodology.objects.get(name='Alternative Parameter Measurement Methodology').id,
        valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(ReportingField.objects.get(field_name='Description', field_units__isnull=True))
    # CH4 - Replacement Methodology - Description
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(
            name='General stationary combustion solely for the purpose of line tracing'
        ).id,
        source_type_id=SourceType.objects.get(
            name='General stationary combustion of fuel or waste with production of useful energy'
        ).id,
        gas_type_id=GasType.objects.get(chemical_formula='CH4').id,
        methodology_id=Methodology.objects.get(name='Replacement Methodology').id,
        valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(ReportingField.objects.get(field_name='Description', field_units__isnull=True))

    # N2O - Default HHV/Default EF - Fuel Default High Heating Value
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(
            name='General stationary combustion solely for the purpose of line tracing'
        ).id,
        source_type_id=SourceType.objects.get(
            name='General stationary combustion of fuel or waste with production of useful energy'
        ).id,
        gas_type_id=GasType.objects.get(chemical_formula='N2O').id,
        methodology_id=Methodology.objects.get(name='Default HHV/Default EF').id,
        valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(
        ReportingField.objects.get(field_name='Fuel Default High Heating Value', field_units__isnull=True)
    )
    # N2O - Default HHV/Default EF - Unit-Fuel-N2O Default Emission Factor
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(
            name='General stationary combustion solely for the purpose of line tracing'
        ).id,
        source_type_id=SourceType.objects.get(
            name='General stationary combustion of fuel or waste with production of useful energy'
        ).id,
        gas_type_id=GasType.objects.get(chemical_formula='N2O').id,
        methodology_id=Methodology.objects.get(name='Default HHV/Default EF').id,
        valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(
        ReportingField.objects.get(field_name='Unit-Fuel-N2O Default HHV-Default EF', field_units='kg/GJ')
    )
    # N2O - Default EF - Unit-Fuel-N2O Default Emission Factor
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(
            name='General stationary combustion solely for the purpose of line tracing'
        ).id,
        source_type_id=SourceType.objects.get(
            name='General stationary combustion of fuel or waste with production of useful energy'
        ).id,
        gas_type_id=GasType.objects.get(chemical_formula='N2O').id,
        methodology_id=Methodology.objects.get(name='Default EF').id,
        valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(
        ReportingField.objects.get(field_name='Unit-Fuel-N2O Default EF', field_units='kg/fuel units')
    )
    # N2O - Measured HHV/Default EF - Fuel Annual Weighted Average High Heating Value
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(
            name='General stationary combustion solely for the purpose of line tracing'
        ).id,
        source_type_id=SourceType.objects.get(
            name='General stationary combustion of fuel or waste with production of useful energy'
        ).id,
        gas_type_id=GasType.objects.get(chemical_formula='N2O').id,
        methodology_id=Methodology.objects.get(name='Measured HHV/Default EF').id,
        valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(
        ReportingField.objects.get(
            field_name='Fuel Annual Weighted Average High Heating Value', field_units__isnull=True
        )
    )
    # N2O - Measured HHV/Default EF - Unit-Fuel-N2O Default Emission Factor
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(
            name='General stationary combustion solely for the purpose of line tracing'
        ).id,
        source_type_id=SourceType.objects.get(
            name='General stationary combustion of fuel or waste with production of useful energy'
        ).id,
        gas_type_id=GasType.objects.get(chemical_formula='N2O').id,
        methodology_id=Methodology.objects.get(name='Measured HHV/Default EF').id,
        valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(
        ReportingField.objects.get(field_name='Unit-Fuel-N2O Measured HHV-Default EF', field_units='kg/GJ')
    )
    # N2O - Measured EF - Unit-Fuel-N2O Measured Emission Factor
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(
            name='General stationary combustion solely for the purpose of line tracing'
        ).id,
        source_type_id=SourceType.objects.get(
            name='General stationary combustion of fuel or waste with production of useful energy'
        ).id,
        gas_type_id=GasType.objects.get(chemical_formula='N2O').id,
        methodology_id=Methodology.objects.get(name='Measured EF').id,
        valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(
        ReportingField.objects.get(field_name='Unit-Fuel-N2O Measured EF', field_units='kg/fuel units')
    )
    # N2O - Measured Steam/Default EF - Unit-Fuel Annual Steam Generated
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(
            name='General stationary combustion solely for the purpose of line tracing'
        ).id,
        source_type_id=SourceType.objects.get(
            name='General stationary combustion of fuel or waste with production of useful energy'
        ).id,
        gas_type_id=GasType.objects.get(chemical_formula='N2O').id,
        methodology_id=Methodology.objects.get(name='Measured Steam/Default EF').id,
        valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(
        ReportingField.objects.get(field_name='Unit-Fuel Annual Steam Generated', field_units__isnull=True)
    )
    # N2O - Measured Steam/Default EF - Boiler Ratio
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(
            name='General stationary combustion solely for the purpose of line tracing'
        ).id,
        source_type_id=SourceType.objects.get(
            name='General stationary combustion of fuel or waste with production of useful energy'
        ).id,
        gas_type_id=GasType.objects.get(chemical_formula='N2O').id,
        methodology_id=Methodology.objects.get(name='Measured Steam/Default EF').id,
        valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(ReportingField.objects.get(field_name='Boiler Ratio', field_units__isnull=True))
    # N2O - Measured Steam/Default EF - Unit-Fuel-N2O Default Emission Factor
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(
            name='General stationary combustion solely for the purpose of line tracing'
        ).id,
        source_type_id=SourceType.objects.get(
            name='General stationary combustion of fuel or waste with production of useful energy'
        ).id,
        gas_type_id=GasType.objects.get(chemical_formula='N2O').id,
        methodology_id=Methodology.objects.get(name='Measured Steam/Default EF').id,
        valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(
        ReportingField.objects.get(field_name='Unit-Fuel-N2O Measured Steam-Default EF', field_units='kg/GJ')
    )
    # N2O - Heat Input/Default EF - Unit-Fuel Heat Input
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(
            name='General stationary combustion solely for the purpose of line tracing'
        ).id,
        source_type_id=SourceType.objects.get(
            name='General stationary combustion of fuel or waste with production of useful energy'
        ).id,
        gas_type_id=GasType.objects.get(chemical_formula='N2O').id,
        methodology_id=Methodology.objects.get(name='Heat Input/Default EF').id,
        valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(ReportingField.objects.get(field_name='Unit-Fuel Heat Input', field_units__isnull=True))
    # N2O - Heat Input/Default EF - Unit-Fuel-N2O Default Emission Factor
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(
            name='General stationary combustion solely for the purpose of line tracing'
        ).id,
        source_type_id=SourceType.objects.get(
            name='General stationary combustion of fuel or waste with production of useful energy'
        ).id,
        gas_type_id=GasType.objects.get(chemical_formula='N2O').id,
        methodology_id=Methodology.objects.get(name='Heat Input/Default EF').id,
        valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(
        ReportingField.objects.get(field_name='Unit-Fuel-N2O Heat Input-Default EF', field_units='kg/GJ')
    )
    # N2O - Alternative Parameter Measurement Methodology - Description
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(
            name='General stationary combustion solely for the purpose of line tracing'
        ).id,
        source_type_id=SourceType.objects.get(
            name='General stationary combustion of fuel or waste with production of useful energy'
        ).id,
        gas_type_id=GasType.objects.get(chemical_formula='N2O').id,
        methodology_id=Methodology.objects.get(name='Alternative Parameter Measurement Methodology').id,
        valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(ReportingField.objects.get(field_name='Description', field_units__isnull=True))
    # N2O - Replacement Methodology - Description
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(
            name='General stationary combustion solely for the purpose of line tracing'
        ).id,
        source_type_id=SourceType.objects.get(
            name='General stationary combustion of fuel or waste with production of useful energy'
        ).id,
        gas_type_id=GasType.objects.get(chemical_formula='N2O').id,
        methodology_id=Methodology.objects.get(name='Replacement Methodology').id,
        valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(ReportingField.objects.get(field_name='Description', field_units__isnull=True))


def reverse_init_configuration_element_reporting_fields_data(apps, schema_monitor):
    '''
    Remove data from erc.configuration_element_reporting_fields
    '''
    ConfigurationElement = apps.get_model('reporting', 'ConfigurationElement')
    Activity = apps.get_model('registration', 'Activity')

    ConfigurationElement.reporting_fields.through.objects.filter(
        configurationelement_id__in=ConfigurationElement.objects.filter(
            activity_id=Activity.objects.get(
                name='General stationary combustion solely for the purpose of line tracing'
            ).id
        ).values_list('id', flat=True)
    ).delete()


#### SCHEMA DATA ####
def init_activity_schema_data(apps, schema_monitor):
    '''
    Add initial schema data to erc.activity_schema
    '''
    ## Import JSON data
    import os

    cwd = os.getcwd()
    with open(f'{cwd}/reporting/json_schemas/2024/gsc_solely_for_line_tracing/activity.json') as gsc_st1:
        schema = json.load(gsc_st1)

    ActivitySchema = apps.get_model('reporting', 'ActivityJsonSchema')
    Activity = apps.get_model('registration', 'Activity')
    Configuration = apps.get_model('reporting', 'Configuration')
    ActivitySchema.objects.create(
        activity_id=Activity.objects.get(
            name='General stationary combustion solely for the purpose of line tracing'
        ).id,
        json_schema=schema,
        valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    )


def reverse_init_activity_schema_data(apps, schema_monitor):
    '''
    Remove initial data from erc.base_schema
    '''
    ActivitySchema = apps.get_model('reporting', 'ActivityJsonSchema')
    Activity = apps.get_model('registration', 'Activity')
    ActivitySchema.objects.filter(
        activity_id=Activity.objects.get(name='General stationary combustion solely for the purpose of line tracing').id
    ).delete()


# SOURCE TYPE
def init_activity_source_type_schema_data(apps, schema_monitor):
    '''
    Add initial schema data to erc.activity_source_type_schema
    '''
    ## Import JSON data
    import os

    cwd = os.getcwd()
    with open(f'{cwd}/reporting/json_schemas/2024/gsc_solely_for_line_tracing/with_useful_energy.json') as gsc_st1:
        schema1 = json.load(gsc_st1)

    ActivitySourceTypeSchema = apps.get_model('reporting', 'ActivitySourceTypeJsonSchema')
    Activity = apps.get_model('registration', 'Activity')
    SourceType = apps.get_model('reporting', 'SourceType')
    Configuration = apps.get_model('reporting', 'Configuration')
    ActivitySourceTypeSchema.objects.bulk_create(
        [
            ActivitySourceTypeSchema(
                activity_id=Activity.objects.get(
                    name='General stationary combustion solely for the purpose of line tracing'
                ).id,
                source_type_id=SourceType.objects.get(
                    name='General stationary combustion of fuel or waste with production of useful energy'
                ).id,
                json_schema=schema1,
                valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
                valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
            ),
        ]
    )


def reverse_init_activity_source_type_schema_data(apps, schema_monitor):
    '''
    Remove initial data from erc.base_schema
    '''
    ActivitySourceTypeJsonSchema = apps.get_model('reporting', 'ActivitySourceTypeJsonSchema')
    Activity = apps.get_model('registration', 'Activity')
    ActivitySourceTypeJsonSchema.objects.filter(
        activity_id=Activity.objects.get(name='General stationary combustion solely for the purpose of line tracing').id
    ).delete()


class Migration(migrations.Migration):

    dependencies = [('reporting', '0009_general_stationary_combustion_data')]

    operations = [
        migrations.RunPython(init_configuration_element_data, reverse_init_configuration_element_data),
        migrations.RunPython(
            init_configuration_element_reporting_fields_data, reverse_init_configuration_element_reporting_fields_data
        ),
        migrations.RunPython(init_activity_schema_data, reverse_init_activity_schema_data),
        migrations.RunPython(init_activity_source_type_schema_data, reverse_init_activity_source_type_schema_data),
    ]
