from typing import Optional
from django.db import transaction
from compliance.models import ComplianceEarnedCredit, ComplianceReport, ComplianceReportVersion
from compliance.service.earned_credits_service import ComplianceEarnedCreditsService
from reporting.models import ReportComplianceSummary
from compliance.service.supplementary_version_service.constants import ONE_DECIMAL
from compliance.service.supplementary_version_service.helpers import (
    get_previous_compliance_version_by_report_and_summary,
)


# Concrete strategy for new earned credits (no previous obligation or earned credits)
class NewEarnedCreditsHandler:
    @staticmethod
    def can_handle(new_summary: ReportComplianceSummary, previous_summary: ReportComplianceSummary) -> bool:
        # Return True if previous version had no earned credits and new version has earned credits
        previous_compliance_report_version = ComplianceReportVersion.objects.get(
            report_compliance_summary=previous_summary,
        )
        previous_earned_credit_record = ComplianceEarnedCredit.objects.filter(
            compliance_report_version=previous_compliance_report_version
        ).first()
        if previous_earned_credit_record:
            return False
        # Credits below ONE_DECIMAL are never issued, so both 0 and 0 < x < 1 mean "no previous earned credits"
        return previous_summary.credited_emissions < ONE_DECIMAL and new_summary.credited_emissions >= ONE_DECIMAL

    @staticmethod
    @transaction.atomic()
    def handle(
        compliance_report: ComplianceReport,
        new_summary: ReportComplianceSummary,
        previous_summary: ReportComplianceSummary,
        version_count: int,
    ) -> Optional[ComplianceReportVersion]:
        previous_compliance_version = get_previous_compliance_version_by_report_and_summary(
            compliance_report, previous_summary
        )

        credited_emission_delta = int(new_summary.credited_emissions - previous_summary.credited_emissions)
        compliance_report_version = ComplianceReportVersion.objects.create(
            compliance_report=compliance_report,
            report_compliance_summary=new_summary,
            status=ComplianceReportVersion.ComplianceStatus.EARNED_CREDITS,
            credited_emissions_delta_from_previous=credited_emission_delta,
            is_supplementary=True,
            previous_version=previous_compliance_version,
        )

        ComplianceEarnedCreditsService.create_earned_credits_record(compliance_report_version)

        return compliance_report_version
