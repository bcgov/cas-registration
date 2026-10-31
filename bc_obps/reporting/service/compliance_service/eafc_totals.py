from collections import defaultdict
from dataclasses import dataclass, field
from decimal import Decimal
from typing import Callable, Dict, List, Tuple

from django.db.models import Exists, F, OuterRef, Sum
from reporting.models.report_emission import ReportEmission
from reporting.service.compliance_service.emission_allocation import (
    REPORTING_ONLY_CATEGORY_IDS,
    UnregulatedProductAllocation,
    get_allocated_to_unregulated_products,
)
from reporting.service.utils import round_using_appropriate_strategy

FUGITIVE_CATEGORY_ID = 2
NON_USEFUL_VENTING_CATEGORY_ID = 7
BASIC_CATEGORY_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9]
FUEL_EXCLUDED_CATEGORY_IDS = [10, 11, 12]
NPNC_CATEGORY_ID = 13


@dataclass
class EafcEmissionRow:
    activity: str
    source_type: str
    fuel_name: str | None
    emissions: Decimal


@dataclass
class EafcTotals:
    attributable_for_reporting: Decimal
    excluded_by_fuels: Decimal
    non_useful_venting: Decimal
    fugitive: Decimal
    remaining_npnc: Decimal
    allocated_to_unregulated_products: Decimal
    annual_eafc: Decimal
    # Emissions behind each term, grouped by activity, source type and fuel
    attributable_for_reporting_rows: List[EafcEmissionRow] = field(default_factory=list)
    excluded_by_fuels_rows: List[EafcEmissionRow] = field(default_factory=list)
    non_useful_venting_rows: List[EafcEmissionRow] = field(default_factory=list)
    fugitive_rows: List[EafcEmissionRow] = field(default_factory=list)
    remaining_npnc_rows: List[EafcEmissionRow] = field(default_factory=list)
    unregulated_product_rows: List[UnregulatedProductAllocation] = field(default_factory=list)


RowKey = Tuple[str, str, str | None]


@dataclass
class _TermEmissions:
    """Unrounded emissions for one term of the equation, summed by (activity, source type, fuel)."""

    by_row: Dict[RowKey, Decimal] = field(default_factory=lambda: defaultdict(Decimal))

    def add(self, key: RowKey, emissions: Decimal) -> None:
        self.by_row[key] += emissions

    @property
    def total(self) -> Decimal:
        return sum(self.by_row.values(), Decimal("0"))

    def rows(self, round_term: Callable[[Decimal], Decimal]) -> List[EafcEmissionRow]:
        return [
            EafcEmissionRow(
                activity=activity, source_type=source_type, fuel_name=fuel_name, emissions=round_term(value)
            )
            for (activity, source_type, fuel_name), value in sorted(
                self.by_row.items(), key=lambda item: (item[0][0], item[0][1], item[0][2] or "")
            )
        ]


def get_term_emissions(report_version_id: int) -> Dict[str, _TermEmissions]:
    """
    Returns the emissions behind each term of the equation, from a single query.

    An emission in more than one category is counted once per category, matching the category totals
    (e.g. a fugitive emission is in both attributable for reporting and fugitive).

    Remaining NPNC = NPNC emissions - emissions excluded by fuel, non-useful venting, fugitive.
    Those emissions are already subtracted on their own lines, so they are left out to avoid subtracting them twice.
    """
    category_link = ReportEmission.emission_categories.through
    rows = (
        ReportEmission.objects_with_decimal_emissions.filter(
            report_version_id=report_version_id,
            emission_categories__id__in=[*BASIC_CATEGORY_IDS, *FUEL_EXCLUDED_CATEGORY_IDS, NPNC_CATEGORY_ID],
        )
        .annotate(
            is_reporting_only=Exists(
                category_link.objects.filter(
                    reportemission_id=OuterRef("pk"), emissioncategory_id__in=REPORTING_ONLY_CATEGORY_IDS
                )
            )
        )
        .values(
            "is_reporting_only",
            category_id=F("emission_categories__id"),
            activity_name=F("report_source_type__report_activity__activity__regulated_name"),
            source_type_name=F("report_source_type__source_type__name"),
            fuel_name=F("report_fuel__fuel_type__name"),
        )
        .annotate(emissions=Sum("emission"))
    )

    terms: Dict[str, _TermEmissions] = defaultdict(_TermEmissions)
    for row in rows:
        key: RowKey = (row["activity_name"], row["source_type_name"], row["fuel_name"])
        emissions = row["emissions"] or Decimal("0")
        category_id = row["category_id"]
        if category_id in BASIC_CATEGORY_IDS:
            terms["attributable_for_reporting"].add(key, emissions)
        if category_id in FUEL_EXCLUDED_CATEGORY_IDS:
            terms["excluded_by_fuels"].add(key, emissions)
        if category_id == NON_USEFUL_VENTING_CATEGORY_ID:
            terms["non_useful_venting"].add(key, emissions)
        if category_id == FUGITIVE_CATEGORY_ID:
            terms["fugitive"].add(key, emissions)
        if category_id == NPNC_CATEGORY_ID and not row["is_reporting_only"]:
            terms["remaining_npnc"].add(key, emissions)
    return terms


def get_eafc_totals(report_version_id: int, use_legacy_rounding: bool) -> EafcTotals:
    """
    Returns each term for the emissions attributable for compliance equation:

        annual_eafc = attributable for reporting - excluded by fuels - non-useful venting - fugitive
                      - remaining NPNC (NPNC - excluded by fuels, non-useful venting, fugitive)
                      - allocated to unregulated products (less remaining NPNC, which is allocated to them)

    Full-year reports: annual_eafc is the emissions attributable for compliance.
    Partial-year reports (2024 Apr-Dec, 2025 opt-out Jan-Mar): annual_eafc is the full-year value before
    proration. Proration is per product, by that product's share of production in the period
    (see ComplianceParameters.resolve_compliance_parameters):

        prorated = product's allocated emissions * (period production / annual production)
    """
    terms = get_term_emissions(report_version_id)
    unregulated_products = get_allocated_to_unregulated_products(report_version_id)
    allocated_to_unregulated = sum((product.allocated_emissions for product in unregulated_products), Decimal("0"))
    remaining_npnc_unrounded = terms["remaining_npnc"].total

    def round_term(value: Decimal | int) -> Decimal:
        return round_using_appropriate_strategy(Decimal(value), use_legacy_rounding)

    attributable_for_reporting = round_term(terms["attributable_for_reporting"].total)
    excluded_by_fuels = round_term(terms["excluded_by_fuels"].total)
    non_useful_venting = round_term(terms["non_useful_venting"].total)
    fugitive = round_term(terms["fugitive"].total)
    remaining_npnc = round_term(remaining_npnc_unrounded)
    # NPNC emissions must be allocated to unregulated products (see report_emission_allocation_other_excluded_category),
    # so they are already in the unregulated products' allocations. They are subtracted on their own line, so take
    # them out here to avoid subtracting them twice.
    allocated_to_unregulated_products = round_term(allocated_to_unregulated - remaining_npnc_unrounded)

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
        attributable_for_reporting_rows=terms["attributable_for_reporting"].rows(round_term),
        excluded_by_fuels_rows=terms["excluded_by_fuels"].rows(round_term),
        non_useful_venting_rows=terms["non_useful_venting"].rows(round_term),
        fugitive_rows=terms["fugitive"].rows(round_term),
        remaining_npnc_rows=terms["remaining_npnc"].rows(round_term),
        unregulated_product_rows=[
            UnregulatedProductAllocation(
                product_name=product.product_name,
                allocated_emissions=round_term(product.allocated_emissions),
            )
            for product in unregulated_products
            if product.allocated_emissions
        ],
    )
