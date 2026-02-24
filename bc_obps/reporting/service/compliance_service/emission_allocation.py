from decimal import Decimal
from typing import List

from django.db.models import Sum
from reporting.models.report_emission import ReportEmission
from reporting.models.report_product_emission_allocation import ReportProductEmissionAllocation


REPORTING_ONLY_CATEGORY_IDS = [10, 11, 12, 2, 7]


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
        emission_categories__id=13,
    ).exclude(
        emission_categories__id__in=[10, 11, 12],
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
