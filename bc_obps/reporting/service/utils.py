from datetime import datetime
from decimal import Decimal

from reporting.models.configuration import Configuration


def exclude_keys(dict: dict, exclude_keys: list[str]) -> dict:
    return {key: dict[key] for key in dict if key not in exclude_keys}


def find_configuration(date: datetime) -> Configuration:
    return Configuration.objects.get(valid_from__lte=date, valid_to__gte=date)


def retrieve_ids(data: dict | list[dict]) -> list:
    """
    Utility function to retrieve the id field of each element of a list or dict
    """
    # Assumes a dict of dicts containing the ID
    if isinstance(data, dict):
        return [data[key].get("id") for key in data if data[key].get("id") is not None]

    # Assumes a list of dicts containing the ID
    return [element.get('id') for element in data if element.get("id") is not None]


def round_using_appropriate_strategy(value: Decimal | float, use_legacy_rounding: bool = False) -> Decimal:
    """
    Rounds a value using the appropriate strategy based on the use_legacy_rounding flag.
    For legacy rounding: Uses banker's rounding (ROUND_HALF_EVEN) to maintain compatibility with existing reports.
    For non-legacy rounding: Uses ROUND_HALF_UP via ComplianceParameters.round().
    Places that call this function do so to preserve the rounding strategy used for reports from reporting_year 2024
    while allowing newer reports to use the app-standardized rounding method.
    """
    from reporting.service.compliance_service.parameters import ComplianceParameters

    if use_legacy_rounding:
        return Decimal(str(round(value, 4)))
    return ComplianceParameters.round(value)
