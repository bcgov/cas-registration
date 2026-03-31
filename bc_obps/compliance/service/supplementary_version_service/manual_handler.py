from typing import Optional
from django.db import transaction
from compliance.models import ComplianceReport, ComplianceReportVersion
from compliance.models.compliance_report_version_manual_handling import ComplianceReportVersionManualHandling
from reporting.models import ReportComplianceSummary
from compliance.service.supplementary_version_service.helpers import (
    get_previous_compliance_version_by_report_and_summary,
)


# Concrete strategy for:
# - Detecting when a previous CRV has a manual-handling record, and
# - Creating a new supplementary REQUIRES_MANUAL_HANDLING CRV
#   carrying forward the handling_type/context from the previous record.
class ManualHandler:
    @staticmethod
    def can_handle(
        new_summary: ReportComplianceSummary,
        previous_summary: ReportComplianceSummary,
    ) -> bool:
        """
        This handler applies when the *previous* compliance report version has a manual-handling record
        """
        previous_crv = ComplianceReportVersion.objects.get(report_compliance_summary=previous_summary)

        # Use the existence of the one-to-one manual_handling_record
        return ComplianceReportVersionManualHandling.objects.filter(compliance_report_version=previous_crv).exists()

    @staticmethod
    @transaction.atomic()
    def handle(
        compliance_report: ComplianceReport,
        new_summary: ReportComplianceSummary,
        previous_summary: ReportComplianceSummary,
        version_count: int,
    ) -> Optional[ComplianceReportVersion]:
        """
        Create a new supplementary REQUIRES_MANUAL_HANDLING CRV and an
        associated manual-handling record when the previous CRV has a manual-handling record

        Assumptions:
        - The previous CRV's manual_handling_record exists
        - We carry forward handling_type/context to the new record, but do not
          copy analyst or director comments/dates.
        """

        # Get the previous compliance report version
        previous_compliance_version = get_previous_compliance_version_by_report_and_summary(
            compliance_report, previous_summary
        )

        # Fetch its manual-handling record
        previous_manual_handling = previous_compliance_version.manual_handling_record

        # Create the new supplementary CRV
        compliance_report_version = ComplianceReportVersion.objects.create(
            compliance_report=compliance_report,
            report_compliance_summary=new_summary,
            status=ComplianceReportVersion.ComplianceStatus.REQUIRES_MANUAL_HANDLING,
            is_supplementary=True,
            previous_version=previous_compliance_version,
        )

        # Create a new manual-handling record for the new CRV.
        ComplianceReportVersionManualHandling.objects.create(
            compliance_report_version=compliance_report_version,
            handling_type=previous_manual_handling.handling_type,
            context=previous_manual_handling.context,
        )

        return compliance_report_version
