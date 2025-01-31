from reporting.models import EmissionCategory
from reporting.models.report_emission import ReportEmission
from decimal import Decimal
from django.db.models import Sum, OuterRef, Subquery
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

    # Methods by version (below) work for SFO and LFO total summaries, but not for summaries for individual facilities of an LFO
    @staticmethod
    def get_total_emissions_by_emission_category_and_version(
        version_id: int, emission_category_id: int
    ) -> Decimal | int:
        records = ReportEmission.objects_with_decimal_emissions.filter(
            report_version_id=version_id,
            emission_categories__id=emission_category_id,
        )
        category_sum = records.aggregate(emission_sum=Sum('emission'))

        return category_sum['emission_sum'] or 0

    @staticmethod
    def get_reporting_only_emissions_by_version(version_id: int) -> Decimal | int:
        # Fugitive, fuel_excluded, other_excluded
        records = ReportEmission.objects_with_decimal_emissions.filter(
            report_version_id=version_id,
            emission_categories__id__in=[2, 10, 11, 12, 13, 14],
        ).distinct()

        total_reporting_only = records.aggregate(emission_sum=Sum('emission'))
        return total_reporting_only['emission_sum'] or 0

    @staticmethod
    def get_all_category_totals_by_version(version_id: int) -> Dict[str, Decimal | int]:
        totals = EmissionCategory.objects.annotate(
            total=Subquery(
                ReportEmission.objects_with_decimal_emissions.filter(
                    report_version_id=version_id, emission_categories__id=OuterRef("id")
                )
                .values("emission_categories__id")
                .annotate(emission_sum=Sum("emission"))
                .values("emission_sum")[:1]
            )
        ).values("id", "total")
        totals_dict = {t["id"]: t["total"] or Decimal(0) for t in list(totals)}

        # BASIC
        flaring_total = totals_dict[1]
        fugitive_total = totals_dict[2]
        industrial_process_total = totals_dict[3]
        onsite_transportation_total = totals_dict[4]
        stationary_combustion_total = totals_dict[5]
        venting_useful_total = totals_dict[6]
        venting_non_useful_total = totals_dict[7]
        waste_total = totals_dict[8]
        wastewater_total = totals_dict[9]

        # FUEL EXCLUDED
        woody_biomass_total = totals_dict[10]
        excluded_biomass_total = totals_dict[11]
        excluded_non_biomass_total = totals_dict[12]

        # OTHER EXCLUDED
        lfo_excluded_total = totals_dict[13]

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
        reporting_only = EmissionCategoryService.get_reporting_only_emissions_by_version(version_id)

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
    def transform_category_totals_to_summary_form_data(cls, emission_totals: Dict[str, Decimal | int]) -> dict:
        return {
            'attributable_for_reporting': emission_totals['attributable_for_reporting'],
            'attributable_for_reporting_threshold': emission_totals['attributable_for_threshold'],
            'reporting_only_emission': emission_totals['reporting_only'],
            'emission_categories': {
                'flaring': emission_totals['flaring'],
                'fugitive': emission_totals['fugitive'],
                'industrial_process': emission_totals['industrial_process'],
                'onsite_transportation': emission_totals['onsite'],
                'stationary_combustion': emission_totals['stationary'],
                'venting_useful': emission_totals['venting_useful'],
                'venting_non_useful': emission_totals['venting_non_useful'],
                'waste': emission_totals['waste'],
                'wastewater': emission_totals['wastewater'],
            },
            'fuel_excluded': {
                'woody_biomass': emission_totals['woody_biomass'],
                'excluded_biomass': emission_totals['excluded_biomass'],
                'excluded_non_biomass': emission_totals['excluded_non_biomass'],
            },
            'other_excluded': {
                'lfo_excluded': emission_totals['lfo_excluded'],
                'fog_excluded': 0,  # To be handled once we implement a way to capture FOG emissions
            },
        }

    @classmethod
    def get_operation_emission_summary_form_data(cls, version_id: int) -> dict:
        emission_totals = EmissionCategoryService.get_all_category_totals_by_version(version_id)
        return EmissionCategoryService.transform_category_totals_to_summary_form_data(emission_totals)

    @classmethod
    def get_facility_emission_summary_form_data(cls, facility_report_id: int) -> dict:
        emission_totals = EmissionCategoryService.get_all_category_totals(facility_report_id)
        return EmissionCategoryService.transform_category_totals_to_summary_form_data(emission_totals)
