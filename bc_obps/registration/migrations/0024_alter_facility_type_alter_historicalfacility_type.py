# Generated by Django 5.0.6 on 2024-07-02 21:02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('registration', '0023_alter_facility_latitude_of_largest_emissions_and_more'),
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
                ],
                db_comment='The type of the facility',
                max_length=100,
            ),
        ),
    ]
