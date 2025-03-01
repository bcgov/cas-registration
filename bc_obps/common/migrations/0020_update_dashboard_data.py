# Generated by Django 5.0.9 on 2024-10-09 17:48

from django.db import migrations


def load_dashboard_fixtures(apps, schema_editor):
    from django.core.management import call_command

    fixture_files = [
        'common/fixtures/dashboard/bciers/dev/external.json',
        'common/fixtures/dashboard/bciers/dev/internal.json',
        'common/fixtures/dashboard/administration/external.json',
        'common/fixtures/dashboard/administration/internal.json',
        'common/fixtures/dashboard/registration/external.json',
        'common/fixtures/dashboard/reporting/external.json',
        'common/fixtures/dashboard/reporting/internal.json',
        'common/fixtures/dashboard/compliance/external.json',
        'common/fixtures/dashboard/compliance/internal.json',
    ]

    # Delete all existing DashboardData objects
    DashboardData = apps.get_model('common', 'DashboardData')
    DashboardData.objects.all().delete()

    # Load the fixtures
    for fixture in fixture_files:
        call_command('loaddata', fixture)


class Migration(migrations.Migration):

    dependencies = [
        ('common', '0019_V1_11_0'),
    ]

    operations = [
        migrations.RunPython(load_dashboard_fixtures, elidable=True),
    ]
