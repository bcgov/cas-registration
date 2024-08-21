# Generated by Django 5.0.8 on 2024-08-20 20:54

from django.db import migrations

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
    # Carbonates used but not consumed in other activities set out in column 2
    ConfigurationElement.objects.bulk_create(
        [
            # CO2
            ConfigurationElement(
                activity_id=Activity.objects.get(name='Carbonates use').id,
                source_type_id=SourceType.objects.get(
                    name='Carbonates used but not consumed in other activities set out in column 2'
                ).id,
                gas_type_id=GasType.objects.get(chemical_formula='CO2').id,
                methodology_id=Methodology.objects.get(name='Calcination Fraction').id,
                valid_from_id=Configuration.objects.get(valid_from='2024-01-01').id,
                valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
            ),
            ConfigurationElement(
                activity_id=Activity.objects.get(name='Carbonates use').id,
                source_type_id=SourceType.objects.get(
                    name='Carbonates used but not consumed in other activities set out in column 2'
                ).id,
                gas_type_id=GasType.objects.get(chemical_formula='CO2').id,
                methodology_id=Methodology.objects.get(name='Mass of Output Carbonates').id,
                valid_from_id=Configuration.objects.get(valid_from='2024-01-01').id,
                valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
            ),
            ConfigurationElement(
                activity_id=Activity.objects.get(name='Carbonates use').id,
                source_type_id=SourceType.objects.get(
                    name='Carbonates used but not consumed in other activities set out in column 2'
                ).id,
                gas_type_id=GasType.objects.get(chemical_formula='CO2').id,
                methodology_id=Methodology.objects.get(name='Alternative Parameter Methodology').id,
                valid_from_id=Configuration.objects.get(valid_from='2024-01-01').id,
                valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
            ),
            ConfigurationElement(
                activity_id=Activity.objects.get(name='Carbonates use').id,
                source_type_id=SourceType.objects.get(
                    name='Carbonates used but not consumed in other activities set out in column 2'
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
        activity_id=Activity.objects.get(name='Carbonates use').id,
        valid_from_id=Configuration.objects.get(valid_from='2024-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).delete()


def init_reporting_field_data(apps, schema_monitor):
    '''
    Add initial data to erc.reporting_field
    '''

    ReportingField = apps.get_model('reporting', 'ReportingField')
    ReportingField.objects.bulk_create(
        [
            ReportingField(
                field_name='Annual mass of carbonate type consumed (tonnes)', field_type='number', field_units=None
            ),
            ReportingField(
                field_name='Fraction calcination achieved for each particular carbonate type (Weight factor)',
                field_type='number',
                field_units=None,
            ),
            ReportingField(field_name='Number of carbonate types', field_type='number', field_units=None),
            ReportingField(
                field_name='Annual mass of input carbonate type (tonnes)', field_type='number', field_units=None
            ),
            ReportingField(
                field_name='Annual mass of output carbonate type (tonnes)', field_type='number', field_units=None
            ),
            ReportingField(field_name='Number of input carbonate types', field_type='number', field_units=None),
            ReportingField(field_name='Number of output carbonate types', field_type='number', field_units=None),
        ]
    )


def reverse_init_reporting_field_data(apps, schema_monitor):
    '''
    Remove initial data from erc.reporting_field
    '''
    ReportingField = apps.get_model('reporting', 'ReportingField')
    ReportingField.objects.filter(
        field_name__in=[
            'Annual mass of carbonate type consumed (tonnes)'
            'Fraction calcination achieved for each particular carbonate type (Weight factor)'
            'Number of carbonate types'
            'Annual mass of input carbonate type (tonnes)'
            'Annual mass of output carbonate type (tonnes)'
            'Number of input carbonate types'
            'Number of output carbonate types'
        ]
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
    # CO2 - Calcination Fractions
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(name='Carbonates use').id,
        source_type_id=SourceType.objects.get(
            name='Carbonates used but not consumed in other activities set out in column 2'
        ).id,
        gas_type_id=GasType.objects.get(chemical_formula='CO2').id,
        methodology_id=Methodology.objects.get(name='Calcination Fraction').id,
        valid_from_id=Configuration.objects.get(valid_from='2024-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(
        ReportingField.objects.get(
            field_name='Annual mass of carbonate type consumed (tonnes)', field_units__isnull=True
        )
    )
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(name='Carbonates use').id,
        source_type_id=SourceType.objects.get(
            name='Carbonates used but not consumed in other activities set out in column 2'
        ).id,
        gas_type_id=GasType.objects.get(chemical_formula='CO2').id,
        methodology_id=Methodology.objects.get(name='Calcination Fraction').id,
        valid_from_id=Configuration.objects.get(valid_from='2024-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(
        ReportingField.objects.get(
            field_name='Fraction calcination achieved for each particular carbonate type (Weight factor)',
            field_units__isnull=True,
        )
    )
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(name='Carbonates use').id,
        source_type_id=SourceType.objects.get(
            name='Carbonates used but not consumed in other activities set out in column 2'
        ).id,
        gas_type_id=GasType.objects.get(chemical_formula='CO2').id,
        methodology_id=Methodology.objects.get(name='Calcination Fraction').id,
        valid_from_id=Configuration.objects.get(valid_from='2024-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(
        ReportingField.objects.get(
            field_name='Number of carbonate types',
            field_units__isnull=True,
        )
    )
    # CO2 - Mass of Output Carbonates
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(name='Carbonates use').id,
        source_type_id=SourceType.objects.get(
            name='Carbonates used but not consumed in other activities set out in column 2'
        ).id,
        gas_type_id=GasType.objects.get(chemical_formula='CO2').id,
        methodology_id=Methodology.objects.get(name='Mass of Output Carbonates').id,
        valid_from_id=Configuration.objects.get(valid_from='2024-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(
        ReportingField.objects.get(field_name='Annual mass of input carbonate type (tonnes)', field_units__isnull=True)
    )
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(name='Carbonates use').id,
        source_type_id=SourceType.objects.get(
            name='Carbonates used but not consumed in other activities set out in column 2'
        ).id,
        gas_type_id=GasType.objects.get(chemical_formula='CO2').id,
        methodology_id=Methodology.objects.get(name='Mass of Output Carbonates').id,
        valid_from_id=Configuration.objects.get(valid_from='2024-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(
        ReportingField.objects.get(field_name='Annual mass of output carbonate type (tonnes)', field_units__isnull=True)
    )
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(name='Carbonates use').id,
        source_type_id=SourceType.objects.get(
            name='Carbonates used but not consumed in other activities set out in column 2'
        ).id,
        gas_type_id=GasType.objects.get(chemical_formula='CO2').id,
        methodology_id=Methodology.objects.get(name='Mass of Output Carbonates').id,
        valid_from_id=Configuration.objects.get(valid_from='2024-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(
        ReportingField.objects.get(field_name='Number of input carbonate types', field_units__isnull=True)
    )
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(name='Carbonates use').id,
        source_type_id=SourceType.objects.get(
            name='Carbonates used but not consumed in other activities set out in column 2'
        ).id,
        gas_type_id=GasType.objects.get(chemical_formula='CO2').id,
        methodology_id=Methodology.objects.get(name='Mass of Output Carbonates').id,
        valid_from_id=Configuration.objects.get(valid_from='2024-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(
        ReportingField.objects.get(field_name='Number of output carbonate types ', field_units__isnull=True)
    )
    # CO2 - Alternative Parameter Methodology
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(name='Carbonates use').id,
        source_type_id=SourceType.objects.get(
            name='Carbonates used but not consumed in other activities set out in column 2'
        ).id,
        gas_type_id=GasType.objects.get(chemical_formula='CO2').id,
        methodology_id=Methodology.objects.get(name='Alternative Parameter Methodology').id,
        valid_from_id=Configuration.objects.get(valid_from='2024-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(ReportingField.objects.get(field_name='Description', field_units__isnull=True))
    # CO2 - Replacement Methodology
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(name='Carbonates use').id,
        source_type_id=SourceType.objects.get(
            name='Carbonates used but not consumed in other activities set out in column 2'
        ).id,
        gas_type_id=GasType.objects.get(chemical_formula='CO2').id,
        methodology_id=Methodology.objects.get(name='Replacement Methodology').id,
        valid_from_id=Configuration.objects.get(valid_from='2024-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(ReportingField.objects.get(field_name='Description', field_units__isnull=True))


def reverse_init_configuration_element_reporting_fields_data(apps, schema_monitor):
    '''
    Remove initial data from erc.configuration_element_reporting_fields
    '''
    ConfigurationElement = apps.get_model('reporting', 'ConfigurationElement')
    Activity = apps.get_model('registration', 'Activity')

    ConfigurationElement.reporting_fields.through.objects.filter(
        configurationelement_id__in=ConfigurationElement.objects.filter(
            activity_id=Activity.objects.get(name='Carbonates use').id
        ).values_list('id', flat=True)
    ).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('reporting', '0013_refinery_fuel_gas_data'),
    ]

    operations = [
        migrations.RunPython(init_configuration_element_data, reverse_init_configuration_element_data),
        migrations.RunPython(init_reporting_field_data, reverse_init_reporting_field_data),
        migrations.RunPython(
            init_configuration_element_reporting_fields_data, reverse_init_configuration_element_reporting_fields_data
        ),
    ]
