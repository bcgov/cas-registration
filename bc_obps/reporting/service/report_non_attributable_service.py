from typing import List

from reporting.models import ReportNonAttributableEmissions, GasType, EmissionCategory

from reporting.schema.report_non_attributable_emissions import ReportNonAttributableIn


class ReportNonAttributableService:
    @classmethod
    def get_report_non_attributable_by_version_id(cls, report_version_id: int) -> List[ReportNonAttributableEmissions]:
        return list(ReportNonAttributableEmissions.objects.filter(report_version__id=report_version_id))

    @classmethod
    def save_report_non_attributable_emissions(
        cls, version_id: int, data: ReportNonAttributableIn
    ) -> ReportNonAttributableEmissions:
        emission_category = EmissionCategory.objects.get(category_name=data.emission_category)

        report_non_attributable, created = ReportNonAttributableEmissions.objects.update_or_create(
            id=data.id if data.id else None,
            defaults={
                "report_version_id": version_id,
                "activity": data.activity,
                "source_type": data.source_type,
                "emission_category": emission_category,
            },
        )

        gas_types = GasType.objects.filter(chemical_formula__in=data.gas_type)
        report_non_attributable.gas_type.set(gas_types)
        report_non_attributable.save()

        return report_non_attributable
