from django.apps import apps
from django.core.management import call_command


def reset_dashboard_data() -> None:
    """
    Reset the DashboardData objects to the initial state by deleting all existing objects and reloading the fixtures.
    """
    fixture_files = [
        'common/fixtures/dashboard/bciers/external.json',
        'common/fixtures/dashboard/bciers/internal.json',
        'common/fixtures/dashboard/administration/external.json',
        'common/fixtures/dashboard/administration/internal.json',
        'common/fixtures/dashboard/operators/internal.json',
        'common/fixtures/dashboard/registration/external.json',
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
