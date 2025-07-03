from reporting.models import ReportVersion
from compliance.models import ComplianceReportVersion
from django.db import transaction
from decimal import Decimal


class SupplementaryVersionService:

    @staticmethod
    def _handle_increased_obligation(report_version:ReportVersion, excess_emission_delta_from_previous: Decimal) -> None:
        print('HANDLE NEW OBLIGATION HERE')

    @classmethod
    @transaction.atomic
    def handle_supplementary_version(
        cls, report_version: ReportVersion, version_count: int
    ) -> ComplianceReportVersion:

        report_versions = ReportVersion.objects.filter(report_id=report_version.report_id).order_by('-created_at')
        previous_version = report_versions[1]
        new_version_excess_emissions = report_version.report_compliance_summary.excess_emissions
        previous_version_excess_emissions = previous_version.report_compliance_summary.excess_emissions

        ## Excess emissions increased from previous version
        if new_version_excess_emissions > Decimal('0') and previous_version_excess_emissions < new_version_excess_emissions:
            excess_emission_delta = new_version_excess_emissions - previous_version_excess_emissions
            cls._handle_increased_obligation(report_version=report_version, excess_emission_delta_from_previous = excess_emission_delta)
