from reporting.models import EmissionCategory
from typing import List


class EmissionCategoryService:
    @classmethod
    def get_all_emission_categories(cls) -> List[EmissionCategory]:
        return list(EmissionCategory.objects.all())
from reporting.models.report_emission import ReportEmission
from decimal import Decimal
from django.db.models import Sum


class EmissionCategoryService:
    """
    Service that applies an emission category to an emission based on the reported activity, source_type and in the case of fuel_excluded categories, fuel_classification
    """

    @staticmethod
    def get_flaring_emission_category_total(facility_report_id: int) -> Decimal:
        flaring_records = ReportEmission.objects_with_decimal_emissions.filter(
            report_source_type__report_activity__facility_report_id=facility_report_id, emission_categories__id=1
        )
        x = flaring_records.aggregate(emission_sum=Sum('emission'))
        return Decimal(x['emission_sum'])
