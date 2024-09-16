# Generated by Django 5.0.8 on 2024-08-20 20:54

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
    CustomMethodologySchema = apps.get_model('reporting', 'CustomMethodologySchema')
    # Steam reformation of hydrocarbons, partial oxidation of hydrocarbons or other transformation of hydrocarbon feedstock
    ConfigurationElement.objects.bulk_create(
        [
            # CO2
            ConfigurationElement(
                activity_id=Activity.objects.get(name='Hydrogen production').id,
                source_type_id=SourceType.objects.get(
                    name='Steam reformation of hydrocarbons, partial oxidation of hydrocarbons or other transformation of hydrocarbon feedstock'
                ).id,
                gas_type_id=GasType.objects.get(chemical_formula='CO2').id,
                methodology_id=Methodology.objects.get(name='CEMS').id,
                valid_from_id=Configuration.objects.get(valid_from='2024-01-01').id,
                valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
            ),
            ConfigurationElement(
                activity_id=Activity.objects.get(name='Hydrogen production').id,
                source_type_id=SourceType.objects.get(
                    name='Steam reformation of hydrocarbons, partial oxidation of hydrocarbons or other transformation of hydrocarbon feedstock'
                ).id,
                gas_type_id=GasType.objects.get(chemical_formula='CO2').id,
                methodology_id=Methodology.objects.get(name='Feedstock Material Balance').id,
                valid_from_id=Configuration.objects.get(valid_from='2024-01-01').id,
                valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
                custom_methodology_schema_id=CustomMethodologySchema.objects.get(
                    activity_id=Activity.objects.get(name='Hydrogen production').id,
                    source_type_id=SourceType.objects.get(
                        name='Steam reformation of hydrocarbons, partial oxidation of hydrocarbons or other transformation of hydrocarbon feedstock'
                    ).id,
                    gas_type_id=GasType.objects.get(chemical_formula='CO2').id,
                    methodology_id=Methodology.objects.get(name='Feedstock Material Balance').id,
                    valid_from_id=Configuration.objects.get(valid_from='2024-01-01').id,
                    valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
                ).id,
            ),
            ConfigurationElement(
                activity_id=Activity.objects.get(name='Hydrogen production').id,
                source_type_id=SourceType.objects.get(
                    name='Steam reformation of hydrocarbons, partial oxidation of hydrocarbons or other transformation of hydrocarbon feedstock'
                ).id,
                gas_type_id=GasType.objects.get(chemical_formula='CO2').id,
                methodology_id=Methodology.objects.get(name='Alternative Parameter Measurement').id,
                valid_from_id=Configuration.objects.get(valid_from='2024-01-01').id,
                valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
            ),
            ConfigurationElement(
                activity_id=Activity.objects.get(name='Hydrogen production').id,
                source_type_id=SourceType.objects.get(
                    name='Steam reformation of hydrocarbons, partial oxidation of hydrocarbons or other transformation of hydrocarbon feedstock'
                ).id,
                gas_type_id=GasType.objects.get(chemical_formula='CO2').id,
                methodology_id=Methodology.objects.get(name='Replacement Methodology').id,
                valid_from_id=Configuration.objects.get(valid_from='2024-01-01').id,
                valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
            ),
        ]
    )


def reverse_init_configuration_element_data(apps, schema_monitor):
    '''
    Remove initial data from erc.configuration_element
    '''
    Configuration = apps.get_model('reporting', 'Configuration')
    Activity = apps.get_model('registration', 'Activity')
    ConfigurationElement = apps.get_model('reporting', 'ConfigurationElement')
    ConfigurationElement.objects.filter(
        activity_id=Activity.objects.get(name='Hydrogen production').id,
        valid_from_id=Configuration.objects.get(valid_from='2024-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).delete()


def init_configuration_element_reporting_fields_data(apps, schema_editor):
    """
    Add initial data to erc.activity_source_type_base_schema
    """
    ConfigurationElement = apps.get_model('reporting', 'ConfigurationElement')
    Activity = apps.get_model('registration', 'Activity')
    SourceType = apps.get_model('reporting', 'SourceType')
    GasType = apps.get_model('reporting', 'GasType')
    Methodology = apps.get_model('reporting', 'Methodology')
    Configuration = apps.get_model('reporting', 'Configuration')
    ReportingField = apps.get_model('reporting', 'ReportingField')

    activity = Activity.objects.get(name='Hydrogen production')
    source_type = SourceType.objects.get(
        name='Steam reformation of hydrocarbons, partial oxidation of hydrocarbons or other transformation of hydrocarbon feedstock'
    )
    gas_type = GasType.objects.get(chemical_formula='CO2')
    valid_from = Configuration.objects.get(valid_from='2024-01-01')
    valid_to = Configuration.objects.get(valid_to='2099-12-31')

    # CO2 - Alternative Parameter Measurement
    methodology_alt = Methodology.objects.get(name='Alternative Parameter Measurement')
    config_element_alt = ConfigurationElement.objects.get(
        activity_id=activity.id,
        source_type_id=source_type.id,
        gas_type_id=gas_type.id,
        methodology_id=methodology_alt.id,
        valid_from=valid_from,
        valid_to=valid_to,
    )
    config_element_alt.reporting_fields.add(
        ReportingField.objects.get(field_name='Description', field_units__isnull=True)
    )

    # CO2 - Replacement Methodology
    methodology_rep = Methodology.objects.get(name='Replacement Methodology')
    config_element_rep = ConfigurationElement.objects.get(
        activity_id=activity.id,
        source_type_id=source_type.id,
        gas_type_id=gas_type.id,
        methodology_id=methodology_rep.id,
        valid_from=valid_from,
        valid_to=valid_to,
    )
    config_element_rep.reporting_fields.add(
        ReportingField.objects.get(field_name='Description', field_units__isnull=True)
    )


def reverse_init_configuration_element_reporting_fields_data(apps, schema_monitor):
    '''
    Remove initial data from erc.configuration_element_reporting_fields
    '''
    ConfigurationElement = apps.get_model('reporting', 'ConfigurationElement')
    Activity = apps.get_model('registration', 'Activity')

    ConfigurationElement.reporting_fields.through.objects.filter(
        configurationelement_id__in=ConfigurationElement.objects.filter(
            activity_id=Activity.objects.get(name='Hydrogen production').id
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
        f'{cwd}/reporting/json_schemas/2024/hydrogen_production/feedstock_material_balance_custom.json'
    ) as hydrogen_prod:
        schema = json.load(hydrogen_prod)

    # Get the model classes
    CustomMethodologySchema = apps.get_model('reporting', 'CustomMethodologySchema')
    Activity = apps.get_model('registration', 'Activity')
    SourceType = apps.get_model('reporting', 'SourceType')
    GasType = apps.get_model('reporting', 'GasType')
    Methodology = apps.get_model('reporting', 'Methodology')
    Configuration = apps.get_model('reporting', 'Configuration')

    # Fetch or create necessary related objects
    activity = Activity.objects.get(name='Hydrogen production')
    source_type = SourceType.objects.get(
        name='Steam reformation of hydrocarbons, partial oxidation of hydrocarbons or other transformation of hydrocarbon feedstock'
    )
    methodology = Methodology.objects.get(name='Feedstock Material Balance')
    gas_type = GasType.objects.get(chemical_formula='CO2')
    valid_from = Configuration.objects.get(valid_from='2024-01-01')
    valid_to = Configuration.objects.get(valid_to='2099-12-31')

    # Create a new record in CustomMethodologySchema
    CustomMethodologySchema.objects.create(
        activity=activity,
        source_type=source_type,  # Ensure this field exists in the model
        json_schema=schema,
        methodology=methodology,  # Ensure this field exists in the model
        gas_type=gas_type,  # Ensure this field exists in the model
        valid_from=valid_from,
        valid_to=valid_to,
    )


def reverse_init_custom_schema_data(apps, schema_monitor):
    '''
    Remove initial data from erc.base_schema
    '''
    CutsomSchema = apps.get_model('reporting', 'CustomMethodologySchema')
    Activity = apps.get_model('registration', 'Activity')
    CutsomSchema.objects.filter(activity_id=Activity.objects.get(name='Hydrogen production').id).delete()


#### SOURCE TYPE DATA ####
def init_activity_source_type_schema_data(apps, schema_monitor):
    '''
    Add initial data to erc.activity_schema
    '''
    ## Import JSON data
    import os

    cwd = os.getcwd()
    with open(
        f'{cwd}/reporting/json_schemas/2024/hydrogen_production/steam_reformation_or_gasification.json'
    ) as hydrogen_prod:
        schema = json.load(hydrogen_prod)

    ActivitySourceTypeSchema = apps.get_model('reporting', 'ActivitySourceTypeJsonSchema')
    Activity = apps.get_model('registration', 'Activity')
    SourceType = apps.get_model('reporting', 'SourceType')
    Configuration = apps.get_model('reporting', 'Configuration')
    ActivitySourceTypeSchema.objects.bulk_create(
        [
            ActivitySourceTypeSchema(
                activity_id=Activity.objects.get(name='Hydrogen production').id,
                source_type_id=SourceType.objects.get(
                    name='Steam reformation of hydrocarbons, partial oxidation of hydrocarbons or other transformation of hydrocarbon feedstock'
                ).id,
                has_unit=False,
                has_fuel=False,
                json_schema=schema,
                valid_from_id=Configuration.objects.get(valid_from='2024-01-01').id,
                valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
            )
        ]
    )


def reverse_init_activity_source_type_schema_data(apps, schema_monitor):
    '''
    Remove initial data from erc.base_schema
    '''
    ActivitySourceTypeJsonSchema = apps.get_model('reporting', 'ActivitySourceTypeJsonSchema')
    Activity = apps.get_model('registration', 'Activity')
    ActivitySourceTypeJsonSchema.objects.filter(
        activity_id=Activity.objects.get(name='Hydrogen production').id
    ).delete()


#### SCHEMA DATA ####
def init_activity_schema_data(apps, schema_monitor):
    '''
    Add initial schema data to erc.activity_schema
    '''
    ## Import JSON data
    import os

    cwd = os.getcwd()
    with open(f'{cwd}/reporting/json_schemas/2024/hydrogen_production/activity.json') as mfuel:
        schema = json.load(mfuel)

    ActivitySchema = apps.get_model('reporting', 'ActivityJsonSchema')
    Activity = apps.get_model('registration', 'Activity')
    Configuration = apps.get_model('reporting', 'Configuration')
    ActivitySchema.objects.create(
        activity_id=Activity.objects.get(name='Hydrogen production').id,
        json_schema=schema,
        valid_from_id=Configuration.objects.get(valid_from='2024-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    )


def reverse_init_activity_schema_data(apps, schema_monitor):
    '''
    Remove initial data from erc.base_schema
    '''
    ActivitySchema = apps.get_model('reporting', 'ActivityJsonSchema')
    Activity = apps.get_model('registration', 'Activity')
    ActivitySchema.objects.filter(activity_id=Activity.objects.get(name='Hydrogen production').id).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('reporting', '0016_custom_methodology_schema'),
    ]

    operations = [
        migrations.RunPython(init_custom_schema_data, reverse_init_custom_schema_data),
        migrations.RunPython(init_configuration_element_data, reverse_init_configuration_element_data),
        migrations.RunPython(
            init_configuration_element_reporting_fields_data, reverse_init_configuration_element_reporting_fields_data
        ),
        migrations.RunPython(init_activity_schema_data, reverse_init_activity_schema_data),
        migrations.RunPython(init_activity_source_type_schema_data, reverse_init_activity_source_type_schema_data),
    ]
