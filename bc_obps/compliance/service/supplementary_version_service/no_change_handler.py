from typing import Optional
from compliance.models import ComplianceReport, ComplianceReportVersion
from reporting.models import ReportComplianceSummary
from compliance.service.supplementary_version_service.helpers import (
    get_previous_compliance_version_by_report_and_summary,
)


# Concrete strategy for no significant change
class NoChangeHandler:
    @staticmethod
    def can_handle(new_summary: ReportComplianceSummary, previous_summary: ReportComplianceSummary) -> bool:
        if (
            new_summary.excess_emissions == previous_summary.excess_emissions
            and new_summary.credited_emissions == previous_summary.credited_emissions
        ):
            return True
        return False

    @staticmethod
    def handle(
        compliance_report: ComplianceReport,
        new_summary: ReportComplianceSummary,
        previous_summary: ReportComplianceSummary,
        version_count: int,
    ) -> Optional[ComplianceReportVersion]:
        # Get the previous compliance report version
        previous_compliance_version = get_previous_compliance_version_by_report_and_summary(
            compliance_report, previous_summary
        )

        compliance_report_version = ComplianceReportVersion.objects.create(
            compliance_report=compliance_report,
            report_compliance_summary=new_summary,
            status=ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS,
            is_supplementary=True,
            previous_version=previous_compliance_version,
        )
        return compliance_report_version
