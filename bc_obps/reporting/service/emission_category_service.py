from reporting.models.facility_report import FacilityReport
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

    @classmethod
    def get_emission_category_totals_by_operation(cls, version_id: int) -> Dict[str, Decimal | int]:

        flaring_total: Decimal | int = 0
        fugitive_total: Decimal | int = 0
        industrial_process_total: Decimal | int = 0
        onsite_transportation_total: Decimal | int = 0
        stationary_combustion_total: Decimal | int = 0
        venting_useful_total: Decimal | int = 0
        venting_non_useful_total: Decimal | int = 0
        waste_total: Decimal | int = 0
        wastewater_total: Decimal | int = 0
        woody_biomass_total: Decimal | int = 0
        excluded_biomass_total: Decimal | int = 0
        excluded_non_biomass_total: Decimal | int = 0
        lfo_excluded_total: Decimal | int = 0
        attributable_for_reporting: Decimal | int = 0
        attributable_for_threshold: Decimal | int = 0
        reporting_only: Decimal | int = 0

        facility_report_ids = list(
            FacilityReport.objects.filter(report_version_id=version_id).values_list('id', flat=True)
        )
        for facility_report_id in facility_report_ids:
            category_totals = cls.get_all_category_totals(facility_report_id)
            flaring_total += category_totals['flaring']
            fugitive_total += category_totals['fugitive']
            industrial_process_total += category_totals['industrial_process']
            onsite_transportation_total += category_totals['onsite']
            stationary_combustion_total += category_totals['stationary']
            venting_useful_total += category_totals['venting_useful']
            venting_non_useful_total += category_totals['venting_non_useful']
            waste_total += category_totals['waste']
            wastewater_total += category_totals['wastewater']
            woody_biomass_total += category_totals['woody_biomass']
            excluded_biomass_total += category_totals['excluded_biomass']
            excluded_non_biomass_total += category_totals['excluded_non_biomass']
            lfo_excluded_total += category_totals['lfo_excluded']
            attributable_for_reporting += category_totals['attributable_for_reporting']
            attributable_for_threshold += category_totals['attributable_for_threshold']
            reporting_only += category_totals['reporting_only']

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
