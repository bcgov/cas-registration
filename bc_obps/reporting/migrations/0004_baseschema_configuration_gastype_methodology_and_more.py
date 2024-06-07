# Generated by Django 5.0.6 on 2024-06-04 18:31

import django.db.models.deletion
from django.db import migrations, models
import json
from registration.models import ReportingActivity
from reporting.models import SourceType, Configuration, BaseSchema


def init_gas_type_data(apps, schema_monitor):
    '''
    Add initial data to erc.gastype
    '''
    GasType = apps.get_model('reporting', 'GasType')
    GasType.objects.bulk_create(
        [
            GasType(name='Carbon Dioxide', chemical_formula='CO2'),
            GasType(name='Nitrous Oxide', chemical_formula='N2O'),
            GasType(name='Methane', chemical_formula='CH4'),
            GasType(name='Sulfur Hexafluoride', chemical_formula='SF6'),
            GasType(name='Tetrafluoromethane', chemical_formula='CF4'),
            GasType(name='Perfluoroethane', chemical_formula='C2F6'),
            GasType(name='Difluoromethane', chemical_formula='CH2F2'),
            GasType(name='Pentafluoroethane', chemical_formula='C2HF5'),
            GasType(name='1,1,1,2-Tetrafluoroethane', chemical_formula='C2H2F4'),
        ]
)


def reverse_init_gas_type_data(apps, schema_monitor):
    '''
    Remove initial data from erc.gas_type
    '''
    GasType = apps.get_model('reporting', 'GasType')
    GasType.objects.filter(
        chemical_formula__in=['CO2', 'N2O', 'CH4', 'SF6', 'CF4', 'C2F6', 'CH2F2', 'C2HF5', 'C2H2F4']
    ).delete()


def init_methodology_data(apps, schema_monitor):
    '''
    Add initial data to erc.methodology
    '''
    GasType = apps.get_model('reporting', 'Methodology')
    GasType.objects.bulk_create(
        [
            GasType(name='Default HHV/Default EF'),
            GasType(name='Default EF'),
            GasType(name='Measured HHV/Default EF'),
            GasType(name='Measured Steam/Default EF'),
            GasType(name='Measured CC'),
            GasType(name='Measured Steam/Measured EF'),
            GasType(name='Alternative Parameter Measurement'),
            GasType(name='Replacement Methodology'),
            GasType(name='Anode Consumption'),
            GasType(name='Slope method'),
            GasType(name='Overvoltage method'),
            GasType(name='C2F6 anode effects'),
            GasType(name='Inventory'),
            GasType(name='Input/output'),
        ]
    )


def reverse_init_methodology_data(apps, schema_monitor):
    '''
    Remove initial data from erc.methodology
    '''
    Methodology = apps.get_model('reporting', 'Methodology')
    Methodology.objects.filter(
        name__in=[
            'Default HHV/Default EF'
            'Default EF'
            'Measured HHV/Default EF'
            'Measured Steam/Default EF'
            'Measured CC'
            'Measured Steam/Measured EF'
            'Alternative Parameter Measurement'
            'Replacement Methodology'
            'Anode Consumption'
            'Slope method'
            'Overvoltage method'
            'C2F6 anode effects'
            'Inventory'
            'Input/output'
        ]
    ).delete()

def init_base_schema_data(apps, schema_monitor):
    '''
    Add initial data to erc.baseSchema
    '''
    ## Import JSON base schema data
    import os
    cwd = os.getcwd()
    with open(f'{cwd}/reporting/base_json_schemas/general_stationary_combustion/gsc_of_fuel_or_waste_with_production_of_useful_energy_2024.json') as gsc_st1:
        gsc_source_type_1 = json.load(gsc_st1)


    BaseSchema = apps.get_model('reporting', 'BaseSchema')
    BaseSchema.objects.bulk_create(
        [
            BaseSchema(slug='gsc_of_fuel_or_waste_with_production_of_useful_energy_2024', schema=gsc_source_type_1),
            BaseSchema(slug='gsc_of_fuel_or_waste_without_production_of_useful_energy_2024', schema=gsc_source_type_1)
        ]
    )

def reverse_init_base_schema_data(apps, schema_monitor):
    '''
    Remove initial data from erc.base_schema
    '''
    BaseSchema = apps.get_model('reporting', 'BaseSchema')
    BaseSchema.objects.filter(
        slug__in=[
            'gsc_of_fuel_or_waste_with_production_of_useful_energy_2024'
            'gsc_of_fuel_or_waste_without_production_of_useful_energy_2024'
        ]
    ).delete()

def init_configuration_data(apps, schema_monitor):
    '''
    Add initial data to erc.configuration
    '''


    Configuration = apps.get_model('reporting', 'Configuration')
    Configuration.objects.bulk_create(
        [
            Configuration(slug='2024', valid_from='2024-01-01', valid_to='9999-12-31')
        ]
    )

def reverse_init_configuration_data(apps, schema_monitor):
    '''
    Remove initial data from erc.configuration
    '''
    Configuration = apps.get_model('reporting', 'Configuration')
    Configuration.objects.filter(
        slug__in=[
            '2024'
        ]
    ).delete()

def init_activity_source_type_base_schema_data(apps, schema_monitor):
    '''
    Add initial data to erc.activity_source_type_base_schema
    '''


    ASTBS = apps.get_model('reporting', 'ActivitySourceTypeBaseSchema')
    ASTBS.objects.bulk_create(
        [
            ASTBS(
              reporting_activity_id=ReportingActivity.objects.get(name='General stationary combustion').id,
              source_type_id=SourceType.objects.get(name='General stationary combustion of fuel or waste with production of useful energy').id,
              base_schema_id=BaseSchema.objects.get(slug='gsc_of_fuel_or_waste_with_production_of_useful_energy_2024').id,
              valid_from_id=Configuration.objects.get(valid_from='2024-01-01').id,
              valid_to_id=Configuration.objects.get(valid_to='9999-12-31').id
            ),
            ASTBS(
              reporting_activity_id=ReportingActivity.objects.get(name='General stationary combustion').id,
              source_type_id=SourceType.objects.get(name='General stationary combustion of waste without production of useful energy').id,
              base_schema_id=BaseSchema.objects.get(slug='gsc_of_fuel_or_waste_without_production_of_useful_energy_2024').id,
              valid_from_id=Configuration.objects.get(valid_from='2024-01-01').id,
              valid_to_id=Configuration.objects.get(valid_to='9999-12-31').id
            )
        ]
    )

def reverse_init_activity_source_type_base_schema_data(apps, schema_monitor):
    '''
    Remove initial data from erc.activity_source_type_base_schema
    '''
    ASTBS = apps.get_model('reporting', 'ActivitySourceTypeBaseSchema')
    ASTBS.objects.filter(
        valid_from='2024-01-01',
        valid_to='9999-12-31'
    ).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('registration', '0018_alter_address_table_comment_and_more'),
        ('reporting', '0003_reportfacility_reportoperation'),
    ]

    operations = [
        migrations.CreateModel(
            name='BaseSchema',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                (
                    'slug',
                    models.CharField(
                        db_comment='Name of the base schema. Should describe what form it is used to generate and when the base schema took effect. For example: general_stationary_combustion_2024',
                        max_length=1000,
                    ),
                ),
                (
                    'schema',
                    models.JSONField(
                        db_comment='The base json schema for a form. This schema defines the static set of fields that should be shown on a form, static meaning that they do not dynamically change based on user input.',
                        max_length=100000,
                    ),
                ),
            ],
            options={
                'db_table': 'erc"."base_schema',
                'db_table_comment': 'This table contains the base json schema data for displaying emission forms. The base schema can be defined by activity and source type and does not change based on user input so it can be stored statically',
            },
        ),
        migrations.RunPython(init_base_schema_data, reverse_init_base_schema_data),
        migrations.CreateModel(
            name='Configuration',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                (
                    'slug',
                    models.CharField(db_comment='Unique identifier for a configuration', max_length=1000, unique=True),
                ),
                (
                    'valid_from',
                    models.DateField(
                        blank=True, db_comment='Date from which the configuration is applicable', null=True
                    ),
                ),
                (
                    'valid_to',
                    models.DateField(
                        blank=True, db_comment='Date until which the configuration is applicable', null=True
                    ),
                ),
            ],
            options={
                'db_table': 'erc"."configuration',
                'db_table_comment': 'Table containing program configurations for a date range. Each record will define a time period for when configuration elements are valid. When a change to the configuration is made a new configuration record will be created. This enables historical accuracy when applying configurations from previous years.',
            },
        ),
        migrations.RunPython(init_configuration_data, reverse_init_configuration_data),
        migrations.CreateModel(
            name='GasType',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                (
                    'name',
                    models.CharField(
                        db_comment='The name of a greenhouse gas type (example: Carbon Dioxide)', max_length=1000
                    ),
                ),
                (
                    'chemical_formula',
                    models.CharField(
                        db_comment='The chemical formula representation of a greenhouse gast type (example: CO2)',
                        max_length=100,
                    ),
                ),
            ],
            options={
                'db_table': 'erc"."gas_type',
                'db_table_comment': 'This table contains the list of gas types that can be reported as defined in GGERR (Greenhous Gas Emission Reporting Regulation)',
            },
        ),
        migrations.RunPython(init_gas_type_data, reverse_init_gas_type_data),
        migrations.CreateModel(
            name='Methodology',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(db_comment='The name of a reporting methodology', max_length=1000)),
            ],
            options={
                'db_table': 'erc"."methodology',
                'db_table_comment': 'Table contains the set of reporting methodologies that can be applied to an emission as outlined in GGERR (Greenhous Gas Emission Reporting Regulation)',
            },
        ),
        migrations.RunPython(init_methodology_data, reverse_init_methodology_data),
        migrations.CreateModel(
            name='ReportingField',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                (
                    'field_name',
                    models.CharField(
                        db_comment='Name of field needed for the related configuration element.', max_length=1000
                    ),
                ),
                ('field_type', models.CharField(db_comment='Type definition for field.', max_length=1000)),
            ],
            options={
                'db_table': 'erc"."reporting_field',
                'db_table_comment': 'A field name/type combination that relates to a configuration element record through the config_element_reporting_field intersection table. Used to dynamically create a form schema from the configuration',
            },
        ),
        migrations.CreateModel(
            name='ActivitySourceTypeBaseSchema',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                (
                    'reporting_activity',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name='activity_source_type_base_schemas',
                        to='registration.reportingactivity',
                    ),
                ),
                (
                    'source_type',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name='activity_source_type_base_schemas',
                        to='reporting.sourcetype',
                    ),
                ),
                (
                    'base_schema',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name='activity_source_type_base_schemas',
                        to='reporting.baseschema',
                    ),
                ),
                (
                    'valid_from',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.DO_NOTHING, related_name='+', to='reporting.configuration'
                    ),
                ),
                (
                    'valid_to',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.DO_NOTHING, related_name='+', to='reporting.configuration'
                    ),
                ),
            ],
            options={
                'db_table': 'erc"."activity_source_type_base_schema',
                'db_table_comment': 'Intersection table that assigns a base_schema as valid for a period of time given an activity-sourceType pair',
            },
        ),
        migrations.RunPython(init_activity_source_type_base_schema_data, reverse_init_activity_source_type_base_schema_data),
        migrations.CreateModel(
            name='ConfigurationElement',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                (
                    'reporting_activity',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name='configuration_elements',
                        to='registration.reportingactivity',
                    ),
                ),
                (
                    'source_type',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name='configuration_elements',
                        to='reporting.sourcetype',
                    ),
                ),
                (
                    'valid_from',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.DO_NOTHING, related_name='+', to='reporting.configuration'
                    ),
                ),
                (
                    'valid_to',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.DO_NOTHING, related_name='+', to='reporting.configuration'
                    ),
                ),
                (
                    'gas_type',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name='configuration_elements',
                        to='reporting.gastype',
                    ),
                ),
                (
                    'methodology',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name='configuration_elements',
                        to='reporting.methodology',
                    ),
                ),
                (
                    'reporting_fields',
                    models.ManyToManyField(
                        blank=True, related_name='configuration_elements', to='reporting.reportingfield'
                    ),
                ),
            ],
            options={
                'db_table': 'erc"."configuration_element',
                'db_table_comment': 'Element of a configuration, representing a single relationship between multiple entities. Used to define an allowable activity-sourceType-gasType-methodology relationship as per WCI',
            },
        ),
        migrations.AddConstraint(
            model_name='activitysourcetypebaseschema',
            constraint=models.UniqueConstraint(
                fields=('reporting_activity', 'source_type', 'base_schema', 'valid_from', 'valid_to'),
                name='unique_per_acivity_source_type_base_schema',
            ),
        ),
        migrations.AddConstraint(
            model_name='configurationelement',
            constraint=models.UniqueConstraint(
                fields=('reporting_activity', 'source_type', 'gas_type', 'methodology', 'valid_from', 'valid_to'),
                name='unique_per_config',
            ),
        ),
    ]
