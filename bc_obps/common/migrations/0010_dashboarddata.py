# Generated by Django 5.0.6 on 2024-05-30 20:54

from django.db import migrations, models

def load_dashboard_fixtures(apps, schema_editor):
    from django.core.management import call_command

    fixture_files = [
        'common/fixtures/dashboard/bciers/external.json',
        'common/fixtures/dashboard/bciers/internal.json',
        'common/fixtures/dashboard/registration/operation/external.json',
        'common/fixtures/dashboard/registration/external.json',
        'common/fixtures/dashboard/registration/internal_admin.json',
        'common/fixtures/dashboard/registration/internal.json',
        'common/fixtures/dashboard/reporting/external.json',
        'common/fixtures/dashboard/reporting/internal.json',
    ]

    for fixture in fixture_files:
        call_command('loaddata', fixture)


class Migration(migrations.Migration):

    dependencies = [
        ('common', '0009_V1_5_2'),
    ]

    operations = [
        migrations.CreateModel(
            name='DashboardData',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                (
                    'name',
                    models.CharField(
                        db_comment='Name of the dashboard by app and ID type used as a friendly unique identifier.',
                        max_length=100,
                        unique=True,
                    ),
                ),
                ('data', models.JSONField(db_comment='JSON representation of dashboard navigation tiles.')),
            ],
            options={
                'db_table': 'common"."dashboard_data',
                'db_table_comment': 'The JSON information for dashboard navigation tiles by app and ID type.',
            },
        ),
        migrations.RunPython(load_dashboard_fixtures),
    ]
