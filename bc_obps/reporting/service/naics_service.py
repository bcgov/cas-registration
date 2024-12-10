from reporting.models import NaicsRegulatoryValue, ReportVersion
from reporting.schema.compliance_data import RegulatoryValueSchema


class NaicsService:
    @classmethod
    def get_regulatory_values_by_naics_code(cls, report_version_id: int) -> RegulatoryValueSchema:
        data = ReportVersion.objects.select_related('report__operation').get(pk=report_version_id)
        naics_code_id = data.report.operation.naics_code_id
        compliance_year = data.report.reporting_year.reporting_year
        regulatory_values = NaicsRegulatoryValue.objects.get(
            naics_code_id=naics_code_id,
            valid_from__lte=data.report.reporting_year.reporting_window_start,
            valid_to__gte=data.report.reporting_year.reporting_window_end,
        )

        return RegulatoryValueSchema(
            reduction_factor=regulatory_values.reduction_factor,
            tightening_rate=regulatory_values.tightening_rate,
            initial_compliance_period=2024,
            compliance_period=compliance_year,
        )
