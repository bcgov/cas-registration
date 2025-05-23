# Generated by Django 5.0.14 on 2025-05-08 17:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('reporting', '0096_remove_facilityreport_set_created_audit_columns_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='reportsignoff',
            name='acknowledgement_of_certification',
            field=models.BooleanField(
                blank=True,
                db_comment='Whether the user has certified that the amount of total emissions reported, and all other information included in this report, is complete and accurate.',
                default=False,
                null=True,
            ),
        ),
        migrations.AddField(
            model_name='reportsignoff',
            name='acknowledgement_of_errors',
            field=models.BooleanField(
                blank=True,
                db_comment='Whether the user has acknowledged that any errors, omissions, or misstatements in this report may result in administrative penalties or additional compliance obligations.',
                null=True,
            ),
        ),
        migrations.AlterField(
            model_name='reportsignoff',
            name='acknowledgement_of_review',
            field=models.BooleanField(
                blank=True,
                db_comment='Whether the user has certified that they have reviewed the report, and that they have ensured that the information included in this report is true and complete.',
                default=False,
                null=True,
            ),
        ),
    ]
