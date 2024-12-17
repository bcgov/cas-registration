# Generated by Django 5.0.9 on 2024-12-16 19:48

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('registration', '0063_remove_historicaltransferevent_description_and_more'),
        ('reporting', '0040_alter_reportproductemissionallocation_allocated_quantity'),
    ]

    operations = [
        migrations.CreateModel(
            name='ReportNewEntrant',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True, null=True)),
                ('updated_at', models.DateTimeField(blank=True, null=True)),
                ('archived_at', models.DateTimeField(blank=True, null=True)),
                ('authorization_date', models.DateTimeField(db_comment='Date of authorization for emission reporting')),
                (
                    'first_shipment_date',
                    models.DateTimeField(
                        db_comment='Date of the first shipment related to this report (if applicable)'
                    ),
                ),
                (
                    'new_entrant_period_start',
                    models.DateTimeField(db_comment='Start date of the new entrant reporting period'),
                ),
                (
                    'assertion_statement',
                    models.BooleanField(db_comment='Indicates if the assertion statement is certified'),
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
                        db_comment='The associated report version for this new entrant record',
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='report_new_entrant',
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
                'db_table': 'erc"."report_new_entrant',
                'db_table_comment': 'Table storing new entrant emissions data for the reporting system',
            },
        ),
        migrations.CreateModel(
            name='ReportNewEntrantEmission',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True, null=True)),
                ('updated_at', models.DateTimeField(blank=True, null=True)),
                ('archived_at', models.DateTimeField(blank=True, null=True)),
                (
                    'emission',
                    models.DecimalField(
                        blank=True,
                        db_comment='The amount of production associated with this report',
                        decimal_places=4,
                        max_digits=20,
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
                    'emission_category',
                    models.ForeignKey(
                        db_comment='The emission category',
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name='report_new_entrant_emission',
                        to='reporting.emissioncategory',
                    ),
                ),
                (
                    'report_new_entrant',
                    models.ForeignKey(
                        db_comment='The new entrant report to which this production record belongs',
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='report_new_entrant_emission',
                        to='reporting.reportnewentrant',
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
                'db_table': 'erc"."report_new_entrant_emission',
                'db_table_comment': 'Table for storing emission data related to new entrant',
            },
        ),
        migrations.CreateModel(
            name='ReportNewEntrantProduction',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True, null=True)),
                ('updated_at', models.DateTimeField(blank=True, null=True)),
                ('archived_at', models.DateTimeField(blank=True, null=True)),
                (
                    'production_amount',
                    models.DecimalField(
                        blank=True,
                        db_comment='The amount of production associated with this report',
                        decimal_places=4,
                        max_digits=20,
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
                    'product',
                    models.ForeignKey(
                        db_comment='The regulated product associated with this production record',
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name='new_entrant_productions',
                        to='registration.regulatedproduct',
                    ),
                ),
                (
                    'report_new_entrant',
                    models.ForeignKey(
                        db_comment='The new entrant report to which this production record belongs',
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='productions',
                        to='reporting.reportnewentrant',
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
                'db_table': 'erc"."report_new_entrant_production',
                'db_table_comment': 'Table for storing production data related to new entrant emissions reporting',
            },
        ),
        migrations.AddConstraint(
            model_name='reportnewentrantemission',
            constraint=models.UniqueConstraint(
                fields=('report_new_entrant', 'emission_category'),
                name='unique_new_entrant_emissions',
                violation_error_code='A report new entrant emission already exists for this emission category',
            ),
        ),
        migrations.AddConstraint(
            model_name='reportnewentrantproduction',
            constraint=models.UniqueConstraint(
                fields=('product', 'report_new_entrant'),
                name='unique_new_entrant_production',
                violation_error_code='A production record with this product and new entrant report already exists.',
            ),
        ),
    ]
