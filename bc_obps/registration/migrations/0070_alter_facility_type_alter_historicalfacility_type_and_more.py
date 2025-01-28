# Generated by Django 5.0.11 on 2025-01-28 23:32

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('registration', '0069_V1_19_0'),
    ]

    operations = [
        migrations.AlterField(
            model_name='facility',
            name='type',
            field=models.CharField(
                choices=[
                    ('Single Facility', 'Single Facility'),
                    ('Large Facility', 'Large Facility'),
                    ('Medium Facility', 'Medium Facility'),
                    ('Small Aggregate', 'Small Aggregate'),
                    ('Electricity Import', 'Electricity Import'),
                ],
                db_comment='The type of the facility',
                max_length=100,
            ),
        ),
        migrations.AlterField(
            model_name='historicalfacility',
            name='type',
            field=models.CharField(
                choices=[
                    ('Single Facility', 'Single Facility'),
                    ('Large Facility', 'Large Facility'),
                    ('Medium Facility', 'Medium Facility'),
                    ('Small Aggregate', 'Small Aggregate'),
                    ('Electricity Import', 'Electricity Import'),
                ],
                db_comment='The type of the facility',
                max_length=100,
            ),
        ),
        migrations.AlterField(
            model_name='operation',
            name='naics_code',
            field=models.ForeignKey(
                blank=True,
                db_comment="This column refers to an operation's primary NAICS code.",
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='operations',
                to='registration.naicscode',
            ),
        ),
    ]
