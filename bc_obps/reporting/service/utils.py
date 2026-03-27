from datetime import datetime
from decimal import Decimal
from reporting.models.configuration import Configuration
from dataclasses import dataclass
from typing import Optional
from registration.models import Operation


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


@dataclass
class OperationContext:
    reporting_year: int
    registration_purpose: Optional[Operation.Purposes]
    opted_out_final_year: Optional[int]


def is_operation_opted_out(ctx: OperationContext) -> bool:
    """
    Returns True if an operation is considered opted out.

    An operation is opted out only when:
    - its registration purpose is OPTED_IN_OPERATION
    - a final reporting year is set
    - the final reporting year is less than or equal to the current reporting year
    """
    if ctx.registration_purpose != Operation.Purposes.OPTED_IN_OPERATION:
        return False

    if ctx.opted_out_final_year is None:
        return False

    return ctx.opted_out_final_year <= ctx.reporting_year


def should_include_jan_mar_production(ctx: OperationContext) -> bool:
    """
    Returns True if Jan–Mar production data should be included in schema

    Jan–Mar production data is only applicable when:
    - the reporting year is 2025, and
    - the operation is considered opted out-> when is_operation_opted_out==True
    """
    return ctx.reporting_year == 2025 and is_operation_opted_out(ctx)
