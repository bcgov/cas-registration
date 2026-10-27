from dataclasses import dataclass
from decimal import Decimal

from reporting.service.compliance_service.emission_allocation import (
    get_allocated_to_unregulated_products,
    get_emissions_from_only_funny_category_13,
)
from reporting.service.emission_category_service import EmissionCategoryService
from reporting.service.utils import round_using_appropriate_strategy


@dataclass
class EafcTotals:
    attributable_for_reporting: Decimal
    excluded_by_fuels: Decimal
    non_useful_venting: Decimal
    fugitive: Decimal
    remaining_npnc: Decimal
    allocated_to_unregulated_products: Decimal
    annual_eafc: Decimal


def get_eafc_totals(report_version_id: int, use_legacy_rounding: bool) -> EafcTotals:
    """
    Returns each term for the emissions attributable for compliance equation:

        annual_eafc = attributable for reporting - excluded by fuels - non-useful venting - fugitive
                      - remaining other excluded (category 13 only) - allocated to unregulated products

    Full-year reports: annual_eafc is the emissions attributable for compliance.
    Partial-year reports (2024 Apr-Dec, 2025 opt-out Jan-Mar): annual_eafc is the full-year value before
    proration. Proration is per product, by that product's share of production in the period
    (see ComplianceParameters.resolve_compliance_parameters):

        prorated = product's allocated emissions * (period production / annual production)
    """
    totals = EmissionCategoryService.get_all_category_totals_by_version(report_version_id)
    unregulated = sum(
        (product.allocated_emissions for product in get_allocated_to_unregulated_products(report_version_id)),
        Decimal("0"),
    )

    def round_term(value: Decimal | int) -> Decimal:
        return round_using_appropriate_strategy(Decimal(value), use_legacy_rounding)

    attributable_for_reporting = round_term(totals["attributable_for_reporting"])
    excluded_by_fuels = round_term(
        totals["woody_biomass"] + totals["excluded_biomass"] + totals["excluded_non_biomass"]
    )
    non_useful_venting = round_term(totals["venting_non_useful"])
    fugitive = round_term(totals["fugitive"])
    remaining_npnc = round_term(get_emissions_from_only_funny_category_13(report_version_id))
    allocated_to_unregulated_products = round_term(unregulated)

    return EafcTotals(
        attributable_for_reporting=attributable_for_reporting,
        excluded_by_fuels=excluded_by_fuels,
        non_useful_venting=non_useful_venting,
        fugitive=fugitive,
        remaining_npnc=remaining_npnc,
        allocated_to_unregulated_products=allocated_to_unregulated_products,
        annual_eafc=(
            attributable_for_reporting
            - excluded_by_fuels
            - non_useful_venting
            - fugitive
            - remaining_npnc
            - allocated_to_unregulated_products
        ),
    )
