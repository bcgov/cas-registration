# Generated by Django 5.0.13 on 2025-03-11 20:50

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('registration', '0083_migrate_point_of_contact'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='historicaloperation',
            name='point_of_contact',
        ),
        migrations.RemoveField(
            model_name='operation',
            name='point_of_contact',
        ),
    ]
