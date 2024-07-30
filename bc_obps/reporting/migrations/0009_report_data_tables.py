# Generated by Django 5.0.7 on 2024-07-31 16:52

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('registration', '0022_remove_historicalwellauthorizationnumber_facility_and_more'),
        ('reporting', '0008_general_stationary_combustion_data'),
    ]

    operations = [
        migrations.AddField(
            model_name='report',
            name='archived_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='report',
            name='archived_by',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_archived',
                to='registration.user',
            ),
        ),
        migrations.AddField(
            model_name='report',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, null=True),
        ),
        migrations.AddField(
            model_name='report',
            name='created_by',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_created',
                to='registration.user',
            ),
        ),
        migrations.AddField(
            model_name='report',
            name='updated_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='report',
            name='updated_by',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_updated',
                to='registration.user',
            ),
        ),
        migrations.AddField(
            model_name='reportfacility',
            name='archived_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='reportfacility',
            name='archived_by',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_archived',
                to='registration.user',
            ),
        ),
        migrations.AddField(
            model_name='reportfacility',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, null=True),
        ),
        migrations.AddField(
            model_name='reportfacility',
            name='created_by',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_created',
                to='registration.user',
            ),
        ),
        migrations.AddField(
            model_name='reportfacility',
            name='updated_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='reportfacility',
            name='updated_by',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_updated',
                to='registration.user',
            ),
        ),
        migrations.AddField(
            model_name='reportoperation',
            name='archived_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='reportoperation',
            name='archived_by',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_archived',
                to='registration.user',
            ),
        ),
        migrations.AddField(
            model_name='reportoperation',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, null=True),
        ),
        migrations.AddField(
            model_name='reportoperation',
            name='created_by',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_created',
                to='registration.user',
            ),
        ),
        migrations.AddField(
            model_name='reportoperation',
            name='updated_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='reportoperation',
            name='updated_by',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_updated',
                to='registration.user',
            ),
        ),
        migrations.AddField(
            model_name='reportversion',
            name='archived_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='reportversion',
            name='archived_by',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_archived',
                to='registration.user',
            ),
        ),
        migrations.AddField(
            model_name='reportversion',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, null=True),
        ),
        migrations.AddField(
            model_name='reportversion',
            name='created_by',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_created',
                to='registration.user',
            ),
        ),
        migrations.AddField(
            model_name='reportversion',
            name='updated_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='reportversion',
            name='updated_by',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_updated',
                to='registration.user',
            ),
        ),
        migrations.AlterField(
            model_name='report',
            name='operation',
            field=models.ForeignKey(
                db_comment='The operation for which this report was filed',
                on_delete=django.db.models.deletion.PROTECT,
                to='registration.operation',
            ),
        ),
        migrations.AlterField(
            model_name='report',
            name='operator',
            field=models.ForeignKey(
                db_comment='The operator to which this report belongs',
                on_delete=django.db.models.deletion.PROTECT,
                to='registration.operator',
            ),
        ),
        migrations.AlterField(
            model_name='report',
            name='reporting_year',
            field=models.ForeignKey(
                db_comment='The reporting year, for which this report is filled',
                on_delete=django.db.models.deletion.PROTECT,
                to='reporting.reportingyear',
            ),
        ),
        migrations.CreateModel(
            name='ReportActivity',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True, null=True)),
                ('updated_at', models.DateTimeField(blank=True, null=True)),
                ('archived_at', models.DateTimeField(blank=True, null=True)),
                (
                    'json_data',
                    models.JSONField(db_comment='A flat JSON object representing the data collected for this model'),
                ),
                (
                    'activity',
                    models.ForeignKey(
                        db_comment='The reporting activity this data applies to',
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name='%(class)s_records',
                        to='registration.reportingactivity',
                    ),
                ),
                (
                    'activity_base_schema',
                    models.ForeignKey(
                        db_comment='The activity base schema used to render the form that collected this data',
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name='%(class)s_records',
                        to='reporting.activityjsonschema',
                    ),
                ),
                (
                    'archived_by',
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name='%(class)s_archived',
                        to='registration.user',
                    ),
                ),
                (
                    'created_by',
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name='%(class)s_created',
                        to='registration.user',
                    ),
                ),
                (
                    'report_version',
                    models.ForeignKey(
                        db_comment='The report version this data belongs to',
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='%(class)s_records',
                        to='reporting.reportversion',
                    ),
                ),
                (
                    'updated_by',
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name='%(class)s_updated',
                        to='registration.user',
                    ),
                ),
            ],
            options={
                'db_table': 'erc"."report_activity',
                'db_table_comment': 'A table to store the reported activity-specific data, in a JSON format',
            },
        ),
        migrations.CreateModel(
            name='ReportFuel',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True, null=True)),
                ('updated_at', models.DateTimeField(blank=True, null=True)),
                ('archived_at', models.DateTimeField(blank=True, null=True)),
                (
                    'json_data',
                    models.JSONField(db_comment='A flat JSON object representing the data collected for this model'),
                ),
                (
                    'archived_by',
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name='%(class)s_archived',
                        to='registration.user',
                    ),
                ),
                (
                    'created_by',
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name='%(class)s_created',
                        to='registration.user',
                    ),
                ),
                (
                    'fuel_type',
                    models.ForeignKey(
                        db_comment='The fuel type this data applies to',
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name='%(class)s_records',
                        to='reporting.fueltype',
                    ),
                ),
                (
                    'report_version',
                    models.ForeignKey(
                        db_comment='The report version this data belongs to',
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='%(class)s_records',
                        to='reporting.reportversion',
                    ),
                ),
                (
                    'updated_by',
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name='%(class)s_updated',
                        to='registration.user',
                    ),
                ),
            ],
            options={
                'db_table': 'erc"."report_fuel',
                'db_table_comment': 'A table to store the reported activity-specific data, in a JSON format',
            },
        ),
        migrations.CreateModel(
            name='ReportEmission',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True, null=True)),
                ('updated_at', models.DateTimeField(blank=True, null=True)),
                ('archived_at', models.DateTimeField(blank=True, null=True)),
                (
                    'json_data',
                    models.JSONField(db_comment='A flat JSON object representing the data collected for this model'),
                ),
                (
                    'archived_by',
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name='%(class)s_archived',
                        to='registration.user',
                    ),
                ),
                (
                    'created_by',
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name='%(class)s_created',
                        to='registration.user',
                    ),
                ),
                (
                    'gas_type',
                    models.ForeignKey(
                        db_comment='The gas type this emission data applies to',
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name='%(class)s_records',
                        to='reporting.gastype',
                    ),
                ),
                (
                    'report_version',
                    models.ForeignKey(
                        db_comment='The report version this data belongs to',
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='%(class)s_records',
                        to='reporting.reportversion',
                    ),
                ),
                (
                    'updated_by',
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name='%(class)s_updated',
                        to='registration.user',
                    ),
                ),
                (
                    'report_fuel',
                    models.ForeignKey(
                        db_comment='The fuel data this emission data belongs to, if applicable',
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='%(class)s_records',
                        to='reporting.reportfuel',
                    ),
                ),
            ],
            options={
                'db_table': 'erc"."report_emission',
                'db_table_comment': 'A table to store the reported activity-specific data, in a JSON format',
            },
        ),
        migrations.CreateModel(
            name='ReportMethodology',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True, null=True)),
                ('updated_at', models.DateTimeField(blank=True, null=True)),
                ('archived_at', models.DateTimeField(blank=True, null=True)),
                (
                    'json_data',
                    models.JSONField(db_comment='A flat JSON object representing the data collected for this model'),
                ),
                (
                    'archived_by',
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name='%(class)s_archived',
                        to='registration.user',
                    ),
                ),
                (
                    'created_by',
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name='%(class)s_created',
                        to='registration.user',
                    ),
                ),
                (
                    'report_emission',
                    models.OneToOneField(
                        db_comment='The emission data this methodology applies to',
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='report_methodology',
                        to='reporting.reportemission',
                    ),
                ),
                (
                    'report_version',
                    models.ForeignKey(
                        db_comment='The report version this data belongs to',
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='%(class)s_records',
                        to='reporting.reportversion',
                    ),
                ),
                (
                    'updated_by',
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name='%(class)s_updated',
                        to='registration.user',
                    ),
                ),
            ],
            options={
                'db_table': 'erc"."report_methodology',
                'db_table_comment': 'A table to store the reported activity-specific data, in a JSON format',
            },
        ),
        migrations.CreateModel(
            name='ReportSourceType',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True, null=True)),
                ('updated_at', models.DateTimeField(blank=True, null=True)),
                ('archived_at', models.DateTimeField(blank=True, null=True)),
                (
                    'json_data',
                    models.JSONField(db_comment='A flat JSON object representing the data collected for this model'),
                ),
                (
                    'activity_source_type_base_schema',
                    models.ForeignKey(
                        db_comment='The activity-source-type base schema used to render the form that collected this data',
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name='%(class)s_records',
                        to='reporting.activitysourcetypejsonschema',
                    ),
                ),
                (
                    'archived_by',
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name='%(class)s_archived',
                        to='registration.user',
                    ),
                ),
                (
                    'created_by',
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name='%(class)s_created',
                        to='registration.user',
                    ),
                ),
                (
                    'report_activity',
                    models.ForeignKey(
                        db_comment='The activity data record this source type data belongs to',
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='%(class)s_records',
                        to='reporting.reportactivity',
                    ),
                ),
                (
                    'report_version',
                    models.ForeignKey(
                        db_comment='The report version this data belongs to',
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='%(class)s_records',
                        to='reporting.reportversion',
                    ),
                ),
                (
                    'source_type',
                    models.ForeignKey(
                        db_comment='The source type this data applies to',
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name='%(class)s_records',
                        to='reporting.sourcetype',
                    ),
                ),
                (
                    'updated_by',
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name='%(class)s_updated',
                        to='registration.user',
                    ),
                ),
            ],
            options={
                'db_table': 'erc"."report_source_type',
                'db_table_comment': 'A table to store the reported activity-specific data, in a JSON format',
            },
        ),
        migrations.AddField(
            model_name='reportfuel',
            name='report_source_type',
            field=models.ForeignKey(
                db_comment='The source type data this unit data belongs to',
                on_delete=django.db.models.deletion.CASCADE,
                related_name='%(class)s_records',
                to='reporting.reportsourcetype',
            ),
        ),
        migrations.AddField(
            model_name='reportemission',
            name='report_source_type',
            field=models.ForeignKey(
                db_comment='The source type data this emission data belongs to',
                on_delete=django.db.models.deletion.CASCADE,
                related_name='%(class)s_records',
                to='reporting.reportsourcetype',
            ),
        ),
        migrations.CreateModel(
            name='ReportUnit',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True, null=True)),
                ('updated_at', models.DateTimeField(blank=True, null=True)),
                ('archived_at', models.DateTimeField(blank=True, null=True)),
                (
                    'json_data',
                    models.JSONField(db_comment='A flat JSON object representing the data collected for this model'),
                ),
                (
                    'archived_by',
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name='%(class)s_archived',
                        to='registration.user',
                    ),
                ),
                (
                    'created_by',
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name='%(class)s_created',
                        to='registration.user',
                    ),
                ),
                (
                    'report_source_type',
                    models.ForeignKey(
                        db_comment='The source type data this unit data belongs to',
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='%(class)s_records',
                        to='reporting.reportsourcetype',
                    ),
                ),
                (
                    'report_version',
                    models.ForeignKey(
                        db_comment='The report version this data belongs to',
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='%(class)s_records',
                        to='reporting.reportversion',
                    ),
                ),
                (
                    'updated_by',
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name='%(class)s_updated',
                        to='registration.user',
                    ),
                ),
            ],
            options={
                'db_table': 'erc"."report_unit',
                'db_table_comment': 'A table to store the reported activity-specific data, in a JSON format',
            },
        ),
        migrations.AddField(
            model_name='reportfuel',
            name='report_unit',
            field=models.ForeignKey(
                db_comment='The unit form data this fuel data belongs to, if applicable',
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='%(class)s_records',
                to='reporting.reportunit',
            ),
        ),
    ]
