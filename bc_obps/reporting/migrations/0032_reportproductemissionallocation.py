# Generated by Django 5.0.8 on 2024-11-25 14:57

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('registration', '0056_remove_historicaltransferevent_future_designated_operator_and_more'),
        ('reporting', '0031_alter_reportemission_managers'),
    ]

    operations = [
        migrations.CreateModel(
            name='ReportProductEmissionAllocation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True, null=True)),
                ('updated_at', models.DateTimeField(blank=True, null=True)),
                ('archived_at', models.DateTimeField(blank=True, null=True)),
                (
                    'allocated_quantity',
                    models.DecimalField(
                        db_comment='The quantity of emissions allocated to this product in tonnes of CO2 equivalent(tCO2e)',
                        decimal_places=4,
                        max_digits=10,
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
                        db_comment='The emission category that this emission data belongs to',
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name='+',
                        to='reporting.emissioncategory',
                    ),
                ),
                (
                    'report_product',
                    models.ForeignKey(
                        db_comment='The regulated product this emission data has been allocated to',
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name='+',
                        to='reporting.reportproduct',
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
                'db_table': 'erc"."report_product_emission_allocation',
                'db_table_comment': 'A table to store the allocated ammount of emissions for a given product',
            },
        ),
    ]
