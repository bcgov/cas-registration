from decimal import Decimal
from typing import Dict, Tuple, cast


class ComplianceParameters:
    """
    Class containing some utilities for the compliance calculations:
    - Consistent rounding method
    - Resolving compliance parameters for allocation
    """

    @staticmethod
    def round(value: Decimal | float) -> Decimal:
        """
        Round the value to 4 decimal places for compliance calculations.
        """
        return Decimal(value).quantize(Decimal("0.0001"), rounding="ROUND_HALF_UP")

    @staticmethod
    def resolve_compliance_parameters(
        use_apr_dec: bool, allocated_for_compliance: Decimal, production_totals: Dict[str, Decimal]
    ) -> Tuple[Decimal, Decimal, Decimal]:
        """
        Resolve which production amount and allocated emissions to use for compliance calculations.

        Returns a tuple: (production_for_limit, allocated_for_compliance_2024, allocated_compliance_emissions_value)
        - production_for_limit: Decimal used for emission limit calculation (apr-dec or annual)
        - allocated_for_compliance_2024: Decimal the prorated allocated emissions for Apr-Dec (0 if not using Apr-Dec)
        - allocated_compliance_emissions_value: Decimal rounded to 4 dp used for product-level reporting
        """
        annual = Decimal(cast(Decimal, production_totals.get("annual_amount")))
        apr_dec = Decimal(production_totals.get("apr_dec") or 0)

        if use_apr_dec:
            # If no annual production, prorated allocation is zero to avoid division-by-zero
            allocated_for_compliance_2024 = Decimal(0) if annual == 0 else (allocated_for_compliance / annual) * apr_dec
            production_for_limit = apr_dec
            allocated_compliance_emissions_value = ComplianceParameters.round(allocated_for_compliance_2024)
        else:
            allocated_for_compliance_2024 = Decimal(0)
            production_for_limit = annual
            allocated_compliance_emissions_value = ComplianceParameters.round(allocated_for_compliance)

        return production_for_limit, allocated_for_compliance_2024, allocated_compliance_emissions_value
