# Generated by Django 5.0.9 on 2024-11-05 01:06

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('registration', '0051_bcgreenhousegasid_historicalbcgreenhousegasid'),
        ('reporting', '0029_remove_facilityreport_products_reportproduct_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='ReportNonAttributableEmissions',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True, null=True)),
                ('updated_at', models.DateTimeField(blank=True, null=True)),
                ('archived_at', models.DateTimeField(blank=True, null=True)),
                ('activity', models.CharField(db_comment='The name or description of the activity.', max_length=255)),
                (
                    'source_type',
                    models.CharField(db_comment='The type of source responsible for the emission.', max_length=255),
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
                        db_comment='The emission category associated with this emission.',
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name='report_non_attributable_emissions',
                        to='reporting.emissioncategory',
                    ),
                ),
                (
                    'facility_report',
                    models.ForeignKey(
                        db_comment='The facility report this activity data belongs to',
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='%(class)s_records',
                        to='reporting.facilityreport',
                    ),
                ),
                ('gas_type', models.ManyToManyField(related_name='+', to='reporting.gastype')),
                (
                    'report_version',
                    models.ForeignKey(
                        db_comment='The report this operation information relates to',
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='report_non_attributable_emissions',
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
                'db_table': 'erc"."report_non_attributable_emissions',
                'db_table_comment': 'A table to store non-attributable emissions data.',
            },
        ),
    ]
