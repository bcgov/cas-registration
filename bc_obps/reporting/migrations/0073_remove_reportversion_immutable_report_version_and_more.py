# Generated by Django 5.0.13 on 2025-03-14 19:03

import pgtrigger.compiler
import pgtrigger.migrations
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('reporting', '0072_alter_reportverification_scope_of_verification_and_more'),
    ]

    operations = [
        pgtrigger.migrations.RemoveTrigger(
            model_name='reportversion',
            name='immutable_report_version',
        ),
        pgtrigger.migrations.AddTrigger(
            model_name='reportversion',
            trigger=pgtrigger.compiler.Trigger(
                name='immutable_report_version',
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    condition='WHEN (OLD."status" = \'Submitted\' AND NOT (NOT NEW."is_latest_submitted" AND NEW."status" = \'Submitted\' AND OLD."is_latest_submitted"))',
                    func="RAISE EXCEPTION 'pgtrigger: Cannot update rows from % table', TG_TABLE_NAME;",
                    hash='56ca2c53d023b38348f5a66bf62053b541234287',
                    operation='UPDATE',
                    pgid='pgtrigger_immutable_report_version_cb563',
                    table='erc"."report_version',
                    when='BEFORE',
                ),
            ),
        ),
    ]
