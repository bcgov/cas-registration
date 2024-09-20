# Generated by Django 5.0.8 on 2024-09-23 21:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('registration', '0042_prod_data'),
        ('reporting', '0017_hydrogen_production'),
    ]

    operations = [
        migrations.AlterField(
            model_name='reportactivity',
            name='json_data',
            field=models.JSONField(
                blank=True, db_comment='A flat JSON object representing the data collected for this model'
            ),
        ),
        migrations.AlterField(
            model_name='reportemission',
            name='json_data',
            field=models.JSONField(
                blank=True, db_comment='A flat JSON object representing the data collected for this model'
            ),
        ),
        migrations.AlterField(
            model_name='reportfuel',
            name='json_data',
            field=models.JSONField(
                blank=True, db_comment='A flat JSON object representing the data collected for this model'
            ),
        ),
        migrations.AlterField(
            model_name='reportmethodology',
            name='json_data',
            field=models.JSONField(
                blank=True, db_comment='A flat JSON object representing the data collected for this model'
            ),
        ),
        migrations.AlterField(
            model_name='reportsourcetype',
            name='json_data',
            field=models.JSONField(
                blank=True, db_comment='A flat JSON object representing the data collected for this model'
            ),
        ),
        migrations.AlterField(
            model_name='reportunit',
            name='json_data',
            field=models.JSONField(
                blank=True, db_comment='A flat JSON object representing the data collected for this model'
            ),
        ),
        migrations.AddConstraint(
            model_name='facilityreport',
            constraint=models.UniqueConstraint(
                fields=('report_version', 'facility_id'), name='unique_facility_report_per_facility_and_report_version'
            ),
        ),
        migrations.AddConstraint(
            model_name='reportactivity',
            constraint=models.UniqueConstraint(
                fields=('report_version', 'facility_report_id', 'activity_id'),
                name='unique_activity_report_per_report_and_facility_and_activity,',
            ),
        ),
        migrations.AddConstraint(
            model_name='reportsourcetype',
            constraint=models.UniqueConstraint(
                fields=('report_activity', 'source_type'),
                name='unique_source_type_report_per_activity_report_and_source_type,',
            ),
        ),
    ]
