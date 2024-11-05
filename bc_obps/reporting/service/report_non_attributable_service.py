from typing import List
from uuid import UUID

from reporting.models import ReportNonAttributableEmissions, GasType, EmissionCategory, ReportVersion, FacilityReport

from reporting.schema.report_non_attributable_emissions import ReportNonAttributableIn


class ReportNonAttributableService:
    @classmethod
    def get_report_non_attributable_by_version_id(
        cls, report_version_id: int, facility_id: UUID
    ) -> List[ReportNonAttributableEmissions]:
        facility_report = FacilityReport.objects.get(report_version_id=report_version_id, facility_id=facility_id)
        return list(ReportNonAttributableEmissions.objects.filter(facility_report=facility_report))

    @classmethod
    def save_report_non_attributable_emissions(
        cls, version_id: int, facility_id: UUID, data: ReportNonAttributableIn
    ) -> ReportNonAttributableEmissions:
        report_version = ReportVersion.objects.get(pk=version_id)
        facility_report = FacilityReport.objects.get(report_version=report_version, facility_id=facility_id)
        emission_category = EmissionCategory.objects.get(category_name=data.emission_category)

        report_non_attributable, created = ReportNonAttributableEmissions.objects.update_or_create(
            id=data.id if data.id else None,
            defaults={
                "report_version": report_version,
                "facility_report": facility_report,
                "activity": data.activity,
                "source_type": data.source_type,
                "emission_category": emission_category,
            },
        )

        gas_types = GasType.objects.filter(chemical_formula__in=data.gas_type)
        report_non_attributable.gas_type.set(gas_types)
        report_non_attributable.save()

        return report_non_attributable
