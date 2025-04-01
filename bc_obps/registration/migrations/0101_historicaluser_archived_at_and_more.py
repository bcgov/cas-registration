# Generated by Django 5.0.13 on 2025-04-01 21:36

import django.db.models.deletion
import pgtrigger.compiler
import pgtrigger.migrations
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('registration', '0100_address_protect_fields_empty_update_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='historicaluser',
            name='archived_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='historicaluser',
            name='archived_by',
            field=models.ForeignKey(
                blank=True,
                db_constraint=False,
                null=True,
                on_delete=django.db.models.deletion.DO_NOTHING,
                related_name='+',
                to='registration.user',
            ),
        ),
        migrations.AddField(
            model_name='historicaluser',
            name='created_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='historicaluser',
            name='created_by',
            field=models.ForeignKey(
                blank=True,
                db_constraint=False,
                null=True,
                on_delete=django.db.models.deletion.DO_NOTHING,
                related_name='+',
                to='registration.user',
            ),
        ),
        migrations.AddField(
            model_name='historicaluser',
            name='updated_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='historicaluser',
            name='updated_by',
            field=models.ForeignKey(
                blank=True,
                db_constraint=False,
                null=True,
                on_delete=django.db.models.deletion.DO_NOTHING,
                related_name='+',
                to='registration.user',
            ),
        ),
        migrations.AddField(
            model_name='user',
            name='archived_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='user',
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
            model_name='user',
            name='created_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='user',
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
            model_name='user',
            name='updated_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='user',
            name='updated_by',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='%(class)s_updated',
                to='registration.user',
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name='user',
            trigger=pgtrigger.compiler.Trigger(
                name='set_created_audit_columns',
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="new.created_by_id = (select current_setting('my.guid', true)); new.created_at = now(); return new;",
                    hash='6e449dfbc592f0b57b27cf9035cd469dcf86e78c',
                    operation='INSERT',
                    pgid='pgtrigger_set_created_audit_columns_cc12d',
                    table='erc"."user',
                    when='BEFORE',
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name='user',
            trigger=pgtrigger.compiler.Trigger(
                name='set_updated_audit_columns',
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="new.updated_by_id = (select current_setting('my.guid', true)); new.updated_at = now(); return new;",
                    hash='438138fc551f92e70ffbdec1181e39b3766951fc',
                    operation='UPDATE',
                    pgid='pgtrigger_set_updated_audit_columns_66179',
                    table='erc"."user',
                    when='BEFORE',
                ),
            ),
        ),
    ]
