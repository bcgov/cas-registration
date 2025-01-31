import os
from typing import Optional

from django.apps import apps
from django.core.management import call_command
from decimal import Decimal


def reset_dashboard_data() -> None:
    """
    Reset the DashboardData objects to the initial state by deleting all existing objects and reloading the fixtures.
    """
    fixture_files = [
        'common/fixtures/dashboard/administration/external.json',
        'common/fixtures/dashboard/administration/internal.json',
        'common/fixtures/dashboard/operators/internal.json',
        'common/fixtures/dashboard/registration/external.json',
        'common/fixtures/dashboard/reporting/external.json',
        'common/fixtures/dashboard/reporting/internal.json',
    ]

    if os.environ.get('ENVIRONMENT') == 'prod':
        fixture_files.extend(
            [
                'common/fixtures/dashboard/bciers/prod/external.json',
                'common/fixtures/dashboard/bciers/prod/internal.json',
            ]
        )
    else:
        fixture_files.extend(
            [
                'common/fixtures/dashboard/bciers/dev/external.json',
                'common/fixtures/dashboard/bciers/dev/internal.json',
                'common/fixtures/dashboard/compliance/external.json',
                'common/fixtures/dashboard/compliance/internal.json',
            ]
        )
    print(f"Loading fixtures: {fixture_files}")

    # Delete all existing DashboardData objects
    DashboardData = apps.get_model('common', 'DashboardData')
    DashboardData.objects.all().delete()

    # Load the fixtures
    for fixture in fixture_files:
        call_command('loaddata', fixture)


def format_decimal(value: Decimal, decimal_places: int = 2) -> Optional[Decimal]:
    """
    Formats a Decimal or numeric value to the specified number of decimal places
    without rounding (truncates the extra digits).
    """
    if value is None:
        return None
    try:
        quantize_value = Decimal(f"1.{'0' * decimal_places}")
        return value.quantize(quantize_value)
    except (ValueError, TypeError):
        raise ValueError(f"Cannot format the provided value: {value}")
