# Generated by Django 5.0.11 on 2025-01-30 18:33

import pgtrigger.compiler
import pgtrigger.migrations
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('reporting', '0045_fix_incorrect_fkey_on_deletes'),
    ]

    operations = [
        migrations.AlterField(
            model_name='facilityreport',
            name='created_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='report',
            name='created_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='reportactivity',
            name='created_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='reportadditionaldata',
            name='created_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='reportattachment',
            name='created_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='reportemission',
            name='created_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='reportfuel',
            name='created_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='reportmethodology',
            name='created_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='reportnewentrant',
            name='created_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='reportnewentrantemission',
            name='created_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='reportnewentrantproduction',
            name='created_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='reportnonattributableemissions',
            name='created_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='reportoperation',
            name='created_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='reportoperationrepresentative',
            name='created_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='reportpersonresponsible',
            name='created_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='reportproduct',
            name='created_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='reportproductemissionallocation',
            name='created_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='reportrawactivitydata',
            name='created_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='reportsourcetype',
            name='created_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='reportunit',
            name='created_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='reportverification',
            name='created_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='reportversion',
            name='created_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name='facilityreport',
            trigger=pgtrigger.compiler.Trigger(
                name='set_created_audit_columns',
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="new.created_by_id = (select current_setting('my.guid')); new.created_at = now(); return new;",
                    hash='871736be169ac5b88d79622674e77bb235845d41',
                    operation='INSERT',
                    pgid='pgtrigger_set_created_audit_columns_7b304',
                    table='erc"."facility_report',
                    when='BEFORE',
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name='facilityreport',
            trigger=pgtrigger.compiler.Trigger(
                name='set_updated_audit_columns',
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="new.updated_by_id = (select current_setting('my.guid')); new.updated_at = now(); return new;",
                    hash='52ca9fe364001bd07ff9020b9e29f7ffb375e076',
                    operation='UPDATE',
                    pgid='pgtrigger_set_updated_audit_columns_67768',
                    table='erc"."facility_report',
                    when='BEFORE',
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name='report',
            trigger=pgtrigger.compiler.Trigger(
                name='set_created_audit_columns',
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="new.created_by_id = (select current_setting('my.guid')); new.created_at = now(); return new;",
                    hash='1c225730e230500837e1cab0541504b4b7356d19',
                    operation='INSERT',
                    pgid='pgtrigger_set_created_audit_columns_719a0',
                    table='erc"."report',
                    when='BEFORE',
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name='report',
            trigger=pgtrigger.compiler.Trigger(
                name='set_updated_audit_columns',
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="new.updated_by_id = (select current_setting('my.guid')); new.updated_at = now(); return new;",
                    hash='8d58a2ecc9c543ce065bf01eca5d308888ff4e6b',
                    operation='UPDATE',
                    pgid='pgtrigger_set_updated_audit_columns_3cc58',
                    table='erc"."report',
                    when='BEFORE',
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name='reportactivity',
            trigger=pgtrigger.compiler.Trigger(
                name='set_created_audit_columns',
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="new.created_by_id = (select current_setting('my.guid')); new.created_at = now(); return new;",
                    hash='00ebb5a6082f09eb2e24a39426488a35288418c3',
                    operation='INSERT',
                    pgid='pgtrigger_set_created_audit_columns_ddefd',
                    table='erc"."report_activity',
                    when='BEFORE',
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name='reportactivity',
            trigger=pgtrigger.compiler.Trigger(
                name='set_updated_audit_columns',
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="new.updated_by_id = (select current_setting('my.guid')); new.updated_at = now(); return new;",
                    hash='880f8bbe628fff2a0e9aa938e1d5a9422818d624',
                    operation='UPDATE',
                    pgid='pgtrigger_set_updated_audit_columns_22281',
                    table='erc"."report_activity',
                    when='BEFORE',
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name='reportadditionaldata',
            trigger=pgtrigger.compiler.Trigger(
                name='set_created_audit_columns',
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="new.created_by_id = (select current_setting('my.guid')); new.created_at = now(); return new;",
                    hash='b5300ca2c647decdf4c5ff967948e777b12982d1',
                    operation='INSERT',
                    pgid='pgtrigger_set_created_audit_columns_85628',
                    table='erc"."report_additional_data',
                    when='BEFORE',
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name='reportadditionaldata',
            trigger=pgtrigger.compiler.Trigger(
                name='set_updated_audit_columns',
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="new.updated_by_id = (select current_setting('my.guid')); new.updated_at = now(); return new;",
                    hash='083cbb58b0d5f22fe8167d7f5a9eac4280b4344f',
                    operation='UPDATE',
                    pgid='pgtrigger_set_updated_audit_columns_10b60',
                    table='erc"."report_additional_data',
                    when='BEFORE',
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name='reportattachment',
            trigger=pgtrigger.compiler.Trigger(
                name='set_created_audit_columns',
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="new.created_by_id = (select current_setting('my.guid')); new.created_at = now(); return new;",
                    hash='1dd4f6fb147a6ecfaf7379cfda98e36fd269985c',
                    operation='INSERT',
                    pgid='pgtrigger_set_created_audit_columns_3fe9c',
                    table='erc"."report_attachment',
                    when='BEFORE',
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name='reportattachment',
            trigger=pgtrigger.compiler.Trigger(
                name='set_updated_audit_columns',
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="new.updated_by_id = (select current_setting('my.guid')); new.updated_at = now(); return new;",
                    hash='a8896f32de705794a5cf4aa31a6031e9108e5ce2',
                    operation='UPDATE',
                    pgid='pgtrigger_set_updated_audit_columns_9dd54',
                    table='erc"."report_attachment',
                    when='BEFORE',
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name='reportemission',
            trigger=pgtrigger.compiler.Trigger(
                name='set_created_audit_columns',
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="new.created_by_id = (select current_setting('my.guid')); new.created_at = now(); return new;",
                    hash='92ea55e776bce9d7fc8cff12bbf35ff61fc840cb',
                    operation='INSERT',
                    pgid='pgtrigger_set_created_audit_columns_0552c',
                    table='erc"."report_emission',
                    when='BEFORE',
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name='reportemission',
            trigger=pgtrigger.compiler.Trigger(
                name='set_updated_audit_columns',
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="new.updated_by_id = (select current_setting('my.guid')); new.updated_at = now(); return new;",
                    hash='00bce8a7401b0a4b65db514e894763666a1aee10',
                    operation='UPDATE',
                    pgid='pgtrigger_set_updated_audit_columns_c1837',
                    table='erc"."report_emission',
                    when='BEFORE',
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name='reportfuel',
            trigger=pgtrigger.compiler.Trigger(
                name='set_created_audit_columns',
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="new.created_by_id = (select current_setting('my.guid')); new.created_at = now(); return new;",
                    hash='1ec7412e7ffc065fe2d878e2694bc191b5df0df0',
                    operation='INSERT',
                    pgid='pgtrigger_set_created_audit_columns_bb5a6',
                    table='erc"."report_fuel',
                    when='BEFORE',
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name='reportfuel',
            trigger=pgtrigger.compiler.Trigger(
                name='set_updated_audit_columns',
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="new.updated_by_id = (select current_setting('my.guid')); new.updated_at = now(); return new;",
                    hash='feee918c48f827f218341f9c948f21d86cdca6bc',
                    operation='UPDATE',
                    pgid='pgtrigger_set_updated_audit_columns_6b999',
                    table='erc"."report_fuel',
                    when='BEFORE',
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name='reportmethodology',
            trigger=pgtrigger.compiler.Trigger(
                name='set_created_audit_columns',
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="new.created_by_id = (select current_setting('my.guid')); new.created_at = now(); return new;",
                    hash='00acdcb3a18ee8160203b92756577edfabfb7b9e',
                    operation='INSERT',
                    pgid='pgtrigger_set_created_audit_columns_020b7',
                    table='erc"."report_methodology',
                    when='BEFORE',
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name='reportmethodology',
            trigger=pgtrigger.compiler.Trigger(
                name='set_updated_audit_columns',
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="new.updated_by_id = (select current_setting('my.guid')); new.updated_at = now(); return new;",
                    hash='ff483c8e4b42cea8f6acc49d1eebbfd3fee244b3',
                    operation='UPDATE',
                    pgid='pgtrigger_set_updated_audit_columns_6959b',
                    table='erc"."report_methodology',
                    when='BEFORE',
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name='reportnewentrant',
            trigger=pgtrigger.compiler.Trigger(
                name='set_created_audit_columns',
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="new.created_by_id = (select current_setting('my.guid')); new.created_at = now(); return new;",
                    hash='7eccb6f772f08513fa76e19856058c5d9d1a339f',
                    operation='INSERT',
                    pgid='pgtrigger_set_created_audit_columns_f6aed',
                    table='erc"."report_new_entrant',
                    when='BEFORE',
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name='reportnewentrant',
            trigger=pgtrigger.compiler.Trigger(
                name='set_updated_audit_columns',
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="new.updated_by_id = (select current_setting('my.guid')); new.updated_at = now(); return new;",
                    hash='4ecf67a6ea5141960e4b84a50cc11c3e8e28b4ab',
                    operation='UPDATE',
                    pgid='pgtrigger_set_updated_audit_columns_fc227',
                    table='erc"."report_new_entrant',
                    when='BEFORE',
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name='reportnewentrantemission',
            trigger=pgtrigger.compiler.Trigger(
                name='set_created_audit_columns',
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="new.created_by_id = (select current_setting('my.guid')); new.created_at = now(); return new;",
                    hash='9254b7799745e96cfbc2ddf000094f767490905f',
                    operation='INSERT',
                    pgid='pgtrigger_set_created_audit_columns_a978a',
                    table='erc"."report_new_entrant_emission',
                    when='BEFORE',
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name='reportnewentrantemission',
            trigger=pgtrigger.compiler.Trigger(
                name='set_updated_audit_columns',
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="new.updated_by_id = (select current_setting('my.guid')); new.updated_at = now(); return new;",
                    hash='3a50a678ace0a9a64182fc2e62bb13260476c390',
                    operation='UPDATE',
                    pgid='pgtrigger_set_updated_audit_columns_ab4eb',
                    table='erc"."report_new_entrant_emission',
                    when='BEFORE',
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name='reportnewentrantproduction',
            trigger=pgtrigger.compiler.Trigger(
                name='set_created_audit_columns',
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="new.created_by_id = (select current_setting('my.guid')); new.created_at = now(); return new;",
                    hash='92dd82db5aff75258af9c9ee726f328b93bfb41a',
                    operation='INSERT',
                    pgid='pgtrigger_set_created_audit_columns_aa0ab',
                    table='erc"."report_new_entrant_production',
                    when='BEFORE',
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name='reportnewentrantproduction',
            trigger=pgtrigger.compiler.Trigger(
                name='set_updated_audit_columns',
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="new.updated_by_id = (select current_setting('my.guid')); new.updated_at = now(); return new;",
                    hash='d4d6550a9bb3c04ef9b8d631f598ff49c2c85c8b',
                    operation='UPDATE',
                    pgid='pgtrigger_set_updated_audit_columns_ff985',
                    table='erc"."report_new_entrant_production',
                    when='BEFORE',
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name='reportnonattributableemissions',
            trigger=pgtrigger.compiler.Trigger(
                name='set_created_audit_columns',
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="new.created_by_id = (select current_setting('my.guid')); new.created_at = now(); return new;",
                    hash='35890c16ebad85d767f768a23d8b0bd7bd6f3a3e',
                    operation='INSERT',
                    pgid='pgtrigger_set_created_audit_columns_c7ef0',
                    table='erc"."report_non_attributable_emissions',
                    when='BEFORE',
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name='reportnonattributableemissions',
            trigger=pgtrigger.compiler.Trigger(
                name='set_updated_audit_columns',
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="new.updated_by_id = (select current_setting('my.guid')); new.updated_at = now(); return new;",
                    hash='5aa2de777030c8bd44dbe01935d0463df09dd189',
                    operation='UPDATE',
                    pgid='pgtrigger_set_updated_audit_columns_11efc',
                    table='erc"."report_non_attributable_emissions',
                    when='BEFORE',
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name='reportoperation',
            trigger=pgtrigger.compiler.Trigger(
                name='set_created_audit_columns',
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="new.created_by_id = (select current_setting('my.guid')); new.created_at = now(); return new;",
                    hash='3f9716ed3e866653306f77a4532eb597389540df',
                    operation='INSERT',
                    pgid='pgtrigger_set_created_audit_columns_ae61c',
                    table='erc"."report_operation',
                    when='BEFORE',
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name='reportoperation',
            trigger=pgtrigger.compiler.Trigger(
                name='set_updated_audit_columns',
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="new.updated_by_id = (select current_setting('my.guid')); new.updated_at = now(); return new;",
                    hash='97a4280c1ce6c97e3d6b773c353baceb8bafe6b2',
                    operation='UPDATE',
                    pgid='pgtrigger_set_updated_audit_columns_862a3',
                    table='erc"."report_operation',
                    when='BEFORE',
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name='reportoperationrepresentative',
            trigger=pgtrigger.compiler.Trigger(
                name='set_created_audit_columns',
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="new.created_by_id = (select current_setting('my.guid')); new.created_at = now(); return new;",
                    hash='09ab00dcf4c849adbd706bea139a3f5cd9d8ad8b',
                    operation='INSERT',
                    pgid='pgtrigger_set_created_audit_columns_4937c',
                    table='erc"."report_operation_representative',
                    when='BEFORE',
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name='reportoperationrepresentative',
            trigger=pgtrigger.compiler.Trigger(
                name='set_updated_audit_columns',
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="new.updated_by_id = (select current_setting('my.guid')); new.updated_at = now(); return new;",
                    hash='ce98e60be223c409b2e213b88e14f0a36cbcbe41',
                    operation='UPDATE',
                    pgid='pgtrigger_set_updated_audit_columns_a3e01',
                    table='erc"."report_operation_representative',
                    when='BEFORE',
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name='reportpersonresponsible',
            trigger=pgtrigger.compiler.Trigger(
                name='set_created_audit_columns',
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="new.created_by_id = (select current_setting('my.guid')); new.created_at = now(); return new;",
                    hash='c1a19f3fcafd20f9d447c0c275f95e749303c0a1',
                    operation='INSERT',
                    pgid='pgtrigger_set_created_audit_columns_a62b6',
                    table='erc"."report_person_responsible',
                    when='BEFORE',
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name='reportpersonresponsible',
            trigger=pgtrigger.compiler.Trigger(
                name='set_updated_audit_columns',
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="new.updated_by_id = (select current_setting('my.guid')); new.updated_at = now(); return new;",
                    hash='51e484473dfd7604572be03757d3a8a023c0ba37',
                    operation='UPDATE',
                    pgid='pgtrigger_set_updated_audit_columns_515b7',
                    table='erc"."report_person_responsible',
                    when='BEFORE',
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name='reportproduct',
            trigger=pgtrigger.compiler.Trigger(
                name='set_created_audit_columns',
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="new.created_by_id = (select current_setting('my.guid')); new.created_at = now(); return new;",
                    hash='90b54411f47a080d68e0aa664116ee942c47f0fd',
                    operation='INSERT',
                    pgid='pgtrigger_set_created_audit_columns_a6558',
                    table='erc"."report_product',
                    when='BEFORE',
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name='reportproduct',
            trigger=pgtrigger.compiler.Trigger(
                name='set_updated_audit_columns',
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="new.updated_by_id = (select current_setting('my.guid')); new.updated_at = now(); return new;",
                    hash='18d063d4acf473540c032a4e32a069ebab8d55dc',
                    operation='UPDATE',
                    pgid='pgtrigger_set_updated_audit_columns_18233',
                    table='erc"."report_product',
                    when='BEFORE',
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name='reportproductemissionallocation',
            trigger=pgtrigger.compiler.Trigger(
                name='set_created_audit_columns',
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="new.created_by_id = (select current_setting('my.guid')); new.created_at = now(); return new;",
                    hash='ad6fdfbdb428321f54f2528c4094ea5b8efde94b',
                    operation='INSERT',
                    pgid='pgtrigger_set_created_audit_columns_2fe85',
                    table='erc"."report_product_emission_allocation',
                    when='BEFORE',
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name='reportproductemissionallocation',
            trigger=pgtrigger.compiler.Trigger(
                name='set_updated_audit_columns',
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="new.updated_by_id = (select current_setting('my.guid')); new.updated_at = now(); return new;",
                    hash='0025a9dfdfcdc659795241547119d4741f170b29',
                    operation='UPDATE',
                    pgid='pgtrigger_set_updated_audit_columns_24d17',
                    table='erc"."report_product_emission_allocation',
                    when='BEFORE',
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name='reportrawactivitydata',
            trigger=pgtrigger.compiler.Trigger(
                name='set_created_audit_columns',
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="new.created_by_id = (select current_setting('my.guid')); new.created_at = now(); return new;",
                    hash='7616388f0abe9ba076c18def7ecaba322efd4f60',
                    operation='INSERT',
                    pgid='pgtrigger_set_created_audit_columns_50c5e',
                    table='erc"."report_raw_activity_data',
                    when='BEFORE',
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name='reportrawactivitydata',
            trigger=pgtrigger.compiler.Trigger(
                name='set_updated_audit_columns',
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="new.updated_by_id = (select current_setting('my.guid')); new.updated_at = now(); return new;",
                    hash='24a8642b60ca9b578179507a263a310de8838ade',
                    operation='UPDATE',
                    pgid='pgtrigger_set_updated_audit_columns_24ebd',
                    table='erc"."report_raw_activity_data',
                    when='BEFORE',
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name='reportsourcetype',
            trigger=pgtrigger.compiler.Trigger(
                name='set_created_audit_columns',
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="new.created_by_id = (select current_setting('my.guid')); new.created_at = now(); return new;",
                    hash='231e8a930c79a69d660a8850f166077242d66ee3',
                    operation='INSERT',
                    pgid='pgtrigger_set_created_audit_columns_79d6a',
                    table='erc"."report_source_type',
                    when='BEFORE',
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name='reportsourcetype',
            trigger=pgtrigger.compiler.Trigger(
                name='set_updated_audit_columns',
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="new.updated_by_id = (select current_setting('my.guid')); new.updated_at = now(); return new;",
                    hash='d3c3b14341e7d72312c47bd815f62333f557c109',
                    operation='UPDATE',
                    pgid='pgtrigger_set_updated_audit_columns_679f1',
                    table='erc"."report_source_type',
                    when='BEFORE',
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name='reportunit',
            trigger=pgtrigger.compiler.Trigger(
                name='set_created_audit_columns',
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="new.created_by_id = (select current_setting('my.guid')); new.created_at = now(); return new;",
                    hash='ad7b4a501dabb42690d062f6c7b46d86f30b058f',
                    operation='INSERT',
                    pgid='pgtrigger_set_created_audit_columns_a01dd',
                    table='erc"."report_unit',
                    when='BEFORE',
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name='reportunit',
            trigger=pgtrigger.compiler.Trigger(
                name='set_updated_audit_columns',
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="new.updated_by_id = (select current_setting('my.guid')); new.updated_at = now(); return new;",
                    hash='8eccf86fbebb1c8ae04eb8dd7af60119519be993',
                    operation='UPDATE',
                    pgid='pgtrigger_set_updated_audit_columns_09472',
                    table='erc"."report_unit',
                    when='BEFORE',
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name='reportverification',
            trigger=pgtrigger.compiler.Trigger(
                name='set_created_audit_columns',
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="new.created_by_id = (select current_setting('my.guid')); new.created_at = now(); return new;",
                    hash='0ca85a9f90eb563e0cbae9b7aaa138a0a9857a23',
                    operation='INSERT',
                    pgid='pgtrigger_set_created_audit_columns_90770',
                    table='erc"."report_verification',
                    when='BEFORE',
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name='reportverification',
            trigger=pgtrigger.compiler.Trigger(
                name='set_updated_audit_columns',
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="new.updated_by_id = (select current_setting('my.guid')); new.updated_at = now(); return new;",
                    hash='9bc68f8077a5a10010e62d15e61f68ca48e85124',
                    operation='UPDATE',
                    pgid='pgtrigger_set_updated_audit_columns_71494',
                    table='erc"."report_verification',
                    when='BEFORE',
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name='reportversion',
            trigger=pgtrigger.compiler.Trigger(
                name='set_created_audit_columns',
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="new.created_by_id = (select current_setting('my.guid')); new.created_at = now(); return new;",
                    hash='701833bb09dd09e3b77c14adc96490a6f98f5fba',
                    operation='INSERT',
                    pgid='pgtrigger_set_created_audit_columns_230a7',
                    table='erc"."report_version',
                    when='BEFORE',
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name='reportversion',
            trigger=pgtrigger.compiler.Trigger(
                name='set_updated_audit_columns',
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="new.updated_by_id = (select current_setting('my.guid')); new.updated_at = now(); return new;",
                    hash='f3aa36da7b7f132545a1ae71e24c99eb9ee0ed31',
                    operation='UPDATE',
                    pgid='pgtrigger_set_updated_audit_columns_7c7e1',
                    table='erc"."report_version',
                    when='BEFORE',
                ),
            ),
        ),
    ]
