# Generated by Django 5.0.10 on 2025-01-02 20:00

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('reporting', '0042_alter_reportverification_other_facility_coordinates_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='reportversion',
            name='status',
            field=models.CharField(
                choices=[('Draft', 'Draft'), ('Submitted', 'Submitted')],
                db_comment='The status for this report version: Draft or Submitted.',
                default='Draft',
                max_length=1000,
            ),
        ),
    ]
