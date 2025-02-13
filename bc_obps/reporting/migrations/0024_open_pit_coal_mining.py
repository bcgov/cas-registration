from django.db import migrations
import json

from reporting.models import CustomMethodologySchema


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
    # Coal when broken or exposed to the atmosphere during mining
    ConfigurationElement.objects.bulk_create(
        [
            ConfigurationElement(
                activity_id=Activity.objects.get(name='Open pit coal mining').id,
                source_type_id=SourceType.objects.get(
                    name='Coal when broken or exposed to the atmosphere during mining'
                ).id,
                gas_type_id=GasType.objects.get(chemical_formula='CH4').id,
                methodology_id=Methodology.objects.get(name='Emissions Factor Methodology').id,
                valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
                valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
                custom_methodology_schema_id=CustomMethodologySchema.objects.get(
                    activity_id=Activity.objects.get(name='Open pit coal mining').id,
                    source_type_id=SourceType.objects.get(
                        name='Coal when broken or exposed to the atmosphere during mining'
                    ).id,
                    gas_type_id=GasType.objects.get(chemical_formula='CH4').id,
                    methodology_id=Methodology.objects.get(name='Emissions Factor Methodology').id,
                    valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
                    valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
                ).id,
            ),
            ConfigurationElement(
                activity_id=Activity.objects.get(name='Open pit coal mining').id,
                source_type_id=SourceType.objects.get(
                    name='Coal when broken or exposed to the atmosphere during mining'
                ).id,
                gas_type_id=GasType.objects.get(chemical_formula='CH4').id,
                methodology_id=Methodology.objects.get(name='Alternative Parameter Measurement Methodology').id,
                valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
                valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
            ),
            ConfigurationElement(
                activity_id=Activity.objects.get(name='Open pit coal mining').id,
                source_type_id=SourceType.objects.get(
                    name='Coal when broken or exposed to the atmosphere during mining'
                ).id,
                gas_type_id=GasType.objects.get(chemical_formula='CH4').id,
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
    Activity = apps.getmodel('registration', 'Activity')
    ConfigurationElement = apps.get_model('reporting', 'ConfigurationElement')
    ConfigurationElement.objects.filter(
        activity_id=Activity.objects.get(name='Open pit coal mining').id,
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
    # CH4 - Alternative Parameter Measurement Methodology - Description
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(name='Open pit coal mining').id,
        source_type_id=SourceType.objects.get(name='Coal when broken or exposed to the atmosphere during mining').id,
        gas_type_id=GasType.objects.get(chemical_formula='CH4').id,
        methodology_id=Methodology.objects.get(name='Alternative Parameter Measurement Methodology').id,
        valid_from_id=Configuration.objects.get(valid_from='2023-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(ReportingField.objects.get(field_name='Description', field_units__isnull=True))
    # CH4 - Replacement Methodology - Description
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(name='Open pit coal mining').id,
        source_type_id=SourceType.objects.get(name='Coal when broken or exposed to the atmosphere during mining').id,
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
            activity_id=Activity.objects.get(name='Open pit coal mining').id
        ).values_list('id', flat=True)
    ).delete()


def init_custom_schema_data(apps, schema_editor):
    '''
    Add initial data to erc.custom_methodology_schema
    '''
    import os
    import json

    cwd = os.getcwd()
    with open(
        f'{cwd}/reporting/json_schemas/2024/open_pit_coal_mining/emission_factor_methodology_custom.json'
    ) as open_pit_coal_mining:
        schema = json.load(open_pit_coal_mining)

    # Get the model classes
    CustomMethodologySchema = apps.get_model('reporting', 'CustomMethodologySchema')
    Activity = apps.get_model('registration', 'Activity')
    SourceType = apps.get_model('reporting', 'SourceType')
    GasType = apps.get_model('reporting', 'GasType')
    Methodology = apps.get_model('reporting', 'Methodology')
    Configuration = apps.get_model('reporting', 'Configuration')

    # Fetch or create necessary related objects
    activity = Activity.objects.get(name='Open pit coal mining')
    source_type = SourceType.objects.get(name='Coal when broken or exposed to the atmosphere during mining')
    methodology = Methodology.objects.get(name='Emissions Factor Methodology')
    gas_type = GasType.objects.get(chemical_formula='CH4')
    valid_from = Configuration.objects.get(valid_from='2023-01-01')
    valid_to = Configuration.objects.get(valid_to='2099-12-31')

    # Create a new record in CustomMethodologySchema
    CustomMethodologySchema.objects.create(
        activity=activity,
        source_type=source_type,
        json_schema=schema,
        methodology=methodology,
        gas_type=gas_type,
        valid_from=valid_from,
        valid_to=valid_to,
    )


def reverse_init_custom_schema_data(apps, schema_monitor):
    '''
    Remove initial data from erc.base_schema
    '''
    CutsomSchema = apps.get_model('reporting', 'CustomMethodologySchema')
    Activity = apps.get_model('registration', 'Activity')
    CutsomSchema.objects.filter(activity_id=Activity.objects.get(name='Open pit coal mining').id).delete()


#### SCHEMA DATA ####
def init_activity_schema_data(apps, schema_monitor):
    '''
    Add initial schema data to erc.activity_schema
    '''
    ## Import JSON data
    import os

    cwd = os.getcwd()
    with open(f'{cwd}/reporting/json_schemas/2024/open_pit_coal_mining/activity.json') as mfuel:
        schema = json.load(mfuel)

    ActivitySchema = apps.get_model('reporting', 'ActivityJsonSchema')
    Activity = apps.get_model('registration', 'Activity')
    Configuration = apps.get_model('reporting', 'Configuration')
    ActivitySchema.objects.create(
        activity_id=Activity.objects.get(name='Open pit coal mining').id,
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
    ActivitySchema.objects.filter(activity_id=Activity.objects.get(name='Open pit coal mining').id).delete()


# SOURCE TYPE
def init_activity_source_type_schema_data(apps, schema_monitor):
    '''
    Add initial schema data to erc.activity_source_type_schema
    '''
    ## Import JSON data
    import os

    cwd = os.getcwd()
    with open(f'{cwd}/reporting/json_schemas/2024/open_pit_coal_mining/coal_exposed_during_mining.json') as mfuel_st:
        schema = json.load(mfuel_st)

    ActivitySourceTypeSchema = apps.get_model('reporting', 'ActivitySourceTypeJsonSchema')
    Activity = apps.get_model('registration', 'Activity')
    SourceType = apps.get_model('reporting', 'SourceType')
    Configuration = apps.get_model('reporting', 'Configuration')
    ActivitySourceTypeSchema.objects.bulk_create(
        [
            ActivitySourceTypeSchema(
                activity_id=Activity.objects.get(name='Open pit coal mining').id,
                source_type_id=SourceType.objects.get(
                    name='Coal when broken or exposed to the atmosphere during mining'
                ).id,
                has_unit=False,
                has_fuel=False,
                json_schema=schema,
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
        activity_id=Activity.objects.get(name='Open pit coal mining').id
    ).delete()


class Migration(migrations.Migration):
    dependencies = [('reporting', '0023_emission_category_mapping_with_data')]

    operations = [
        migrations.RunPython(init_custom_schema_data, reverse_init_custom_schema_data),
        migrations.RunPython(init_configuration_element_data, reverse_init_configuration_element_data),
        migrations.RunPython(
            init_configuration_element_reporting_fields_data, reverse_init_configuration_element_reporting_fields_data
        ),
        migrations.RunPython(init_activity_schema_data, reverse_init_activity_schema_data),
        migrations.RunPython(init_activity_source_type_schema_data, reverse_init_activity_source_type_schema_data),
    ]
