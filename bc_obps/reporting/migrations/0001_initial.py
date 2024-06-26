# Generated by Django 5.0.6 on 2024-06-26 21:45

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

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
>>>>>>> chore: change baseSchema model to jsonSchema
            name='Report',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(db_comment='The title of the report', max_length=100)),
                ('description', models.TextField(db_comment='The description of the report')),
                (
                    'created_at',
                    models.DateTimeField(auto_now_add=True, db_comment='The timestamp when the report was created'),
                ),
            ],
            options={
                'db_table': 'erc"."report',
                'db_table_comment': 'A table to store reports',
            },
        ),
        migrations.CreateModel(
            name='ReportFacility',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('facility_name', models.CharField(db_comment='The name of the facility as reported', max_length=1000)),
                ('facility_type', models.CharField(db_comment='The type of the facility as reported', max_length=1000)),
                (
                    'facility_bcghgid',
                    models.CharField(db_comment='The BC GHG ID of the facility as reported', max_length=1000),
                ),
            ],
            options={
                'db_table': 'erc"."report_facility',
                'db_table_comment': 'A table to store individual facility information as part of a report',
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
            name='ReportOperation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                (
                    'operator_legal_name',
                    models.CharField(
                        db_comment='The legal name of the operator operating this operation', max_length=1000
                    ),
                ),
                (
                    'operator_trade_name',
                    models.CharField(
                        db_comment='The trade name of the operator operating this operation', max_length=1000
                    ),
                ),
                (
                    'operation_name',
                    models.CharField(db_comment='The name of the operation, for which this report is', max_length=1000),
                ),
                (
                    'operation_type',
                    models.CharField(
                        choices=[('sfo', 'Sfo'), ('lfo', 'Lfo')],
                        db_comment='The type of the operation, LFO or SFO',
                        max_length=1000,
                    ),
                ),
                (
                    'operation_bcghgid',
                    models.CharField(
                        blank=True, db_comment='The BCGHGH ID of the operation', max_length=1000, null=True
                    ),
                ),
                (
                    'bc_obps_regulated_operation_id',
                    models.CharField(
                        db_comment='The BC OBPS Regulated Operation ID (BORO ID) for this operation', max_length=255
                    ),
                ),
                (
                    'operation_representative_name',
                    models.CharField(db_comment='The full name of the operation representative', max_length=1000),
                ),
            ],
            options={
                'db_table': 'erc"."report_operation',
                'db_table_comment': 'A table to store operation information as part of a report',
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
            name='ActivitySourceTypeEmissionJsonSchema',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                (
                    'json_schema',
                    models.JSONField(
                        db_comment='The json schema for an emission given a source type & activity. This defines the shape of the data collected for emissions for the related emission'
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
                'db_table': 'erc"."activity_source_type_emission_json_schema',
                'db_table_comment': 'Intersection table that assigns a json_schema for an emission as valid for a period of time given an activity & source type',
            },
        ),
        migrations.CreateModel(
            name='ActivitySourceTypeFuelJsonSchema',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                (
                    'json_schema',
                    models.JSONField(
                        db_comment='The json schema for a specific fuel within a source type. This defines the shape of the data collected for the fuel within the related source type'
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
                'db_table': 'erc"."activity_source_type_fuel_json_schema',
                'db_table_comment': 'Intersection table that assigns a json_schema for a fuel as valid for a period of time given an activity & source type',
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
        migrations.CreateModel(
            name='ActivitySourceTypeUnitJsonSchema',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                (
                    'json_schema',
                    models.JSONField(
                        db_comment='The json schema for a specific unit within a source type. This defines the shape of the data collected for the related unit data in a source type'
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
                'db_table': 'erc"."activity_source_type_unit_json_schema',
                'db_table_comment': 'Intersection table that assigns a json_schema for a unit as valid for a period of time given an activity & source type',
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
            model_name='activitysourcetypeunitjsonschema',
            name='valid_from',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.DO_NOTHING, related_name='+', to='reporting.configuration'
            ),
        ),
        migrations.AddField(
            model_name='activitysourcetypeunitjsonschema',
            name='valid_to',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.DO_NOTHING, related_name='+', to='reporting.configuration'
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
            model_name='activitysourcetypefueljsonschema',
            name='valid_from',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.DO_NOTHING, related_name='+', to='reporting.configuration'
            ),
        ),
        migrations.AddField(
            model_name='activitysourcetypefueljsonschema',
            name='valid_to',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.DO_NOTHING, related_name='+', to='reporting.configuration'
            ),
        ),
        migrations.AddField(
            model_name='activitysourcetypeemissionjsonschema',
            name='valid_from',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.DO_NOTHING, related_name='+', to='reporting.configuration'
            ),
        ),
        migrations.AddField(
            model_name='activitysourcetypeemissionjsonschema',
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
            model_name='reportfacility',
            name='activities',
            field=models.ManyToManyField(related_name='+', to='registration.reportingactivity'),
        ),
        migrations.AddField(
            model_name='reportfacility',
            name='products',
            field=models.ManyToManyField(related_name='+', to='registration.regulatedproduct'),
        ),
        migrations.AddField(
            model_name='reportfacility',
            name='report',
            field=models.ForeignKey(
                db_comment='The report this facility information is related to',
                on_delete=django.db.models.deletion.CASCADE,
                to='reporting.report',
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
            model_name='reportoperation',
            name='activities',
            field=models.ManyToManyField(related_name='+', to='registration.reportingactivity'),
        ),
        migrations.AddField(
            model_name='reportoperation',
            name='report',
            field=models.OneToOneField(
                db_comment='The report this operation information relates to',
                on_delete=django.db.models.deletion.CASCADE,
                to='reporting.report',
            ),
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
            model_name='activitysourcetypeunitjsonschema',
            name='source_type',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.DO_NOTHING, related_name='+', to='reporting.sourcetype'
            ),
        ),
        migrations.AddField(
            model_name='activitysourcetypejsonschema',
            name='source_type',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.DO_NOTHING, related_name='+', to='reporting.sourcetype'
            ),
        ),
        migrations.AddField(
            model_name='activitysourcetypefueljsonschema',
            name='source_type',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.DO_NOTHING, related_name='+', to='reporting.sourcetype'
            ),
        ),
        migrations.AddField(
            model_name='activitysourcetypeemissionjsonschema',
            name='source_type',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.DO_NOTHING, related_name='+', to='reporting.sourcetype'
            ),
        ),
    ]
