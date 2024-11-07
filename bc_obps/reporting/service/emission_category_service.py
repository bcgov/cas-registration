from reporting.models import EmissionCategory
from reporting.models.report_emission import ReportEmission
from decimal import Decimal
from django.db.models import Sum
from typing import Dict, List


class EmissionCategoryService:
    """
    Service that applies an emission category to an emission based on the reported activity, source_type and in the case of fuel_excluded categories, fuel_classification
    """

    @classmethod
    def get_all_emission_categories(cls) -> List[EmissionCategory]:
        return list(EmissionCategory.objects.all())

    @staticmethod
    def get_total_emissions_by_emission_category(facility_report_id: int, emission_category_id: int) -> Decimal | int:
        records = ReportEmission.objects_with_decimal_emissions.filter(
            report_source_type__report_activity__facility_report_id=facility_report_id,
            emission_categories__id=emission_category_id,
        )
        category_sum = records.aggregate(emission_sum=Sum('emission'))

        return category_sum['emission_sum'] or 0

    @staticmethod
    def get_reporting_only_emissions(facility_report_id: int) -> Decimal | int:
        # Fugitive, fuel_excluded, other_excluded
        records = ReportEmission.objects_with_decimal_emissions.filter(
            report_source_type__report_activity__facility_report_id=facility_report_id,
            emission_categories__id__in=[2, 10, 11, 12, 13, 14],
        ).distinct()

        total_reporting_only = records.aggregate(emission_sum=Sum('emission'))
        return total_reporting_only['emission_sum'] or 0

    @classmethod
    def get_all_category_totals(cls, facility_report_id: int) -> Dict[str, Decimal | int]:
        # BASIC
        flaring_total = EmissionCategoryService.get_total_emissions_by_emission_category(facility_report_id, 1)
        fugitive_total = EmissionCategoryService.get_total_emissions_by_emission_category(facility_report_id, 2)
        industrial_process_total = EmissionCategoryService.get_total_emissions_by_emission_category(
            facility_report_id, 3
        )
        onsite_transportation_total = EmissionCategoryService.get_total_emissions_by_emission_category(
            facility_report_id, 4
        )
        stationary_combustion_total = EmissionCategoryService.get_total_emissions_by_emission_category(
            facility_report_id, 5
        )
        venting_useful_total = EmissionCategoryService.get_total_emissions_by_emission_category(facility_report_id, 6)
        venting_non_useful_total = EmissionCategoryService.get_total_emissions_by_emission_category(
            facility_report_id, 7
        )
        waste_total = EmissionCategoryService.get_total_emissions_by_emission_category(facility_report_id, 8)
        wastewater_total = EmissionCategoryService.get_total_emissions_by_emission_category(facility_report_id, 9)
        # FUEL EXCLUDED
        woody_biomass_total = EmissionCategoryService.get_total_emissions_by_emission_category(facility_report_id, 10)
        excluded_biomass_total = EmissionCategoryService.get_total_emissions_by_emission_category(
            facility_report_id, 11
        )
        excluded_non_biomass_total = EmissionCategoryService.get_total_emissions_by_emission_category(
            facility_report_id, 12
        )
        # OTHER EXCLUDED
        lfo_excluded_total = EmissionCategoryService.get_total_emissions_by_emission_category(facility_report_id, 13)

        # ATTRIBUTABLE EMISSIONS
        attributable_for_reporting = (
            flaring_total
            + fugitive_total
            + industrial_process_total
            + onsite_transportation_total
            + stationary_combustion_total
            + venting_useful_total
            + venting_non_useful_total
            + waste_total
            + wastewater_total
        )
        attributable_for_threshold = attributable_for_reporting - woody_biomass_total
        reporting_only = EmissionCategoryService.get_reporting_only_emissions(facility_report_id)

        return {
            'flaring': flaring_total,
            'fugitive': fugitive_total,
            'industrial_process': industrial_process_total,
            'onsite': onsite_transportation_total,
            'stationary': stationary_combustion_total,
            'venting_useful': venting_useful_total,
            'venting_non_useful': venting_non_useful_total,
            'waste': waste_total,
            'wastewater': wastewater_total,
            'woody_biomass': woody_biomass_total,
            'excluded_biomass': excluded_biomass_total,
            'excluded_non_biomass': excluded_non_biomass_total,
            'lfo_excluded': lfo_excluded_total,
            'attributable_for_reporting': attributable_for_reporting,
            'attributable_for_threshold': attributable_for_threshold,
            'reporting_only': reporting_only,
        }
