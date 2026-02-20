from decimal import Decimal
from typing import Dict, Tuple, cast, Literal

# Production period options - only one can be active
ProductionPeriod = Literal["annual", "jan_mar", "apr_dec"]


def _round4(value: Decimal) -> Decimal:
    return Decimal(value).quantize(Decimal("0.0001"), rounding="ROUND_HALF_UP")


def resolve_compliance_parameters(
    production_period: ProductionPeriod, allocated_for_compliance: Decimal, production_totals: Dict[str, Decimal]
) -> Tuple[Decimal, Decimal, Decimal]:
    """
    Resolve which production amount and allocated emissions to use for compliance calculations.
    For reporting year 2024, production is reported for Apr-Dec, and allocated emissions are prorated for the partial year.
    For reporting year 2025, some opted-in operations may opt out, in which case production is reported for Jan-Mar, and allocated emissions are prorated for the partial year.

    Args:
        production_period: Production period to use for compliance calculations
        allocated_for_compliance: Allocated emissions for compliance (full-year)
        production_totals: Dict with "annual_amount", "apr_dec", "jan_mar" keys

    Returns a tuple: (production_for_limit, prorated_allocated, allocated_compliance_emissions_value)
    - production_for_limit: Decimal used for emission limit calculation (jan-mar, apr-dec, or annual)
    - prorated_allocated: Decimal the prorated allocated emissions for a partial year (0 if not using a partial year)
    - allocated_compliance_emissions_value: Decimal rounded to 4 dp used for product-level reporting
    """
    annual = Decimal(cast(Decimal, production_totals.get("annual_amount")))

    if production_period == "annual":
        production_for_limit = annual
        prorated_allocated = Decimal(0)
    elif production_period == "apr_dec":
        apr_dec = Decimal(production_totals.get("apr_dec") or 0)
        production_for_limit = apr_dec
        prorated_allocated = Decimal(0) if annual == 0 else (allocated_for_compliance / annual) * apr_dec
    elif production_period == "jan_mar":
        jan_mar = Decimal(production_totals.get("jan_mar") or 0)
        production_for_limit = jan_mar
        prorated_allocated = Decimal(0) if annual == 0 else (allocated_for_compliance / annual) * jan_mar
    else:
        raise ValueError(f"Invalid production period: {production_period}")

    allocated_compliance_emissions_value = (
        _round4(prorated_allocated) if production_period != "annual" else _round4(allocated_for_compliance)
    )

    return production_for_limit, prorated_allocated, allocated_compliance_emissions_value
