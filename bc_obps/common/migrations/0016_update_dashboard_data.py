# Generated by Django 5.0.7 on 2024-08-20 20:42

from django.db import migrations


def load_dashboard_fixtures(apps, schema_editor):
    from django.core.management import call_command

    fixture_files = [
        'common/fixtures/dashboard/bciers/external.json',
        'common/fixtures/dashboard/bciers/internal.json',
        'common/fixtures/dashboard/administration/external.json',
        'common/fixtures/dashboard/administration/internal.json',
        'common/fixtures/dashboard/registration/external.json',
        'common/fixtures/dashboard/registration/internal.json',
        'common/fixtures/dashboard/reporting/external.json',
        'common/fixtures/dashboard/reporting/internal.json',
        'common/fixtures/dashboard/coam/external.json',
        'common/fixtures/dashboard/coam/internal.json',
    ]

    # Delete all existing DashboardData objects
    DashboardData = apps.get_model('common', 'DashboardData')
    DashboardData.objects.all().delete()

    # Load the fixtures
    for fixture in fixture_files:
        call_command('loaddata', fixture)


class Migration(migrations.Migration):

    dependencies = [
        ('common', '0015_V1_9_0'),
    ]

    operations = [
        migrations.RunPython(load_dashboard_fixtures, elidable=True),
    ]
