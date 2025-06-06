# Generated by Django 5.0.14 on 2025-05-08 22:12

import django.db.models.deletion
import pgtrigger.compiler
import pgtrigger.migrations
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('registration', '0111_add_non_regulated_naics_codes'),
        ('reporting', '0097_reportsignoff_acknowledgement_of_certification_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='ReportElectricityImportData',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(blank=True, null=True)),
                ('updated_at', models.DateTimeField(blank=True, null=True)),
                ('archived_at', models.DateTimeField(blank=True, null=True)),
                (
                    'import_specified_electricity',
                    models.FloatField(
                        blank=True, db_comment='Amount of imported electricity - specified sources', null=True
                    ),
                ),
                (
                    'import_specified_emissions',
                    models.FloatField(blank=True, db_comment='Emissions from specified imports', null=True),
                ),
                (
                    'import_unspecified_electricity',
                    models.FloatField(
                        blank=True, db_comment='Amount of imported electricity - unspecified sources', null=True
                    ),
                ),
                (
                    'import_unspecified_emissions',
                    models.FloatField(blank=True, db_comment='Emissions from unspecified imports', null=True),
                ),
                (
                    'export_specified_electricity',
                    models.FloatField(
                        blank=True, db_comment='Amount of exported electricity - specified sources', null=True
                    ),
                ),
                (
                    'export_specified_emissions',
                    models.FloatField(blank=True, db_comment='Emissions from specified exports', null=True),
                ),
                (
                    'export_unspecified_electricity',
                    models.FloatField(
                        blank=True, db_comment='Amount of exported electricity - unspecified sources', null=True
                    ),
                ),
                (
                    'export_unspecified_emissions',
                    models.FloatField(blank=True, db_comment='Emissions from unspecified exports', null=True),
                ),
                (
                    'canadian_entitlement_electricity',
                    models.FloatField(
                        blank=True,
                        db_comment='Amount of electricity categorized as Canadian Entitlement Power',
                        null=True,
                    ),
                ),
                (
                    'canadian_entitlement_emissions',
                    models.FloatField(blank=True, db_comment='Emissions from Canadian Entitlement Power', null=True),
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
                        db_comment='The associated report version for this electricity import data',
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='report_electricity_import_data',
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
                'db_table': 'erc"."report_electricity_import_data',
                'db_table_comment': 'Table storing Electricity Import Data for the reporting system',
                'abstract': False,
            },
        ),
        migrations.AddConstraint(
            model_name='reportelectricityimportdata',
            constraint=models.UniqueConstraint(
                fields=('report_version',), name='unique_electricity_import_data_per_report_version'
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name='reportelectricityimportdata',
            trigger=pgtrigger.compiler.Trigger(
                name='set_created_audit_columns',
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="new.created_by_id = (select current_setting('my.guid', true)); new.created_at = now(); return new;",
                    hash='e9f2a41979798a95d88fc7aa374ac388e9403406',
                    operation='INSERT',
                    pgid='pgtrigger_set_created_audit_columns_c0dc8',
                    table='erc"."report_electricity_import_data',
                    when='BEFORE',
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name='reportelectricityimportdata',
            trigger=pgtrigger.compiler.Trigger(
                name='set_updated_audit_columns',
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="new.updated_by_id = (select current_setting('my.guid', true)); new.updated_at = now(); return new;",
                    hash='925817322cf194c01d805b2f11d894dc89ef14d3',
                    operation='UPDATE',
                    pgid='pgtrigger_set_updated_audit_columns_e20a0',
                    table='erc"."report_electricity_import_data',
                    when='BEFORE',
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name='reportelectricityimportdata',
            trigger=pgtrigger.compiler.Trigger(
                name='immutable_report_version',
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func='\n            declare\n                status text;\n            begin\n                select rel1.status into status\n                from "erc"."report_version" rel1\n                join "erc"."report_electricity_import_data" rel2 on rel2.report_version_id=rel1.id\n                where rel2.id=new.id\n                limit 1;\n\n                if status=\'Submitted\' then\n                    raise exception \'reportelectricityimportdata record is immutable after a report version has been submitted\';\n                end if;\n\n                return new;\n            end;\n            ',
                    hash='c08909363a48ed8c379544a5708cb40f70ad1b6d',
                    operation='UPDATE',
                    pgid='pgtrigger_immutable_report_version_bb993',
                    table='erc"."report_electricity_import_data',
                    when='BEFORE',
                ),
            ),
        ),
    ]
