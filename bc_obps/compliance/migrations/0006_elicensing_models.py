# Generated by Django 5.0.14 on 2025-06-12 23:09

import django.db.models.deletion
import pgtrigger.compiler
import pgtrigger.migrations
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('compliance', '0005_complianceearnedcredit_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='ElicensingClientOperator',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(blank=True, null=True)),
                ('updated_at', models.DateTimeField(blank=True, null=True)),
                ('archived_at', models.DateTimeField(blank=True, null=True)),
                (
                    'client_object_id',
                    models.IntegerField(
                        db_comment='The clientObjectId identifier from elicensing for the related client'
                    ),
                ),
                (
                    'client_guid',
                    models.UUIDField(db_comment='The clientGuid identifier from elicensing for the related client'),
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
                    'operator',
                    models.ForeignKey(
                        db_comment='Foreign key to the BCIERS operator object for this record',
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name='+',
                        to='registration.operator',
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
                'db_table': 'erc"."elicensing_client_operator',
                'db_table_comment': 'A table to define the relationship between a BCIERS Operator record and the corresponding client record in elicensing',
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='ElicensingInvoice',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(blank=True, null=True)),
                ('updated_at', models.DateTimeField(blank=True, null=True)),
                ('archived_at', models.DateTimeField(blank=True, null=True)),
                ('invoice_number', models.CharField(db_comment='The invoice number from elicensing.')),
                (
                    'due_date',
                    models.DateTimeField(db_comment='The due date of the invoice. invoicePaymentDueDate in elicensing'),
                ),
                (
                    'outstanding_balance',
                    models.DecimalField(
                        db_comment='The outstanding balance for this invoice. invoiceOutstandingBalance in elicensing',
                        decimal_places=2,
                        max_digits=20,
                    ),
                ),
                (
                    'invoice_fee_balance',
                    models.DecimalField(
                        db_comment='The balance of fees for this invoice. invoiceFeeBalance in elicensing',
                        decimal_places=2,
                        max_digits=20,
                        null=True,
                    ),
                ),
                (
                    'invoice_interest_balance',
                    models.DecimalField(
                        db_comment='The balance of interest for this invoice. invoiceInterestBalance in elicensing',
                        decimal_places=2,
                        max_digits=20,
                        null=True,
                    ),
                ),
                (
                    'is_void',
                    models.BooleanField(
                        db_comment='Boolean field indicates whether this invoice has been voided', default=False
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
                    'elicensing_client_operator',
                    models.ForeignKey(
                        db_comment='Foreign key to the elicensing_client_operator record for the client who this invoice is for',
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='elicensing_invoices',
                        to='compliance.elicensingclientoperator',
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
                'db_table': 'erc"."elicensing_invoice',
                'db_table_comment': 'Table contains invoice data from elicensing',
                'abstract': False,
            },
        ),
        migrations.AddField(
            model_name='complianceobligation',
            name='elicensing_invoice',
            field=models.OneToOneField(
                blank=True,
                db_comment='Foreign key to the elicensing_invoice in the OBPS data. The data in the elicensing_invoice table comes from elicensing',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='compliance_obligation',
                to='compliance.elicensinginvoice',
            ),
        ),
        migrations.AddField(
            model_name='historicalcomplianceobligation',
            name='elicensing_invoice',
            field=models.ForeignKey(
                blank=True,
                db_comment='Foreign key to the elicensing_invoice in the OBPS data. The data in the elicensing_invoice table comes from elicensing',
                db_constraint=False,
                null=True,
                on_delete=django.db.models.deletion.DO_NOTHING,
                related_name='+',
                to='compliance.elicensinginvoice',
            ),
        ),
        migrations.CreateModel(
            name='ElicensingLineItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(blank=True, null=True)),
                ('updated_at', models.DateTimeField(blank=True, null=True)),
                ('archived_at', models.DateTimeField(blank=True, null=True)),
                ('object_id', models.IntegerField(db_comment='The objectId of the line item from elicensing')),
                ('guid', models.UUIDField(db_comment='The guid of the line item from elicensing')),
                (
                    'line_item_type',
                    models.CharField(
                        choices=[('Fee', 'Fee')], db_comment='The type of line item from elicensing.', default='Fee'
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
                    'elicensing_invoice',
                    models.ForeignKey(
                        db_comment='Foreign key to the OBPS elicensing_invoice table.',
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='elicensing_line_items',
                        to='compliance.elicensinginvoice',
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
                'db_table': 'erc"."elicensing_line_item',
                'db_table_comment': 'Table contains line item data on an invoice from elicensing',
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='ElicensingAdjustment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(blank=True, null=True)),
                ('updated_at', models.DateTimeField(blank=True, null=True)),
                ('archived_at', models.DateTimeField(blank=True, null=True)),
                (
                    'adjustment_object_id',
                    models.IntegerField(
                        db_comment='The object id of the adjustment in elicensing (adjustmentObjectId)'
                    ),
                ),
                (
                    'amount',
                    models.DecimalField(
                        db_comment='The amount of this adjustment in dollars from elicensing',
                        decimal_places=2,
                        max_digits=20,
                    ),
                ),
                (
                    'adjustment_date',
                    models.DateTimeField(blank=True, db_comment='date of the adjustment in elicensing', null=True),
                ),
                ('reason', models.CharField(blank=True, db_comment='Reason for adjustment in elicesning', null=True)),
                ('type', models.CharField(blank=True, db_comment='Type of adjustment in elicesning', null=True)),
                ('comment', models.CharField(blank=True, db_comment='Comments on adjustment in elicesning', null=True)),
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
                    'elicensing_line_item',
                    models.ForeignKey(
                        db_comment='Foreign key to the line item record this adjustment relates to',
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='elicensing_adjustments',
                        to='compliance.elicensinglineitem',
                    ),
                ),
            ],
            options={
                'db_table': 'erc"."elicensing_adjustment',
                'db_table_comment': 'Table contains adjustment data from elicensing',
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='ElicensingPayment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(blank=True, null=True)),
                ('updated_at', models.DateTimeField(blank=True, null=True)),
                ('archived_at', models.DateTimeField(blank=True, null=True)),
                (
                    'payment_object_id',
                    models.IntegerField(db_comment='The object id of the payment in elicensing (paymentObjectId)'),
                ),
                (
                    'amount',
                    models.DecimalField(
                        db_comment='The amount of this payment in dollars from elicensing',
                        decimal_places=2,
                        max_digits=20,
                    ),
                ),
                (
                    'received_date',
                    models.DateTimeField(
                        blank=True,
                        db_comment='receivedDate of the payment in elicensing. The date when payment is received in the OBPS bank account. Receive Date can be backdated. This is the date that impacts interest calculation.',
                        null=True,
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
                    'elicensing_line_item',
                    models.ForeignKey(
                        db_comment='Foreign key to the line item record this payment relates to',
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='elicensing_payments',
                        to='compliance.elicensinglineitem',
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
                'db_table': 'erc"."elicensing_payment',
                'db_table_comment': 'Table contains payment data from elicensing',
                'abstract': False,
            },
        ),
        pgtrigger.migrations.AddTrigger(
            model_name='elicensingclientoperator',
            trigger=pgtrigger.compiler.Trigger(
                name='set_created_audit_columns',
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="new.created_by_id = (select nullif(current_setting('my.guid', true), '')); new.created_at = now(); return new;",
                    hash='a34dade89074dd60ec8bf7f8354d964dc9a0e266',
                    operation='INSERT',
                    pgid='pgtrigger_set_created_audit_columns_e984e',
                    table='erc"."elicensing_client_operator',
                    when='BEFORE',
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name='elicensingclientoperator',
            trigger=pgtrigger.compiler.Trigger(
                name='set_updated_audit_columns',
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="new.updated_by_id = (select current_setting('my.guid', true)); new.updated_at = now(); return new;",
                    hash='64e34dbc48afd9e8e27b164b3a419fda417e6f71',
                    operation='UPDATE',
                    pgid='pgtrigger_set_updated_audit_columns_8f71f',
                    table='erc"."elicensing_client_operator',
                    when='BEFORE',
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name='elicensinginvoice',
            trigger=pgtrigger.compiler.Trigger(
                name='set_created_audit_columns',
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="new.created_by_id = (select nullif(current_setting('my.guid', true), '')); new.created_at = now(); return new;",
                    hash='d6b8b74ecd79d3325689d7cc2894860fb465e5ec',
                    operation='INSERT',
                    pgid='pgtrigger_set_created_audit_columns_146ba',
                    table='erc"."elicensing_invoice',
                    when='BEFORE',
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name='elicensinginvoice',
            trigger=pgtrigger.compiler.Trigger(
                name='set_updated_audit_columns',
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="new.updated_by_id = (select current_setting('my.guid', true)); new.updated_at = now(); return new;",
                    hash='159f1e2e89dfc40c06ddd01c05c14505196dc25c',
                    operation='UPDATE',
                    pgid='pgtrigger_set_updated_audit_columns_44bcd',
                    table='erc"."elicensing_invoice',
                    when='BEFORE',
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name='elicensinglineitem',
            trigger=pgtrigger.compiler.Trigger(
                name='set_created_audit_columns',
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="new.created_by_id = (select nullif(current_setting('my.guid', true), '')); new.created_at = now(); return new;",
                    hash='3f22eacd4dd131cc15ae66fda162483bf93d22e4',
                    operation='INSERT',
                    pgid='pgtrigger_set_created_audit_columns_58c12',
                    table='erc"."elicensing_line_item',
                    when='BEFORE',
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name='elicensinglineitem',
            trigger=pgtrigger.compiler.Trigger(
                name='set_updated_audit_columns',
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="new.updated_by_id = (select current_setting('my.guid', true)); new.updated_at = now(); return new;",
                    hash='9768c78cf26ac450a3e5321e5f8570fab93547f9',
                    operation='UPDATE',
                    pgid='pgtrigger_set_updated_audit_columns_bee62',
                    table='erc"."elicensing_line_item',
                    when='BEFORE',
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name='elicensingadjustment',
            trigger=pgtrigger.compiler.Trigger(
                name='set_created_audit_columns',
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="new.created_by_id = (select nullif(current_setting('my.guid', true), '')); new.created_at = now(); return new;",
                    hash='4275bd9647ea7c29cbc3b13f75a68dba9264f16b',
                    operation='INSERT',
                    pgid='pgtrigger_set_created_audit_columns_db27e',
                    table='erc"."elicensing_adjustment',
                    when='BEFORE',
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name='elicensingadjustment',
            trigger=pgtrigger.compiler.Trigger(
                name='set_updated_audit_columns',
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="new.updated_by_id = (select current_setting('my.guid', true)); new.updated_at = now(); return new;",
                    hash='f96787a1834507f342eb0a8c31f41d09c4f80a01',
                    operation='UPDATE',
                    pgid='pgtrigger_set_updated_audit_columns_1ec3b',
                    table='erc"."elicensing_adjustment',
                    when='BEFORE',
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name='elicensingpayment',
            trigger=pgtrigger.compiler.Trigger(
                name='set_created_audit_columns',
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="new.created_by_id = (select nullif(current_setting('my.guid', true), '')); new.created_at = now(); return new;",
                    hash='b5c8314fbd0014f4f51cb5b4617ebc247bd0aeaf',
                    operation='INSERT',
                    pgid='pgtrigger_set_created_audit_columns_933cb',
                    table='erc"."elicensing_payment',
                    when='BEFORE',
                ),
            ),
        ),
        pgtrigger.migrations.AddTrigger(
            model_name='elicensingpayment',
            trigger=pgtrigger.compiler.Trigger(
                name='set_updated_audit_columns',
                sql=pgtrigger.compiler.UpsertTriggerSql(
                    func="new.updated_by_id = (select current_setting('my.guid', true)); new.updated_at = now(); return new;",
                    hash='f930baef7cb3bb4ec485ed541a58b2b04849e432',
                    operation='UPDATE',
                    pgid='pgtrigger_set_updated_audit_columns_26ab3',
                    table='erc"."elicensing_payment',
                    when='BEFORE',
                ),
            ),
        ),
    ]
