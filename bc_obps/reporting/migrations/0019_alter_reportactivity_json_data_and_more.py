# Generated by Django 5.0.8 on 2024-10-09 00:17

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('registration', '0045_V1_11_0'),
        ('reporting', '0018_pulp_and_paper_production'),
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
            model_name='reportemission',
            name='report_fuel',
            field=models.ForeignKey(
                blank=True,
                db_comment='The fuel data this emission data belongs to, if applicable',
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='%(class)s_records',
                to='reporting.reportfuel',
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
            model_name='reportfuel',
            name='report_unit',
            field=models.ForeignKey(
                blank=True,
                db_comment='The unit form data this fuel data belongs to, if applicable',
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='%(class)s_records',
                to='reporting.reportunit',
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
            model_name='activitysourcetypejsonschema',
            constraint=models.CheckConstraint(
                check=models.Q(('has_unit', True), ('has_fuel', False), _negated=True),
                name='invalid_if_has_unit_and_no_fuel',
                violation_error_message='A Source Type configuration cannot specify a unit without a fuel',
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
                name='unique_source_type_report_per_activity_report_and_source_type',
            ),
        ),
    ]
