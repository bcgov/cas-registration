# Generated by Django 5.0.6 on 2024-07-05 17:40

import django.contrib.postgres.constraints
import django.contrib.postgres.fields.ranges
import django.db.models.deletion
import reporting.models.configuration
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('registration', '0022_remove_historicalwellauthorizationnumber_facility_and_more'),
        ('reporting', '0005_delete_sourcetype'),
    ]

    operations = [
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
        migrations.CreateModel(
            name='ConfigurationElement',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ],
            options={
                'db_table': 'erc"."configuration_element',
                'db_table_comment': 'Element of a configuration, representing a single relationship between multiple entities. Used to define an allowable activity-sourceType-gasType-methodology relationship as per WCI',
            },
        ),
        migrations.CreateModel(
            name='FuelType',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(db_comment='The name of a fuel type (example: Crude Oil)', max_length=1000)),
                (
                    'unit',
                    models.CharField(
                        db_comment='The unit of measurement for this fuel type (example: kilolitres)', max_length=1000
                    ),
                ),
            ],
            options={
                'db_table': 'erc"."fuel_type',
                'db_table_comment': 'This table contains the list of fuel types that can be reported.',
            },
        ),
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
            name='ReportingYear',
            fields=[
                (
                    'reporting_year',
                    models.IntegerField(
                        db_comment='Year for the reporting year, unique and serves as primary key',
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                (
                    'reporting_window_start',
                    models.DateTimeField(db_comment='Start of the reporting period for that reporting year, UTC-based'),
                ),
                (
                    'reporting_window_end',
                    models.DateTimeField(db_comment='End of the reporting period for that reporting year, UTC-based'),
                ),
                ('description', models.CharField(db_comment='Description for the reporting year', max_length=10000)),
            ],
            options={
                'db_table': 'erc"."reporting_year',
                'db_table_comment': 'Reporting year',
            },
        ),
        migrations.CreateModel(
            name='ReportVersion',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                (
                    'is_latest_submitted',
                    models.BooleanField(db_comment='True if this version is the latest submitted one'),
                ),
                (
                    'status',
                    models.CharField(
                        choices=[('draft', 'Draft'), ('submitted', 'Submitted')],
                        db_comment='The status for this report version: draft or submitted.',
                        max_length=1000,
                    ),
                ),
            ],
            options={
                'db_table': 'erc"."report_version',
                'db_table_comment': 'A table representing the multiple versions that a single report can have.',
            },
        ),
        migrations.CreateModel(
            name='SourceType',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(db_comment='The name of a source type', max_length=1000)),
            ],
            options={
                'db_table': 'erc"."source_type',
                'db_table_comment': 'Source types',
            },
        ),
        migrations.AlterModelTableComment(
            name='report',
            table_comment='A table to store report instances. Each operation has at most one report per year.',
        ),
        migrations.RemoveField(
            model_name='report',
            name='created_at',
        ),
        migrations.RemoveField(
            model_name='report',
            name='description',
        ),
        migrations.RemoveField(
            model_name='report',
            name='title',
        ),
        migrations.RemoveField(
            model_name='reportfacility',
            name='report',
        ),
        migrations.RemoveField(
            model_name='reportoperation',
            name='report',
        ),
        migrations.AddField(
            model_name='report',
            name='operation',
            field=models.ForeignKey(
                db_comment='The operation for which this report was filed',
                default='00000000-0000-0000-0000-000000000000',
                on_delete=django.db.models.deletion.DO_NOTHING,
                to='registration.operation',
            ),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='report',
            name='operator',
            field=models.ForeignKey(
                db_comment='The operator to which this report belongs',
                default='00000000-0000-0000-0000-000000000000',
                on_delete=django.db.models.deletion.DO_NOTHING,
                to='registration.operator',
            ),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='reportfacility',
            name='facility_bcghgid',
            field=models.CharField(
                blank=True, db_comment='The BC GHG ID of the facility as reported', max_length=1000, null=True
            ),
        ),
        migrations.AlterField(
            model_name='reportoperation',
            name='bc_obps_regulated_operation_id',
            field=models.CharField(
                blank=True,
                db_comment='The BC OBPS Regulated Operation ID (BORO ID) for this operation',
                max_length=255,
                null=True,
            ),
        ),
        migrations.AlterField(
            model_name='reportoperation',
            name='operation_representative_name',
            field=models.CharField(db_comment='The full name of the operation representative', max_length=10000),
        ),
        migrations.AlterField(
            model_name='reportoperation',
            name='operator_trade_name',
            field=models.CharField(
                blank=True,
                db_comment='The trade name of the operator operating this operation',
                max_length=1000,
                null=True,
            ),
        ),
        migrations.CreateModel(
            name='ActivityJsonSchema',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                (
                    'json_schema',
                    models.JSONField(
                        db_comment='The json schema for a specific activity. This defines the shape of the data collected for the related activity'
                    ),
                ),
                (
                    'reporting_activity',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name='+',
                        to='registration.reportingactivity',
                    ),
                ),
            ],
            options={
                'db_table': 'erc"."activity_json_schema',
                'db_table_comment': 'Intersection table that assigns a json_schema as valid for a period of time given an activity',
            },
        ),
        migrations.CreateModel(
            name='ActivitySourceTypeJsonSchema',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                (
                    'json_schema',
                    models.JSONField(
                        db_comment='The json schema for a specific activity-source type pair. This defines the shape of the data collected for the source type'
                    ),
                ),
                (
                    'has_unit',
                    models.BooleanField(
                        db_comment='Whether or not this source type should collect unit data. If true, add a unit schema when buidling the form object',
                        default=True,
                    ),
                ),
                (
                    'has_fuel',
                    models.BooleanField(
                        db_comment='Whether or not this source type should collect fuel data. If true, add a fuel schema when buidling the form object',
                        default=True,
                    ),
                ),
                (
                    'reporting_activity',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name='+',
                        to='registration.reportingactivity',
                    ),
                ),
            ],
            options={
                'db_table': 'erc"."activity_source_type_json_schema',
                'db_table_comment': 'Intersection table that assigns a json_schema as valid for a period of time given an activity-sourceType pair',
            },
        ),
        migrations.AddConstraint(
            model_name='configuration',
            constraint=django.contrib.postgres.constraints.ExclusionConstraint(
                expressions=[
                    (
                        reporting.models.configuration.TsTzRange(
                            'valid_from', 'valid_to', django.contrib.postgres.fields.ranges.RangeBoundary()
                        ),
                        '&&',
                    )
                ],
                name='exclude_overlapping_configuration_records_by_date_range',
            ),
        ),
        migrations.AddField(
            model_name='activitysourcetypejsonschema',
            name='valid_from',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.DO_NOTHING, related_name='+', to='reporting.configuration'
            ),
        ),
        migrations.AddField(
            model_name='activitysourcetypejsonschema',
            name='valid_to',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.DO_NOTHING, related_name='+', to='reporting.configuration'
            ),
        ),
        migrations.AddField(
            model_name='activityjsonschema',
            name='valid_from',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.DO_NOTHING, related_name='+', to='reporting.configuration'
            ),
        ),
        migrations.AddField(
            model_name='activityjsonschema',
            name='valid_to',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.DO_NOTHING, related_name='+', to='reporting.configuration'
            ),
        ),
        migrations.AddField(
            model_name='configurationelement',
            name='reporting_activity',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.DO_NOTHING,
                related_name='configuration_elements',
                to='registration.reportingactivity',
            ),
        ),
        migrations.AddField(
            model_name='configurationelement',
            name='valid_from',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.DO_NOTHING, related_name='+', to='reporting.configuration'
            ),
        ),
        migrations.AddField(
            model_name='configurationelement',
            name='valid_to',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.DO_NOTHING, related_name='+', to='reporting.configuration'
            ),
        ),
        migrations.AddField(
            model_name='configurationelement',
            name='gas_type',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.DO_NOTHING,
                related_name='configuration_elements',
                to='reporting.gastype',
            ),
        ),
        migrations.AddField(
            model_name='configurationelement',
            name='methodology',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.DO_NOTHING,
                related_name='configuration_elements',
                to='reporting.methodology',
            ),
        ),
        migrations.AddField(
            model_name='configurationelement',
            name='reporting_fields',
            field=models.ManyToManyField(
                blank=True, related_name='configuration_elements', to='reporting.reportingfield'
            ),
        ),
        migrations.AddField(
            model_name='report',
            name='reporting_year',
            field=models.ForeignKey(
                db_comment='The reporting year, for which this report is filled',
                default=9999,
                on_delete=django.db.models.deletion.DO_NOTHING,
                to='reporting.reportingyear',
            ),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='reportversion',
            name='report',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='reporting.report'),
        ),
        migrations.AddField(
            model_name='reportfacility',
            name='report_version',
            field=models.ForeignKey(
                db_comment='The report this facility information is related to',
                default=0,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='report_facilities',
                to='reporting.reportversion',
            ),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='reportoperation',
            name='report_version',
            field=models.OneToOneField(
                db_comment='The report this operation information relates to',
                default=0,
                on_delete=django.db.models.deletion.CASCADE,
                to='reporting.reportversion',
            ),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='configurationelement',
            name='source_type',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.DO_NOTHING,
                related_name='configuration_elements',
                to='reporting.sourcetype',
            ),
        ),
        migrations.AddField(
            model_name='activitysourcetypejsonschema',
            name='source_type',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.DO_NOTHING, related_name='+', to='reporting.sourcetype'
            ),
        ),
    ]
