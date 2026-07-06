from django.db import migrations


def load_dashboard_fixtures(apps, schema_editor):
    from django.core.management import call_command

    fixture_files = [
        'common/fixtures/dashboard/bciers/external.json',
        'common/fixtures/dashboard/bciers/internal.json',
        'common/fixtures/dashboard/operators/internal.json',
    ]

    # Delete all existing DashboardData objects
    DashboardData = apps.get_model('common', 'DashboardData')
    DashboardData.objects.all().delete()

    # Load the fixtures
    for fixture in fixture_files:
        call_command('loaddata', fixture)


class Migration(migrations.Migration):

    dependencies = [
        ('common', '0130_V5_15_0'),
    ]

    operations = [
        migrations.RunPython(load_dashboard_fixtures, elidable=True),
    ]
