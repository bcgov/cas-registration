# Generated by Django 5.0.8 on 2024-12-06 15:33

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('registration', '0061_remove_naics_code'),
        ('reporting', '0038_product_emission_intensity_with_data'),
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
                    'allocation_methodology',
                    models.CharField(
                        choices=[('Calculator', 'Calculator'), ('other', 'Other')],
                        default='Calculator',
                        db_comment='The methodology used to calculate the allocated emissions',
                        max_length=255,
                    ),
                ),
                (
                    'allocation_other_methodology_description',
                    models.TextField(
                        blank=True, db_comment="A description of the methodology used if 'Other' is selected", null=True
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
                        related_name='%(class)s_records',
                        to='reporting.emissioncategory',
                    ),
                ),
                (
                    'facility_report',
                    models.ForeignKey(
                        db_comment='The facility report this production information belongs to',
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='%(class)s_records',
                        to='reporting.facilityreport',
                    ),
                ),
                (
                    'report_product',
                    models.ForeignKey(
                        db_comment='The regulated product this emission data has been allocated to',
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name='%(class)s_records',
                        to='reporting.reportproduct',
                    ),
                ),
                (
                    'report_version',
                    models.ForeignKey(
                        db_comment='The report version this emission data is associated with',
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name='%(class)s_records',
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
                'db_table': 'erc"."report_product_emission_allocation',
                'db_table_comment': 'A table to store the allocated amount of emissions for a given product',
            },
        ),
        migrations.AddConstraint(
            model_name='reportproductemissionallocation',
            constraint=models.UniqueConstraint(
                fields=('report_version', 'facility_report', 'report_product', 'emission_category'),
                name='unique_report_product_emission_allocation',
                violation_error_message="A FacilityReport can only have one ReportProductEmissionAllocation per Report Product and Emission Category",
            ),
        ),
        migrations.AddConstraint(
            model_name='reportproductemissionallocation',
            constraint=models.CheckConstraint(
                check=models.Q(
                    ('allocation_methodology', 'other'),
                    ('allocation_other_methodology_description__isnull', True),
                    _negated=True,
                ),
                name='allocation_other_methodology_must_have_description',
                violation_error_message="A value for allocation_other_methodology_description must be provided if the allocation_methodology is 'other'",
            ),
        ),
    ]
