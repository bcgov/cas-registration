from typing import Optional
from django.db import transaction
from compliance.models import ComplianceEarnedCredit, ComplianceReport, ComplianceReportVersion
from compliance.models.compliance_report_version_manual_handling import ComplianceReportVersionManualHandling
from compliance.service.earned_credits_service import ComplianceEarnedCreditsService
from reporting.models import ReportComplianceSummary
from compliance.service.supplementary_version_service.constants import ONE_DECIMAL
from compliance.service.supplementary_version_service.helpers import (
    get_previous_compliance_version_by_report_and_summary,
)


# Concrete strategy for decreased credits
class DecreasedCreditHandler:
    @staticmethod
    def can_handle(new_summary: ReportComplianceSummary, previous_summary: ReportComplianceSummary) -> bool:
        # Return True if credited emissions decreased from previous version
        previous_compliance_report_version = ComplianceReportVersion.objects.get(
            report_compliance_summary=previous_summary,
        )
        # Get the original earned credit record
        previous_earned_credit_record = ComplianceEarnedCredit.objects.filter(
            compliance_report_version=previous_compliance_report_version
        ).first()
        if not previous_earned_credit_record:
            return False

        return (
            previous_summary.credited_emissions >= ONE_DECIMAL
            and new_summary.credited_emissions < previous_summary.credited_emissions
        )

    @staticmethod
    @transaction.atomic()
    def handle(
        compliance_report: ComplianceReport,
        new_summary: ReportComplianceSummary,
        previous_summary: ReportComplianceSummary,
        version_count: int,
    ) -> Optional[ComplianceReportVersion]:

        credited_emission_delta = int(new_summary.credited_emissions - previous_summary.credited_emissions)
        previous_compliance_version = get_previous_compliance_version_by_report_and_summary(
            compliance_report, previous_summary
        )
        # Create a compliance_report_version record with the 'earned credits' status (status will change if credits not requested)
        compliance_report_version = ComplianceReportVersion.objects.create(
            compliance_report=compliance_report,
            report_compliance_summary=new_summary,
            status=ComplianceReportVersion.ComplianceStatus.EARNED_CREDITS,
            credited_emissions_delta_from_previous=credited_emission_delta,
            is_supplementary=True,
            previous_version=previous_compliance_version,
        )
        # Get the previous earned_credit record
        previous_earned_credit = ComplianceEarnedCredit.objects.get(
            compliance_report_version=previous_compliance_version
        )

        # Previously approved → flag manual handling, do not mutate/move prior credit
        if previous_earned_credit.issuance_status == ComplianceEarnedCredit.IssuanceStatus.APPROVED:
            # Create manual-handling record for this supplementary report
            ComplianceReportVersionManualHandling.objects.create(
                compliance_report_version=compliance_report_version,
                handling_type=ComplianceReportVersionManualHandling.HandlingType.EARNED_CREDITS,
                context=ComplianceReportVersionManualHandling.Context.EARNED_CREDITS_PREVIOUSLY_APPROVED,
            )

            return compliance_report_version

        # if credits weren't requested, update the previous earned credit record
        if previous_earned_credit.issuance_status == ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED:

            previous_earned_credit.earned_credits_amount = (
                previous_earned_credit.earned_credits_amount + credited_emission_delta
            )
            previous_earned_credit.save()

            compliance_report_version.status = ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS
            compliance_report_version.save()

            return compliance_report_version

        # if credits were requested, create a new earned credit record and decline the old one
        ComplianceEarnedCreditsService.create_earned_credits_record(compliance_report_version)
        previous_earned_credit.issuance_status = ComplianceEarnedCredit.IssuanceStatus.DECLINED
        previous_earned_credit.supplementary_declined = True
        previous_earned_credit.save()

        return compliance_report_version
