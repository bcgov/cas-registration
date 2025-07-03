from compliance.service.compliance_report_version_service import ComplianceReportVersionService
from reporting.models import ReportVersion, ReportComplianceSummary
from compliance.models.compliance_report import ComplianceReport
from compliance.models.compliance_report_version import ComplianceReportVersion
from compliance.service.compliance_obligation_service import ComplianceObligationService
from django.db import transaction
from decimal import Decimal


class SupplementaryVersionService:
    @staticmethod
    def _handle_increased_obligation(
        compliance_report: ComplianceReport,
        report_compliance_summary: ReportComplianceSummary,
        excess_emission_delta_from_previous: Decimal,
    ) -> ComplianceReportVersion:
        compliance_report_version = ComplianceReportVersion.objects.create(
            compliance_report=compliance_report,
            report_compliance_summary=report_compliance_summary,
            status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET,
            excess_emissions_delta_from_previous=excess_emission_delta_from_previous,
        )
        obligation = ComplianceObligationService.create_compliance_obligation(
            compliance_report_version.id, excess_emission_delta_from_previous
        )

        # Integration operation - handle eLicensing integration
        # This is done outside of the main transaction to prevent rollback if integration fails
        transaction.on_commit(lambda: ComplianceReportVersionService._process_obligation_integration(obligation.id))
        return compliance_report_version

    @classmethod
    @transaction.atomic
    def handle_supplementary_version(
        cls, compliance_report: ComplianceReport, report_version: ReportVersion, version_count: int
    ) -> ComplianceReportVersion | None:

        report_versions = ReportVersion.objects.filter(report_id=report_version.report_id).order_by('-created_at')
        previous_version = report_versions[1]
        new_version_compliance_summary = ReportComplianceSummary.objects.get(report_version_id=report_version.id)
        previous_version_compliance_summary = ReportComplianceSummary.objects.get(report_version_id=previous_version.id)
        new_version_excess_emissions = new_version_compliance_summary.excess_emissions
        previous_version_excess_emissions = previous_version_compliance_summary.excess_emissions

        ## Excess emissions increased from previous version
        if (
            new_version_excess_emissions > Decimal('0')
            and previous_version_excess_emissions < new_version_excess_emissions
        ):
            excess_emission_delta = new_version_excess_emissions - previous_version_excess_emissions
            compliance_report_version = cls._handle_increased_obligation(
                compliance_report=compliance_report,
                report_compliance_summary=new_version_compliance_summary,
                excess_emission_delta_from_previous=excess_emission_delta,
            )
            return compliance_report_version

        ## Add more supplementary report handling logic below ##
        return None
