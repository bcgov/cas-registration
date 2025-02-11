

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

    # Industrial wastewater processing
    ConfigurationElement.objects.bulk_create(
        [
            # CH4
            ConfigurationElement(
                activity_id=Activity.objects.get(
                    name='Industrial wastewater processing'
                ).id,
                source_type_id=SourceType.objects.get(
                    name='Industrial wastewater process using anaerobic digestion'
                ).id,
                gas_type_id=GasType.objects.get(chemical_formula='CH4').id,
                methodology_id=Methodology.objects.get(name='Chemical Oxygen Demand').id,
                valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
                valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
            ),
            ConfigurationElement(
                activity_id=Activity.objects.get(
                    name='Industrial wastewater processing'
                ).id,
                source_type_id=SourceType.objects.get(
                    name='Industrial wastewater process using anaerobic digestion'
                ).id,
                gas_type_id=GasType.objects.get(chemical_formula='CH4').id,
                methodology_id=Methodology.objects.get(name='Biochemical Oxygen Demand').id,
                valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
                valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
            ),
            ConfigurationElement(
                activity_id=Activity.objects.get(
                    name='Industrial wastewater processing'
                ).id,
                source_type_id=SourceType.objects.get(
                    name='Industrial wastewater process using anaerobic digestion'
                ).id,
                gas_type_id=GasType.objects.get(chemical_formula='CH4').id,
                methodology_id=Methodology.objects.get(name='Alternative Parameter Measurement').id,
                valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
                valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
            ),
            ConfigurationElement(
                activity_id=Activity.objects.get(
                    name='Industrial wastewater processing'
                ).id,
                source_type_id=SourceType.objects.get(
                    name='Industrial wastewater process using anaerobic digestion'
                ).id,
                gas_type_id=GasType.objects.get(chemical_formula='CH4').id,
                methodology_id=Methodology.objects.get(name='Replacement Methodology').id,
                valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
                valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
            ),
            # N2O
            ConfigurationElement(
                activity_id=Activity.objects.get(
                    name='Industrial wastewater processing'
                ).id,
                source_type_id=SourceType.objects.get(
                    name='Industrial wastewater process using anaerobic digestion'
                ).id,
                gas_type_id=GasType.objects.get(chemical_formula='N2O').id,
                methodology_id=Methodology.objects.get(name='Nitrogen in effluent').id,
                valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
                valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
            ),
            ConfigurationElement(
                activity_id=Activity.objects.get(
                    name='Industrial wastewater processing'
                ).id,
                source_type_id=SourceType.objects.get(
                    name='Industrial wastewater process using anaerobic digestion'
                ).id,
                gas_type_id=GasType.objects.get(chemical_formula='N2O').id,
                methodology_id=Methodology.objects.get(name='Alternative Parameter Measurement').id,
                valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
                valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
            ),
            ConfigurationElement(
                activity_id=Activity.objects.get(
                    name='Industrial wastewater processing'
                ).id,
                source_type_id=SourceType.objects.get(
                    name='Industrial wastewater process using anaerobic digestion'
                ).id,
                gas_type_id=GasType.objects.get(chemical_formula='N2O').id,
                methodology_id=Methodology.objects.get(name='Replacement Methodology').id,
                valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
                valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
            ),
        ]
    )
    # Oil-water separators
    ConfigurationElement.objects.bulk_create(
        [
            # CH4
            ConfigurationElement(
                activity_id=Activity.objects.get(
                    name='Industrial wastewater processing'
                ).id,
                source_type_id=SourceType.objects.get(
                    name='Oil-water separators'
                ).id,
                gas_type_id=GasType.objects.get(chemical_formula='CH4').id,
                methodology_id=Methodology.objects.get(name='Default conversion factor').id,
                valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
                valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
            ),
            ConfigurationElement(
                activity_id=Activity.objects.get(
                    name='Industrial wastewater processing'
                ).id,
                source_type_id=SourceType.objects.get(
                    name='Oil-water separators'
                ).id,
                gas_type_id=GasType.objects.get(chemical_formula='CH4').id,
                methodology_id=Methodology.objects.get(name='Measured conversion factor').id,
                valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
                valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
            ),
            ConfigurationElement(
                activity_id=Activity.objects.get(
                    name='Industrial wastewater processing'
                ).id,
                source_type_id=SourceType.objects.get(
                    name='Oil-water separators'
                ).id,
                gas_type_id=GasType.objects.get(chemical_formula='CH4').id,
                methodology_id=Methodology.objects.get(name='Alternative Parameter Measurement').id,
                valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
                valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
            ),
            ConfigurationElement(
                activity_id=Activity.objects.get(
                    name='Industrial wastewater processing'
                ).id,
                source_type_id=SourceType.objects.get(
                    name='Oil-water separators'
                ).id,
                gas_type_id=GasType.objects.get(chemical_formula='CH4').id,
                methodology_id=Methodology.objects.get(name='Replacement Methodology').id,
                valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
                valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
            )
        ]
    )


def reverse_init_configuration_element_data(apps, schema_monitor):
    '''
    Remove initial data from erc.configuration_element
    '''
    Configuration = apps.get_model('reporting', 'Configuration')
    ReportingActivity = apps.get_model('reporting', 'ReportingActivity')
    ConfigurationElement = apps.get_model('reporting', 'ConfigurationElement')
    ConfigurationElement.objects.filter(
        reporting_activity_id=ReportingActivity.objects.get(
            name='Industrial wastewater processing'
        ).id,
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
    # SOURCE TYPE: Industrial wastewater process using anaerobic digestion
    # #CH4 - Chemical Oxygen Demand - Average of Quarterly chemical oxygen demand
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(name='Industrial wastewater processing').id,
        source_type_id=SourceType.objects.get(
            name='Industrial wastewater process using anaerobic digestion'
        ).id,
        gas_type_id=GasType.objects.get(chemical_formula='CH4').id,
        methodology_id=Methodology.objects.get(name='Chemical Oxygen Demand').id,
        valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(
        ReportingField.objects.get(field_name='Average of Quarterly chemical oxygen demand', field_units='kg/m3')
    )
    # CH4 - Biochemical Oxygen Demand - Average of Quarterly five-day biochemical oxygen demand
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(name='Industrial wastewater processing').id,
        source_type_id=SourceType.objects.get(
            name='Industrial wastewater process using anaerobic digestion'
        ).id,
        gas_type_id=GasType.objects.get(chemical_formula='CH4').id,
        methodology_id=Methodology.objects.get(name='Biochemical Oxygen Demand').id,
        valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(
        ReportingField.objects.get(field_name='Average of Quarterly five-day biochemical oxygen demand',field_units='kg/m3')
    )
    # CH4 - Alternative Parameter Measurement - Description
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(name='Industrial wastewater processing').id,
        source_type_id=SourceType.objects.get(
            name='Industrial wastewater process using anaerobic digestion'
        ).id,
        gas_type_id=GasType.objects.get(chemical_formula='CH4').id,
        methodology_id=Methodology.objects.get(name='Alternative Parameter Measurement').id,
        valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(ReportingField.objects.get(field_name='Description', field_units__isnull=True))
    # CH4 - Replacement Methodology - Description
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(name='Industrial wastewater processing').id,
        source_type_id=SourceType.objects.get(
            name='Industrial wastewater process using anaerobic digestion'
        ).id,
        gas_type_id=GasType.objects.get(chemical_formula='CH4').id,
        methodology_id=Methodology.objects.get(name='Replacement Methodology').id,
        valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(ReportingField.objects.get(field_name='Description', field_units__isnull=True))

    # N2O - Nitrogen in effluent - Average of Quarterly Nitrogen in effluent
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(name='Industrial wastewater processing').id,
        source_type_id=SourceType.objects.get(
            name='Industrial wastewater process using anaerobic digestion'
        ).id,
        gas_type_id=GasType.objects.get(chemical_formula='N2O').id,
        methodology_id=Methodology.objects.get(name='Nitrogen in effluent').id,
        valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(
        ReportingField.objects.get(field_name='Average of Quarterly Nitrogen in effluent',field_units='kg/N m3')
    )
    # N2O - Alternative Parameter Measurement - Description
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(name='Industrial wastewater processing').id,
        source_type_id=SourceType.objects.get(
            name='Industrial wastewater process using anaerobic digestion'
        ).id,
        gas_type_id=GasType.objects.get(chemical_formula='N2O').id,
        methodology_id=Methodology.objects.get(name='Alternative Parameter Measurement').id,
        valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(ReportingField.objects.get(field_name='Description', field_units__isnull=True))
    # N2O - Replacement Methodology - Description
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(name='Industrial wastewater processing').id,
        source_type_id=SourceType.objects.get(
            name='Industrial wastewater process using anaerobic digestion'
        ).id,
        gas_type_id=GasType.objects.get(chemical_formula='N2O').id,
        methodology_id=Methodology.objects.get(name='Replacement Methodology').id,
        valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(ReportingField.objects.get(field_name='Description', field_units__isnull=True))

    # SOURCE TYPE: Oil-water separators
    # #CH4 - Default HHV/Default EF - Fuel Default High Heating Value
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(name='Industrial wastewater processing').id,
        source_type_id=SourceType.objects.get(
            name='Oil-water separators'
        ).id,
        gas_type_id=GasType.objects.get(chemical_formula='CH4').id,
        methodology_id=Methodology.objects.get(name='Default HHV/Default EF').id,
        valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(
        ReportingField.objects.get(field_name='Fuel Default High Heating Value', field_units__isnull=True)
    )
    # CH4 - Alternative Parameter Measurement - Description
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(name='Industrial wastewater processing').id,
        source_type_id=SourceType.objects.get(
            name='Oil-water separators'
        ).id,
        gas_type_id=GasType.objects.get(chemical_formula='CH4').id,
        methodology_id=Methodology.objects.get(name='Alternative Parameter Measurement').id,
        valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(ReportingField.objects.get(field_name='Description', field_units__isnull=True))
    # CH4 - Replacement Methodology - Description
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(name='Industrial wastewater processing').id,
        source_type_id=SourceType.objects.get(
            name='Oil-water separators'
        ).id,
        gas_type_id=GasType.objects.get(chemical_formula='CH4').id,
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
            activity_id=Activity.objects.get(name='Industrial wastewater processing').id
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
    with open(f'{cwd}/reporting/json_schemas/2024/gsc_non_compression_non_combustion/activity.json') as gsc_st1:
        schema = json.load(gsc_st1)

    ActivitySchema = apps.get_model('reporting', 'ActivityJsonSchema')
    Activity = apps.get_model('registration', 'Activity')
    Configuration = apps.get_model('reporting', 'Configuration')
    ActivitySchema.objects.create(
        activity_id=Activity.objects.get(name='Industrial wastewater processing').id,
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
        activity_id=Activity.objects.get(name='Industrial wastewater processing').id
    ).delete()


# SOURCE TYPE
def init_activity_source_type_schema_data(apps, schema_monitor):
    '''
    Add initial schema data to erc.activity_source_type_schema
    '''
    ## Import JSON data
    import os

    cwd = os.getcwd()
    with open(
            f'{cwd}/reporting/json_schemas/2024/gsc_non_compression_non_combustion/with_useful_energy.json'
    ) as json_schema_file:
        with_useful_energy_schema = json.load(json_schema_file)
    with open(
            f'{cwd}/reporting/json_schemas/2024/gsc_non_compression_non_combustion/without_useful_energy.json'
    ) as json_schema_file:
        without_useful_energy_schema = json.load(json_schema_file)
    with open(
            f'{cwd}/reporting/json_schemas/2024/gsc_non_compression_non_combustion/field_gas_process_vent_gas_at_lfo.json'
    ) as json_schema_file:
        field_gas_process_vent_gas_at_lfo_schema = json.load(json_schema_file)

    ActivitySourceTypeSchema = apps.get_model('reporting', 'ActivitySourceTypeJsonSchema')
    Activity = apps.get_model('registration', 'Activity')
    SourceType = apps.get_model('reporting', 'SourceType')
    Configuration = apps.get_model('reporting', 'Configuration')
    ActivitySourceTypeSchema.objects.bulk_create(
        [
            ActivitySourceTypeSchema(
                activity_id=Activity.objects.get(
                    name='Industrial wastewater processing'
                ).id,
                source_type_id=SourceType.objects.get(
                    name='Industrial wastewater process using anaerobic digestion'
                ).id,
                json_schema=with_useful_energy_schema,
                valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
                valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
            ),
            ActivitySourceTypeSchema(
                activity_id=Activity.objects.get(
                    name='Industrial wastewater processing'
                ).id,
                source_type_id=SourceType.objects.get(
                    name='Oil-water separators'
                ).id,
                json_schema=without_useful_energy_schema,
                valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
                valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
            ),
            ActivitySourceTypeSchema(
                activity_id=Activity.objects.get(
                    name='Industrial wastewater processing'
                ).id,
                source_type_id=SourceType.objects.get(
                    name='Field gas or process vent gas combustion at a linear facilities operation'
                ).id,
                json_schema=field_gas_process_vent_gas_at_lfo_schema,
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
        activity_id=Activity.objects.get(name='Industrial wastewater processing').id
    ).delete()


class Migration(migrations.Migration):

    dependencies = [('reporting', '0014_carbonates_use')]

    operations = [
        migrations.RunPython(init_configuration_element_data, reverse_init_configuration_element_data),
        migrations.RunPython(
            init_configuration_element_reporting_fields_data, reverse_init_configuration_element_reporting_fields_data
        ),
        migrations.RunPython(init_activity_schema_data, reverse_init_activity_schema_data),
        migrations.RunPython(init_activity_source_type_schema_data, reverse_init_activity_source_type_schema_data),
    ]
