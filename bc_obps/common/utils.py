import os
from typing import Optional, List
from django.apps import apps
from django.core.management import call_command
from decimal import Decimal


def get_fixture_files() -> List[str]:
    """Return list of fixture files based on environment."""
    fixture_base = 'common/fixtures/dashboard'

    def fixtures(*paths: str) -> List[str]:
        return [f"{fixture_base}/{path}" for path in paths]

    base_fixtures = fixtures(
        "administration/external.json",
        "administration/internal.json",
        "operators/internal.json",
        "registration/external.json",
        "reporting/external.json",
        "reporting/internal.json",
    )

    is_prod = os.environ.get("ENVIRONMENT") == "prod"
    env_fixtures = fixtures(
        *(
            [
                "bciers/prod/external.json",
                "bciers/prod/internal.json",
            ]
            if is_prod
            else [
                "bciers/dev/external.json",
                "bciers/dev/internal.json",
                "compliance/external.json",
                "compliance/internal.json",
            ]
        )
    )

    return base_fixtures + env_fixtures


def reset_dashboard_data() -> None:
    """
    Reset DashboardData objects to initial state by clearing existing data and loading fixtures.
    """
    DashboardData = apps.get_model('common', 'DashboardData')
    DashboardData.objects.all().delete()

    for fixture in get_fixture_files():
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
