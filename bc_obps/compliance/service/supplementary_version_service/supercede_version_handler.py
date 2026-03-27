from typing import Optional
from django.db import transaction
from compliance.models import ComplianceEarnedCredit, ComplianceObligation, ComplianceReport, ComplianceReportVersion
from compliance.service.compliance_obligation_service import ComplianceObligationService
from compliance.service.earned_credits_service import ComplianceEarnedCreditsService
from compliance.service.elicensing.elicensing_obligation_service import ElicensingObligationService
from reporting.models import ReportComplianceSummary
from compliance.service.supplementary_version_service.constants import ONE_DECIMAL, ZERO_DECIMAL
from compliance.service.supplementary_version_service.helpers import (
    get_previous_compliance_version_by_report_and_summary,
)


def obligation_has_no_invoice(previous_compliance_report_version: ComplianceReportVersion) -> bool:
    previous_obligation = ComplianceObligation.objects.get(compliance_report_version=previous_compliance_report_version)
    return (
        previous_compliance_report_version.status
        == ComplianceReportVersion.ComplianceStatus.OBLIGATION_PENDING_INVOICE_CREATION
        and previous_obligation.elicensing_invoice is None
    )


def earned_credits_not_issued(previous_compliance_report_version: ComplianceReportVersion) -> bool:
    previous_earned_credit = ComplianceEarnedCredit.objects.get(
        compliance_report_version=previous_compliance_report_version
    )
    return previous_earned_credit.issuance_status == ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED


# Concrete strategy for superceding compliance report versions when no binding action has occurred
# (invoice generated / earned credits requested or issued)
class SupercedeVersionHandler:
    @staticmethod
    def _all_ancestor_versions_are_superceded(compliance_report_version: ComplianceReportVersion) -> bool:
        """Check if all ancestor versions have a status of SUPERCEDED."""
        return (
            not ComplianceReportVersion.objects.filter(
                compliance_report_id=compliance_report_version.compliance_report_id
            )
            .exclude(id=compliance_report_version.id)
            .exclude(status=ComplianceReportVersion.ComplianceStatus.SUPERCEDED)
            .exists()
        )

    @staticmethod
    def can_handle(new_summary: ReportComplianceSummary, previous_summary: ReportComplianceSummary) -> bool:
        previous_compliance_report_version = ComplianceReportVersion.objects.get(
            report_compliance_summary=previous_summary
        )
        # Return False if any previous version ancestors have a status other than superceded
        if not SupercedeVersionHandler._all_ancestor_versions_are_superceded(previous_compliance_report_version):
            return False
        if previous_summary.excess_emissions > ZERO_DECIMAL:
            # Return True if the previous version has an obligation with no invoice
            return obligation_has_no_invoice(previous_compliance_report_version)
        if previous_summary.credited_emissions >= ONE_DECIMAL:
            # Return True if the previous version has earned credits that have not been requested
            return earned_credits_not_issued(previous_compliance_report_version)
        return False

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
        # Update previous version status to SUPERCEDED
        previous_compliance_version.status = ComplianceReportVersion.ComplianceStatus.SUPERCEDED
        previous_compliance_version.save(update_fields=['status'])

        # Create new version
        compliance_report_version = ComplianceReportVersion.objects.create(
            compliance_report=compliance_report,
            report_compliance_summary=new_summary,
            status=ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS,
            is_supplementary=True,
            previous_version=previous_compliance_version,
        )

        # Handle supercede obligation
        if previous_summary.excess_emissions > ZERO_DECIMAL:
            # Delete hanging superceded obligation record
            ComplianceObligation.objects.get(compliance_report_version=previous_compliance_version).delete()

        # Handle supercede earned credit
        if previous_summary.credited_emissions >= ONE_DECIMAL:
            # Delete hanging superceded earned credit record
            ComplianceEarnedCredit.objects.get(compliance_report_version=previous_compliance_version).delete()

        # Create new obligation record if new version has excess emissions
        if new_summary.excess_emissions > ZERO_DECIMAL:
            # Create new obligation
            obligation = ComplianceObligationService.create_compliance_obligation(
                compliance_report_version.id, new_summary.excess_emissions
            )
            ElicensingObligationService.handle_obligation_integration(
                obligation.id, compliance_report.compliance_period
            )

        # Create new earned credit record if new version has earned credits
        if new_summary.credited_emissions >= ONE_DECIMAL:
            ComplianceEarnedCreditsService.create_earned_credits_record(compliance_report_version)
            compliance_report_version.status = ComplianceReportVersion.ComplianceStatus.EARNED_CREDITS
            compliance_report_version.save()

        return compliance_report_version
