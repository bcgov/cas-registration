# Generated by Django 5.0.8 on 2024-08-29 17:14

from django.db import migrations
import json

#### CONFIG DATA ####


def init_additional_methodology_data(apps, schema_monitor):
    '''
    Add additional data to erc.methodology
    '''
    Methodology = apps.get_model('reporting', 'Methodology')
    Methodology.objects.bulk_create(
        [
            Methodology(name='Solids-HHV'),
            Methodology(name='Solids-CC'),
            Methodology(name='Make-up Chemical Use Methodology'),
        ]
    )


def reverse_init_additional_methodology_data(apps, schema_monitor):
    '''
    Remove additional data from erc.methodology
    '''
    Methodology = apps.get_model('reporting', 'Methodology')
    Methodology.objects.filter(
        name__in=[
            'Solids-HHV',
            'Solids-CC',
            'Make-up Chemical Use Methodology',
        ]
    ).delete()


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
    # Pulping and chemical recovery
    ConfigurationElement.objects.bulk_create(
        [
            # CO2
            ConfigurationElement(
                activity_id=Activity.objects.get(name='Pulp and paper production').id,
                source_type_id=SourceType.objects.get(name='Pulping and chemical recovery').id,
                gas_type_id=GasType.objects.get(chemical_formula='CO2').id,
                methodology_id=Methodology.objects.get(name='Solids-HHV').id,
                valid_from_id=Configuration.objects.get(valid_from='2024-01-01').id,
                valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
            ),
            ConfigurationElement(
                activity_id=Activity.objects.get(name='Pulp and paper production').id,
                source_type_id=SourceType.objects.get(name='Pulping and chemical recovery').id,
                gas_type_id=GasType.objects.get(chemical_formula='CO2').id,
                methodology_id=Methodology.objects.get(name='Solids-CC').id,
                valid_from_id=Configuration.objects.get(valid_from='2024-01-01').id,
                valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
            ),
            ConfigurationElement(
                activity_id=Activity.objects.get(name='Pulp and paper production').id,
                source_type_id=SourceType.objects.get(name='Pulping and chemical recovery').id,
                gas_type_id=GasType.objects.get(chemical_formula='CO2').id,
                methodology_id=Methodology.objects.get(name='Make-up Chemical Use Methodology').id,
                valid_from_id=Configuration.objects.get(valid_from='2024-01-01').id,
                valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
            ),
            ConfigurationElement(
                activity_id=Activity.objects.get(name='Pulp and paper production').id,
                source_type_id=SourceType.objects.get(name='Pulping and chemical recovery').id,
                gas_type_id=GasType.objects.get(chemical_formula='CO2').id,
                methodology_id=Methodology.objects.get(name='Alternative Parameter Methodology').id,
                valid_from_id=Configuration.objects.get(valid_from='2024-01-01').id,
                valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
            ),
            ConfigurationElement(
                activity_id=Activity.objects.get(name='Pulp and paper production').id,
                source_type_id=SourceType.objects.get(name='Pulping and chemical recovery').id,
                gas_type_id=GasType.objects.get(chemical_formula='CO2').id,
                methodology_id=Methodology.objects.get(name='Replacement Methodology').id,
                valid_from_id=Configuration.objects.get(valid_from='2024-01-01').id,
                valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
            ),
            # CH4
            ConfigurationElement(
                activity_id=Activity.objects.get(name='Pulp and paper production').id,
                source_type_id=SourceType.objects.get(name='Pulping and chemical recovery').id,
                gas_type_id=GasType.objects.get(chemical_formula='CH4').id,
                methodology_id=Methodology.objects.get(name='Solids-HHV').id,
                valid_from_id=Configuration.objects.get(valid_from='2024-01-01').id,
                valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
            ),
            ConfigurationElement(
                activity_id=Activity.objects.get(name='Pulp and paper production').id,
                source_type_id=SourceType.objects.get(name='Pulping and chemical recovery').id,
                gas_type_id=GasType.objects.get(chemical_formula='CH4').id,
                methodology_id=Methodology.objects.get(name='Alternative Parameter Methodology').id,
                valid_from_id=Configuration.objects.get(valid_from='2024-01-01').id,
                valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
            ),
            ConfigurationElement(
                activity_id=Activity.objects.get(name='Pulp and paper production').id,
                source_type_id=SourceType.objects.get(name='Pulping and chemical recovery').id,
                gas_type_id=GasType.objects.get(chemical_formula='CH4').id,
                methodology_id=Methodology.objects.get(name='Replacement Methodology').id,
                valid_from_id=Configuration.objects.get(valid_from='2024-01-01').id,
                valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
            ),
            # N2O
            ConfigurationElement(
                activity_id=Activity.objects.get(name='Pulp and paper production').id,
                source_type_id=SourceType.objects.get(name='Pulping and chemical recovery').id,
                gas_type_id=GasType.objects.get(chemical_formula='N2O').id,
                methodology_id=Methodology.objects.get(name='Solids-HHV').id,
                valid_from_id=Configuration.objects.get(valid_from='2024-01-01').id,
                valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
            ),
            ConfigurationElement(
                activity_id=Activity.objects.get(name='Pulp and paper production').id,
                source_type_id=SourceType.objects.get(name='Pulping and chemical recovery').id,
                gas_type_id=GasType.objects.get(chemical_formula='N2O').id,
                methodology_id=Methodology.objects.get(name='Alternative Parameter Methodology').id,
                valid_from_id=Configuration.objects.get(valid_from='2024-01-01').id,
                valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
            ),
            ConfigurationElement(
                activity_id=Activity.objects.get(name='Pulp and paper production').id,
                source_type_id=SourceType.objects.get(name='Pulping and chemical recovery').id,
                gas_type_id=GasType.objects.get(chemical_formula='N2O').id,
                methodology_id=Methodology.objects.get(name='Replacement Methodology').id,
                valid_from_id=Configuration.objects.get(valid_from='2024-01-01').id,
                valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
            ),
        ]
    )


def revere_init_configuration_element_data(apps, schema_monitor):
    '''
    Remove initial data from erc.configuration_element
    '''
    Configuration = apps.get_model('reporting', 'Configuration')
    Activity = apps.get_model('registration', 'Activity')
    ConfigurationElement = apps.get_model('reporting', 'ConfigurationElement')
    ConfigurationElement.objects.filter(
        activity_id=Activity.objects.get(name='Pulp and paper production').id,
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
            ReportingField(field_name='Carbonate Name', field_type='string', field_units=None),
            ReportingField(field_name='Annual Amount (t)', field_type='number', field_units=None),
            ReportingField(field_name='Purity Of Carbonate (Weight Fraction)', field_type='number', field_units=None),
            ReportingField(
                field_name='Mass of spent liquor combusted (tonnes/year)', field_type='number', field_units=None
            ),
            ReportingField(field_name='Solids percentage by weight (%)', field_type='number', field_units=None),
            ReportingField(
                field_name='Annual high heat value of spent liquor solids (GJ/kg)',
                field_type='number',
                field_units=None,
            ),
            ReportingField(
                field_name='Annual carbon content of spent liquor solids (% by weight)',
                field_type='number',
                field_units=None,
            ),
            ReportingField(
                field_name='Make-up quantity of CaCO3 used (tonnes/year)',
                field_type='number',
                field_units=None,
            ),
            ReportingField(
                field_name='Make-up quantity of Na2CO3 used (tonnes/year)',
                field_type='number',
                field_units=None,
            ),
        ]
    )


def reverse_init_reporting_field_data(apps, schema_monitor):
    '''
    Remove initial data from erc.reporting_field
    '''
    ReportingField = apps.get_model('reporting', 'ReportingField')
    ReportingField.objects.filter(
        field_name__in=[
            'Carbonate Name',
            'Annual Amount (t)',
            'Purity Of Carbonate (Weight Fraction)',
            'Mass of spent liquor combusted (tonnes/year)',
            'Solids percentage by weight (%)',
            'Annual high heat value of spent liquor solids (GJ/kg)',
            'Annual carbon content of spent liquor solids (% by weight)',
            'Make-up quantity of CaCO3 used (tonnes/year)',
            'Make-up quantity of Na2CO3 used (tonnes/year)',
        ]
    ).delete()


def init_configuration_element_reporting_fields_data(apps, schema_monitor):
    '''
    Add initial data to erc.configuration_element_reporting_fields
    '''
    ConfigurationElement = apps.get_model('reporting', 'ConfigurationElement')
    Activity = apps.get_model('registration', 'Activity')
    SourceType = apps.get_model('reporting', 'SourceType')
    GasType = apps.get_model('reporting', 'GasType')
    Methodology = apps.get_model('reporting', 'Methodology')
    Configuration = apps.get_model('reporting', 'Configuration')
    ReportingField = apps.get_model('reporting', 'ReportingField')
    # CO2
    # CO2 - Solids-HHV
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(name='Pulp and paper production').id,
        source_type_id=SourceType.objects.get(name='Pulping and chemical recovery').id,
        gas_type_id=GasType.objects.get(chemical_formula='CO2').id,
        methodology_id=Methodology.objects.get(name='Solids-HHV').id,
        valid_from_id=Configuration.objects.get(valid_from='2024-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(
        ReportingField.objects.get(field_name='Mass of spent liquor combusted (tonnes/year)', field_units__isnull=True),
    )
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(name='Pulp and paper production').id,
        source_type_id=SourceType.objects.get(name='Pulping and chemical recovery').id,
        gas_type_id=GasType.objects.get(chemical_formula='CO2').id,
        methodology_id=Methodology.objects.get(name='Solids-HHV').id,
        valid_from_id=Configuration.objects.get(valid_from='2024-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(
        ReportingField.objects.get(field_name='Solids percentage by weight (%)', field_units__isnull=True),
    )
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(name='Pulp and paper production').id,
        source_type_id=SourceType.objects.get(name='Pulping and chemical recovery').id,
        gas_type_id=GasType.objects.get(chemical_formula='CO2').id,
        methodology_id=Methodology.objects.get(name='Solids-HHV').id,
        valid_from_id=Configuration.objects.get(valid_from='2024-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(
        ReportingField.objects.get(
            field_name='Annual high heat value of spent liquor solids (GJ/kg)', field_units__isnull=True
        ),
    )
    # CO2 - Solids-CC
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(name='Pulp and paper production').id,
        source_type_id=SourceType.objects.get(name='Pulping and chemical recovery').id,
        gas_type_id=GasType.objects.get(chemical_formula='CO2').id,
        methodology_id=Methodology.objects.get(name='Solids-CC').id,
        valid_from_id=Configuration.objects.get(valid_from='2024-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(
        ReportingField.objects.get(field_name='Mass of spent liquor combusted (tonnes/year)', field_units__isnull=True),
    )
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(name='Pulp and paper production').id,
        source_type_id=SourceType.objects.get(name='Pulping and chemical recovery').id,
        gas_type_id=GasType.objects.get(chemical_formula='CO2').id,
        methodology_id=Methodology.objects.get(name='Solids-CC').id,
        valid_from_id=Configuration.objects.get(valid_from='2024-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(
        ReportingField.objects.get(field_name='Solids percentage by weight (%)', field_units__isnull=True),
    )
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(name='Pulp and paper production').id,
        source_type_id=SourceType.objects.get(name='Pulping and chemical recovery').id,
        gas_type_id=GasType.objects.get(chemical_formula='CO2').id,
        methodology_id=Methodology.objects.get(name='Solids-CC').id,
        valid_from_id=Configuration.objects.get(valid_from='2024-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(
        ReportingField.objects.get(
            field_name='Annual carbon content of spent liquor solids (% by weight)', field_units__isnull=True
        ),
    )
    # CO2 - Make-up Chemical Use Methodology
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(name='Pulp and paper production').id,
        source_type_id=SourceType.objects.get(name='Pulping and chemical recovery').id,
        gas_type_id=GasType.objects.get(chemical_formula='CO2').id,
        methodology_id=Methodology.objects.get(name='Make-up Chemical Use Methodology').id,
        valid_from_id=Configuration.objects.get(valid_from='2024-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(
        ReportingField.objects.get(field_name='Make-up quantity of CaCO3 used (tonnes/year)', field_units__isnull=True),
    )
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(name='Pulp and paper production').id,
        source_type_id=SourceType.objects.get(name='Pulping and chemical recovery').id,
        gas_type_id=GasType.objects.get(chemical_formula='CO2').id,
        methodology_id=Methodology.objects.get(name='Make-up Chemical Use Methodology').id,
        valid_from_id=Configuration.objects.get(valid_from='2024-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(
        ReportingField.objects.get(
            field_name='Make-up quantity of Na2CO3 used (tonnes/year)', field_units__isnull=True
        ),
    )
    # CO2 - Alternative Parameter Methodology
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(name='Pulp and paper production').id,
        source_type_id=SourceType.objects.get(name='Pulping and chemical recovery').id,
        gas_type_id=GasType.objects.get(chemical_formula='CO2').id,
        methodology_id=Methodology.objects.get(name='Alternative Parameter Methodology').id,
        valid_from_id=Configuration.objects.get(valid_from='2024-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(
        ReportingField.objects.get(field_name='Description', field_units__isnull=True),
    )
    # CO2 - Replacement Methodology
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(name='Pulp and paper production').id,
        source_type_id=SourceType.objects.get(name='Pulping and chemical recovery').id,
        gas_type_id=GasType.objects.get(chemical_formula='CO2').id,
        methodology_id=Methodology.objects.get(name='Replacement Methodology').id,
        valid_from_id=Configuration.objects.get(valid_from='2024-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(
        ReportingField.objects.get(field_name='Description', field_units__isnull=True),
    )

    # CH4
    # CH4 - Solids-HHV
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(name='Pulp and paper production').id,
        source_type_id=SourceType.objects.get(name='Pulping and chemical recovery').id,
        gas_type_id=GasType.objects.get(chemical_formula='CH4').id,
        methodology_id=Methodology.objects.get(name='Solids-HHV').id,
        valid_from_id=Configuration.objects.get(valid_from='2024-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(
        ReportingField.objects.get(field_name='Mass of spent liquor combusted (tonnes/year)', field_units__isnull=True),
    )
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(name='Pulp and paper production').id,
        source_type_id=SourceType.objects.get(name='Pulping and chemical recovery').id,
        gas_type_id=GasType.objects.get(chemical_formula='CH4').id,
        methodology_id=Methodology.objects.get(name='Solids-HHV').id,
        valid_from_id=Configuration.objects.get(valid_from='2024-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(
        ReportingField.objects.get(field_name='Solids percentage by weight (%)', field_units__isnull=True),
    )
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(name='Pulp and paper production').id,
        source_type_id=SourceType.objects.get(name='Pulping and chemical recovery').id,
        gas_type_id=GasType.objects.get(chemical_formula='CH4').id,
        methodology_id=Methodology.objects.get(name='Solids-HHV').id,
        valid_from_id=Configuration.objects.get(valid_from='2024-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(
        ReportingField.objects.get(
            field_name='Annual high heat value of spent liquor solids (GJ/kg)', field_units__isnull=True
        ),
    )
    # CH4 - Alternative Parameter Methodology
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(name='Pulp and paper production').id,
        source_type_id=SourceType.objects.get(name='Pulping and chemical recovery').id,
        gas_type_id=GasType.objects.get(chemical_formula='CH4').id,
        methodology_id=Methodology.objects.get(name='Alternative Parameter Methodology').id,
        valid_from_id=Configuration.objects.get(valid_from='2024-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(
        ReportingField.objects.get(field_name='Description', field_units__isnull=True),
    )
    # CH4 - Replacement Methodology
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(name='Pulp and paper production').id,
        source_type_id=SourceType.objects.get(name='Pulping and chemical recovery').id,
        gas_type_id=GasType.objects.get(chemical_formula='CH4').id,
        methodology_id=Methodology.objects.get(name='Replacement Methodology').id,
        valid_from_id=Configuration.objects.get(valid_from='2024-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(
        ReportingField.objects.get(field_name='Description', field_units__isnull=True),
    )

    # N2O
    # N2O - Solids-HHV
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(name='Pulp and paper production').id,
        source_type_id=SourceType.objects.get(name='Pulping and chemical recovery').id,
        gas_type_id=GasType.objects.get(chemical_formula='N2O').id,
        methodology_id=Methodology.objects.get(name='Solids-HHV').id,
        valid_from_id=Configuration.objects.get(valid_from='2024-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(
        ReportingField.objects.get(field_name='Mass of spent liquor combusted (tonnes/year)', field_units__isnull=True),
    )
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(name='Pulp and paper production').id,
        source_type_id=SourceType.objects.get(name='Pulping and chemical recovery').id,
        gas_type_id=GasType.objects.get(chemical_formula='N2O').id,
        methodology_id=Methodology.objects.get(name='Solids-HHV').id,
        valid_from_id=Configuration.objects.get(valid_from='2024-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(
        ReportingField.objects.get(field_name='Solids percentage by weight (%)', field_units__isnull=True),
    )
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(name='Pulp and paper production').id,
        source_type_id=SourceType.objects.get(name='Pulping and chemical recovery').id,
        gas_type_id=GasType.objects.get(chemical_formula='N2O').id,
        methodology_id=Methodology.objects.get(name='Solids-HHV').id,
        valid_from_id=Configuration.objects.get(valid_from='2024-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(
        ReportingField.objects.get(
            field_name='Annual high heat value of spent liquor solids (GJ/kg)', field_units__isnull=True
        ),
    )
    # N2O - Alternative Parameter Methodology
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(name='Pulp and paper production').id,
        source_type_id=SourceType.objects.get(name='Pulping and chemical recovery').id,
        gas_type_id=GasType.objects.get(chemical_formula='N2O').id,
        methodology_id=Methodology.objects.get(name='Alternative Parameter Methodology').id,
        valid_from_id=Configuration.objects.get(valid_from='2024-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(
        ReportingField.objects.get(field_name='Description', field_units__isnull=True),
    )
    # N2O - Replacement Methodology
    ConfigurationElement.objects.get(
        activity_id=Activity.objects.get(name='Pulp and paper production').id,
        source_type_id=SourceType.objects.get(name='Pulping and chemical recovery').id,
        gas_type_id=GasType.objects.get(chemical_formula='N2O').id,
        methodology_id=Methodology.objects.get(name='Replacement Methodology').id,
        valid_from_id=Configuration.objects.get(valid_from='2024-01-01').id,
        valid_to_id=Configuration.objects.get(valid_to='2099-12-31').id,
    ).reporting_fields.add(
        ReportingField.objects.get(field_name='Description', field_units__isnull=True),
    )


def reverse_init_configuration_element_reporting_fields_data(apps, schema_monitor):
    '''
    Remove initial data from erc.configuration_element_reporting_fields
    '''
    ConfigurationElement = apps.get_model('reporting', 'ConfigurationElement')
    Activity = apps.get_model('registration', 'Activity')

    ConfigurationElement.reporting_fields.filter(
        configurationelement_id__in=ConfigurationElement.objects.filter(
            activity_id=Activity.objects.get(name='Pulp and paper production').id,
        ).values_list('id', flat=True),
    ).delete()


#### SCHEMA DATA ####
def init_activity_schema_data(apps, schema_monitor):
    '''
    Add initial schema data to erc.activity_schema
    '''
    ## Import JSON data
    import os

    cwd = os.getcwd()
    with open(
        f'{cwd}/reporting/json_schemas/2024/pulp_and_paper_production/activity.json'
    ) as pulp_and_paper_production:
        schema = json.load(pulp_and_paper_production)

    ActivitySchema = apps.get_model('reporting', 'ActivityJsonSchema')
    Activity = apps.get_model('registration', 'Activity')
    Configuration = apps.get_model('reporting', 'Configuration')
    ActivitySchema.objects.create(
        activity_id=Activity.objects.get(name='Pulp and paper production').id,
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
    ActivitySchema.objects.filter(activity_id=Activity.objects.get(name='Pulp and paper production').id).delete()


#### SOURCE TYPE DATA ####
def init_activity_source_type_schema_data(apps, schema_monitor):
    '''
    Add initial data to erc.activity_schema
    '''
    ## Import JSON data
    import os

    cwd = os.getcwd()
    with open(
        f'{cwd}/reporting/json_schemas/2024/pulp_and_paper_production/pulp_and_paper_production.json'
    ) as pulp_and_paper_production_st:
        schema = json.load(pulp_and_paper_production_st)

    ActivitySourceTypeSchema = apps.get_model('reporting', 'ActivitySourceTypeJsonSchema')
    Activity = apps.get_model('registration', 'Activity')
    SourceType = apps.get_model('reporting', 'SourceType')
    Configuration = apps.get_model('reporting', 'Configuration')
    ActivitySourceTypeSchema.objects.bulk_create(
        [
            ActivitySourceTypeSchema(
                activity_id=Activity.objects.get(name='Pulp and paper production').id,
                source_type_id=SourceType.objects.get(name='Pulping and chemical recovery').id,
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
        activity_id=Activity.objects.get(name='Pulp and paper production').id
    ).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('reporting', '0017_hydrogen_production'),
    ]

    operations = [
        migrations.RunPython(init_additional_methodology_data, reverse_init_additional_methodology_data),
        migrations.RunPython(init_configuration_element_data, revere_init_configuration_element_data),
        migrations.RunPython(init_reporting_field_data, reverse_init_reporting_field_data),
        migrations.RunPython(
            init_configuration_element_reporting_fields_data, reverse_init_configuration_element_reporting_fields_data
        ),
        migrations.RunPython(init_activity_schema_data, reverse_init_activity_schema_data),
        migrations.RunPython(init_activity_source_type_schema_data, reverse_init_activity_source_type_schema_data),
    ]
