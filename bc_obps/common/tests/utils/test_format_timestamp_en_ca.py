# tests/test_format_timestamp_en_ca.py
import pytest
from datetime import datetime, timezone
from zoneinfo import ZoneInfo
from common.utils import format_timestamp_en_ca


@pytest.mark.parametrize(
    "dt,tz,expected",
    [
        # Falsy input → empty string
        (None, "America/Vancouver", ""),
        # Naive input (assumed UTC) → PDT in summer
        (datetime(2025, 8, 27, 13, 39), "America/Vancouver", "Aug 27, 2025\n6:39 a.m. PDT"),
        # Aware UTC input → PST in winter
        (datetime(2025, 1, 15, 21, 5, tzinfo=timezone.utc), "America/Vancouver", "Jan 15, 2025\n1:05 p.m. PST"),
        # Noon edge case
        (datetime(2025, 8, 27, 19, 0), "America/Vancouver", "Aug 27, 2025\n12:00 p.m. PDT"),
        # Midnight edge case
        (datetime(2025, 8, 27, 7, 0), "America/Vancouver", "Aug 27, 2025\n12:00 a.m. PDT"),
        # Non-default tz (Toronto) to confirm tz parameter
        (datetime(2025, 8, 27, 13, 39, tzinfo=timezone.utc), "America/Toronto", "Aug 27, 2025\n9:39 a.m. EDT"),
    ],
)
def test_format_timestamp_en_ca_parametrized(dt, tz, expected):
    assert format_timestamp_en_ca(dt, tz) == expected


def test_aware_input_in_other_tz_converts_to_target():
    # 12:00 in Toronto should be 9:00 in Vancouver on Aug 27, 2025 (EDT→PDT)
    aware_toronto = datetime(2025, 8, 27, 12, 0, tzinfo=ZoneInfo("America/Toronto"))
    assert format_timestamp_en_ca(aware_toronto, "America/Vancouver") == "Aug 27, 2025\n9:00 a.m. PDT"


def test_naive_is_treated_as_utc_equivalence():
    # Naive is treated as UTC → should match explicitly aware UTC
    naive = datetime(2025, 8, 27, 13, 39)
    aware_utc = naive.replace(tzinfo=timezone.utc)
    assert format_timestamp_en_ca(naive) == format_timestamp_en_ca(aware_utc)
