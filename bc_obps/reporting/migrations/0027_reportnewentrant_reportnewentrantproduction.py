# Generated by Django 5.0.9 on 2024-11-05 06:02

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('registration', '0048_bcobpsregulatedoperation_issued_by_and_more'),
        ('reporting', '0026_reportmethodology_methodology'),
    ]

    operations = [
        migrations.CreateModel(
            name='ReportNewEntrant',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True, null=True)),
                ('updated_at', models.DateTimeField(blank=True, null=True)),
                ('archived_at', models.DateTimeField(blank=True, null=True)),
                (
                    'report_version',
                    models.OneToOneField(
                        db_comment='The associated report version for this new entrant record',
                        on_delete=django.db.models.deletion.PROTECT,
                        primary_key=True,
                        related_name='report_new_entrant',
                        serialize=False,
                        to='reporting.reportversion',
                    ),
                ),
                ('authorization_date', models.DateTimeField(db_comment='Date of authorization for emission reporting')),
                (
                    'first_shipment_date',
                    models.DateTimeField(
                        blank=True,
                        db_comment='Date of the first shipment related to this report (if applicable)',
                        null=True,
                    ),
                ),
                (
                    'new_entrant_period_start',
                    models.DateTimeField(
                        blank=True, db_comment='Start date of the new entrant reporting period', null=True
                    ),
                ),
                (
                    'assertion_statement_certified',
                    models.BooleanField(
                        blank=True, db_comment='Indicates if the assertion statement is certified', null=True
                    ),
                ),
                (
                    'flaring_emissions',
                    models.IntegerField(
                        blank=True, db_comment='Emissions from flaring activities', default=0, null=True
                    ),
                ),
                (
                    'fugitive_emissions',
                    models.IntegerField(
                        blank=True, db_comment='Unintentional emissions (fugitive)', default=0, null=True
                    ),
                ),
                (
                    'industrial_process_emissions',
                    models.IntegerField(
                        blank=True, db_comment='Emissions from industrial processes', default=0, null=True
                    ),
                ),
                (
                    'on_site_transportation_emissions',
                    models.IntegerField(
                        blank=True, db_comment='Emissions from on-site transportation', default=0, null=True
                    ),
                ),
                (
                    'stationary_fuel_combustion_emissions',
                    models.IntegerField(
                        blank=True, db_comment='Emissions from stationary fuel combustion', default=0, null=True
                    ),
                ),
                (
                    'venting_emissions_useful',
                    models.IntegerField(blank=True, db_comment='Venting emissions deemed useful', default=0, null=True),
                ),
                (
                    'venting_emissions_non_useful',
                    models.IntegerField(blank=True, db_comment='Non-useful venting emissions', default=0, null=True),
                ),
                (
                    'emissions_from_waste',
                    models.IntegerField(blank=True, db_comment='Emissions from waste disposal', default=0, null=True),
                ),
                (
                    'emissions_from_wastewater',
                    models.IntegerField(
                        blank=True, db_comment='Emissions from wastewater processing', default=0, null=True
                    ),
                ),
                (
                    'co2_emissions_from_excluded_woody_biomass',
                    models.IntegerField(
                        blank=True, db_comment='CO2 emissions from excluded woody biomass', default=0, null=True
                    ),
                ),
                (
                    'other_emissions_from_excluded_biomass',
                    models.IntegerField(
                        blank=True, db_comment='Emissions from other excluded biomass', default=0, null=True
                    ),
                ),
                (
                    'emissions_from_excluded_non_biomass',
                    models.IntegerField(
                        blank=True, db_comment='Emissions from excluded non-biomass sources', default=0, null=True
                    ),
                ),
                (
                    'emissions_from_line_tracing',
                    models.IntegerField(
                        blank=True, db_comment='Emissions from line tracing activities', default=0, null=True
                    ),
                ),
                (
                    'emissions_from_fat_oil',
                    models.IntegerField(
                        blank=True, db_comment='Emissions from fat or oil sources', default=0, null=True
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
            name='ReportNewEntrantProduction',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True, null=True)),
                ('updated_at', models.DateTimeField(blank=True, null=True)),
                ('archived_at', models.DateTimeField(blank=True, null=True)),
                (
                    'production_amount',
                    models.IntegerField(
                        blank=True,
                        db_comment='The amount of production associated with this report',
                        default=0,
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
                        on_delete=django.db.models.deletion.CASCADE,
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
    ]
