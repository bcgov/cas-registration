from dataclasses import dataclass, field
from decimal import Decimal
from typing import List

from django.db.models import F, Q, Sum
from reporting.constants import (
    COMPLIANCE_REPORTING_ONLY_CATEGORY_IDS as REPORTING_ONLY_CATEGORY_IDS,
    FUEL_EXCLUDED_CATEGORY_IDS,
    FUGITIVE_CATEGORY_ID,
    NON_USEFUL_VENTING_CATEGORY_ID,
    NPNC_CATEGORY_ID,
)
from reporting.models.report_emission import ReportEmission
from reporting.models.report_product_emission_allocation import ReportProductEmissionAllocation


def get_allocated_emissions_by_report_product_emission_category(
    report_version_id: int, product_id: int, emission_category_ids: List[int]
) -> Decimal:
    records = ReportProductEmissionAllocation.objects.filter(
        report_version_id=report_version_id,
        report_product__product_id=product_id,
        emission_category_id__in=emission_category_ids,
    )
    allocated_to_category_sum = records.aggregate(production_sum=Sum("allocated_quantity"))

    return allocated_to_category_sum["production_sum"] or Decimal("0")


def get_reporting_only_allocated(report_version_id: int, product_id: int) -> Decimal:
    # CO2 emissions from excluded woody biomass, Other emissions from excluded biomass, Emissions from excluded non-biomass, Fugitive emissions, Venting emissions — non-useful
    reporting_only_allocated = get_allocated_emissions_by_report_product_emission_category(
        report_version_id, product_id, REPORTING_ONLY_CATEGORY_IDS
    )
    return reporting_only_allocated


def get_emissions_from_only_funny_category_13(report_version_id: int) -> Decimal:
    """
    We need to total up the emissions associated with category 13 without double-counting
    (i.e. the ones that are not already under 10,11,12 fuel_excluded)
    and subtract them from the total attributable for compliance,
    since they're not based on a single product and therefore are not allocated anywhere.
    """
    records = ReportEmission.objects_with_decimal_emissions.filter(
        report_version_id=report_version_id,
        emission_categories__id=NPNC_CATEGORY_ID,
    ).exclude(
        emission_categories__id__in=FUEL_EXCLUDED_CATEGORY_IDS,
    )
    return records.aggregate(emission_total=Sum("emission"))["emission_total"] or Decimal("0")


def get_fog_emissions(report_version_id: int) -> Decimal:
    fog_allocation_records = ReportProductEmissionAllocation.objects.filter(
        report_version_id=report_version_id,
        report_product__product__name="Fat, oil and grease collection, refining and storage",
    ).exclude(
        emission_category_id__in=REPORTING_ONLY_CATEGORY_IDS
    )  # Exclude emissions allocated to fog from excluded categories (otherwise we're double counting the excluded emissions)
    fog_allocated_amount = fog_allocation_records.aggregate(allocated_sum=Sum("allocated_quantity"))[
        "allocated_sum"
    ] or Decimal("0")
    return fog_allocated_amount


@dataclass
class UnregulatedProductAllocation:
    product_name: str
    allocated_emissions: Decimal


@dataclass
class UnregulatedProductsAllocation:
    """
    Emissions allocated to unregulated products, used in the emissions attributable for compliance equation.

    products: each product's emissions allocated in basic categories, as entered on the allocation page.
    excluded_by_fuels, non_useful_venting, fugitive: the share of each reporting-only category allocated to
    unregulated products. The panel already subtracts these on their own lines, so they are taken out of
    the products' total to avoid subtracting them twice.
    """

    products: List[UnregulatedProductAllocation] = field(default_factory=list)
    excluded_by_fuels: Decimal = Decimal("0")
    non_useful_venting: Decimal = Decimal("0")
    fugitive: Decimal = Decimal("0")

    @property
    def total(self) -> Decimal:
        allocated = sum((product.allocated_emissions for product in self.products), Decimal("0"))
        return allocated - self.excluded_by_fuels - self.non_useful_venting - self.fugitive


def get_allocated_to_unregulated_products(report_version_id: int) -> UnregulatedProductsAllocation:
    """
    Returns the emissions allocated to each unregulated product in a report version (basic categories),
    and the share of each reporting-only category allocated to them.
    """
    rows = list(
        ReportProductEmissionAllocation.objects.filter(
            report_version_id=report_version_id,
            report_product__product__is_regulated=False,
        )
        .values(product_name=F("report_product__product__name"))
        .annotate(
            basic=Sum("allocated_quantity", filter=Q(emission_category__category_type="basic")),
            excluded_by_fuels=Sum("allocated_quantity", filter=Q(emission_category_id__in=FUEL_EXCLUDED_CATEGORY_IDS)),
            non_useful_venting=Sum("allocated_quantity", filter=Q(emission_category_id=NON_USEFUL_VENTING_CATEGORY_ID)),
            fugitive=Sum("allocated_quantity", filter=Q(emission_category_id=FUGITIVE_CATEGORY_ID)),
        )
        .order_by("product_name")
    )

    return UnregulatedProductsAllocation(
        products=[
            UnregulatedProductAllocation(
                product_name=row["product_name"],
                allocated_emissions=row["basic"] or Decimal("0"),
            )
            for row in rows
        ],
        excluded_by_fuels=sum((row["excluded_by_fuels"] or Decimal("0") for row in rows), Decimal("0")),
        non_useful_venting=sum((row["non_useful_venting"] or Decimal("0") for row in rows), Decimal("0")),
        fugitive=sum((row["fugitive"] or Decimal("0") for row in rows), Decimal("0")),
    )
