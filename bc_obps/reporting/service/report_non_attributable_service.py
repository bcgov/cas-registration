from reporting.models import ReportNonAttributableEmissions, GasType, EmissionCategory

from reporting.schema.report_non_attributable_emissions import ReportNonAttributableIn


class ReportNonAttributableService:
    @classmethod
    def get_report_non_attributable_by_version_id(cls, report_version_id: int) -> ReportNonAttributableEmissions:
        return ReportNonAttributableEmissions.objects.get(report_version__id=report_version_id)

    @classmethod
    def save_report_non_attributable_emissions(
        cls, version_id: int, data: ReportNonAttributableIn
    ) -> ReportNonAttributableEmissions:
        # Fetch the EmissionCategory instance
        emission_category = EmissionCategory.objects.get(category_name=data.emission_category)

        # Create a new report non-attributable emissions record
        report_non_attributable = ReportNonAttributableEmissions.objects.create(
            report_version_id=version_id,
            activity=data.activity,
            source_type=data.source_type,
            emission_category=emission_category,
        )

        # Set gas types for the report
        gas_types = GasType.objects.filter(chemical_formula__in=data.gas_type)  # Assuming data.gas_type contains IDs
        report_non_attributable.gas_type.set(gas_types)
        report_non_attributable.save()

        return report_non_attributable
