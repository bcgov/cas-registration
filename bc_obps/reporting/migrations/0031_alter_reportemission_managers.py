# Generated by Django 5.0.8 on 2024-10-29 19:07

import django.db.models.manager
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('reporting', '0030_report_non_attributable_emissions'),
    ]

    operations = [
        migrations.AlterModelManagers(
            name='reportemission',
            managers=[
                ('objects_with_decimal_emissions', django.db.models.manager.Manager()),
            ],
        ),
    ]