from typing import Optional
from django.db import transaction
from compliance.models import ComplianceEarnedCredit, ComplianceReport, ComplianceReportVersion
from compliance.service.earned_credits_service import ComplianceEarnedCreditsService
from reporting.models import ReportComplianceSummary
from compliance.service.supplementary_version_service.constants import ONE_DECIMAL
from compliance.service.supplementary_version_service.helpers import (
    get_previous_compliance_version_by_report_and_summary,
)


# Concrete strategy for increased credits
class IncreasedCreditHandler:
    @staticmethod
    def can_handle(new_summary: ReportComplianceSummary, previous_summary: ReportComplianceSummary) -> bool:
        previous_compliance_report_version = ComplianceReportVersion.objects.get(
            report_compliance_summary=previous_summary
        )
        # Get the previous earned credit record
        previous_earned_credit_record = ComplianceEarnedCredit.objects.filter(
            compliance_report_version=previous_compliance_report_version
        ).first()

        if not previous_earned_credit_record:
            return False
        # Return True if excess emissions increased from previous version
        return ONE_DECIMAL <= previous_summary.credited_emissions < new_summary.credited_emissions

    @staticmethod
    @transaction.atomic()
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
        # Get the previous earned_credit record
        previous_earned_credit = ComplianceEarnedCredit.objects.get(
            compliance_report_version=previous_compliance_version
        )

        credited_emission_delta = int(new_summary.credited_emissions - previous_summary.credited_emissions)
        # Create a compliance_report_version record with the 'earned credits' status (status will change if credits not requested)
        compliance_report_version = ComplianceReportVersion.objects.create(
            compliance_report=compliance_report,
            report_compliance_summary=new_summary,
            status=ComplianceReportVersion.ComplianceStatus.EARNED_CREDITS,
            credited_emissions_delta_from_previous=credited_emission_delta,
            is_supplementary=True,
            previous_version=previous_compliance_version,
        )

        if previous_earned_credit.issuance_status == ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED:
            previous_earned_credit.earned_credits_amount = (
                previous_earned_credit.earned_credits_amount + credited_emission_delta
            )
            previous_earned_credit.save()
            compliance_report_version.status = ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS
            compliance_report_version.save()

        if previous_earned_credit.issuance_status == ComplianceEarnedCredit.IssuanceStatus.APPROVED:
            ComplianceEarnedCreditsService.create_earned_credits_record(
                compliance_report_version, credited_emission_delta
            )
        if previous_earned_credit.issuance_status in (
            ComplianceEarnedCredit.IssuanceStatus.DECLINED,
            ComplianceEarnedCredit.IssuanceStatus.ISSUANCE_REQUESTED,
            ComplianceEarnedCredit.IssuanceStatus.CHANGES_REQUIRED,
        ):
            # since no amount arg is provided, it will be taken from the report version's credited emissions
            ComplianceEarnedCreditsService.create_earned_credits_record(compliance_report_version)

            # If previously requested, mark it as declined
            if previous_earned_credit.issuance_status in (
                ComplianceEarnedCredit.IssuanceStatus.ISSUANCE_REQUESTED,
                ComplianceEarnedCredit.IssuanceStatus.CHANGES_REQUIRED,
            ):
                previous_earned_credit.issuance_status = ComplianceEarnedCredit.IssuanceStatus.DECLINED
                previous_earned_credit.supplementary_declined = True
                previous_earned_credit.save()

        return compliance_report_version
