# Generated by Django 5.0.13 on 2025-03-19 23:50

import pgtrigger.compiler
import pgtrigger.migrations
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('registration', '0094_V2_0_1'),
    ]

    operations = [
        pgtrigger.migrations.AddTrigger(
            model_name='address',
            trigger=pgtrigger.compiler.Trigger(
                name='protect_fields_empty_update',
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="\n                    if exists (\n                        select 1\n                        from erc.contact\n                        where address_id = new.id\n                          and business_role_id = 'Operation Representative'\n                    )\n                    and (new.street_address is null or new.street_address = ''\n                         or new.municipality is null or new.municipality = ''\n                         or new.province is null or new.province = ''\n                         or new.postal_code is null or new.postal_code = '')\n                    then\n                        raise exception 'Cannot set address fields to empty or NULL when associated with an Operation Representative';\n                    end if;\n                    return new;\n                ",
                    hash='6d2135635fa387a04db13d50ce6881053274ec32',
                    operation='UPDATE',
                    pgid='pgtrigger_protect_fields_empty_update_f0214',
                    table='erc"."address',
                    when='BEFORE',
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name='contact',
            trigger=pgtrigger.compiler.Trigger(
                name='protect_address_null_update',
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    condition='WHEN (NEW."address_id" IS NULL AND OLD."address_id" IS NOT NULL)',
                    func="\n                    if new.business_role_id = 'Operation Representative'\n                    then\n                        raise exception 'Cannot set address to NULL for a contact with role Operation Representative';\n                    end if;\n                    return new;\n                ",
                    hash='f9c9645df97379b138549d0e9c0e340ebceb0418',
                    operation='UPDATE',
                    pgid='pgtrigger_protect_address_null_update_b9eea',
                    table='erc"."contact',
                    when='BEFORE',
                ),
            ),
        ),
    ]
