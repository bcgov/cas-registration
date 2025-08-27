import os
from typing import Optional, List
from django.apps import apps
from django.core.management import call_command
from decimal import Decimal

from datetime import datetime, timezone as dt_timezone
from zoneinfo import ZoneInfo
from django.utils import timezone as dj_timezone


def format_timestamp_en_ca(
    dt: Optional[datetime],
    tz: str = "America/Vancouver",
) -> str:
    """
    Mirror FE format:
      'Aug 27, 2025\\n6:39 a.m. PDT'
    - Converts to the given IANA timezone (default: America/Vancouver)
    - Uses 'en-CA' style month/day/year and 'a.m./p.m.' casing
    - Returns '' if dt is falsy
    """
    if not dt:
        return ""

    # Ensure aware; assume UTC if naive
    if dj_timezone.is_naive(dt):
        dt = dj_timezone.make_aware(dt, timezone=dt_timezone.utc)  # <- use datetime's UTC

    local_dt = dj_timezone.localtime(dt, ZoneInfo(tz))

    # Date: 'Aug 27, 2025'
    month = local_dt.strftime("%b")  # 'Aug'
    day = local_dt.day  # 27 (no leading zero)
    year = local_dt.year  # 2025
    date_part = f"{month} {day}, {year}"

    # Time: '6:39 a.m. PDT' (avoid %-I/%#I portability issues)
    hour_12 = local_dt.hour % 12 or 12
    minute = local_dt.strftime("%M")
    ampm = "a.m." if local_dt.hour < 12 else "p.m."
    tz_abbr = local_dt.strftime("%Z")
    time_part = f"{hour_12}:{minute} {ampm} {tz_abbr}"

    return f"{date_part}\n{time_part}"


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
