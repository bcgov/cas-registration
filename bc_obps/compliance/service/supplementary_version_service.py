from compliance.service.compliance_report_version_service import ComplianceReportVersionService
from reporting.models import ReportVersion, ReportComplianceSummary
from compliance.models.compliance_report import ComplianceReport
from compliance.models.compliance_report_version import ComplianceReportVersion
from compliance.service.compliance_obligation_service import ComplianceObligationService
from django.db import transaction
from decimal import Decimal
from typing import Protocol, Optional

# Define the strategy interface
class SupplementaryScenarioHandler(Protocol):
    def can_handle(self, new_summary: ReportComplianceSummary, previous_summary: ReportComplianceSummary) -> bool:
        ...

    def handle(
        self,
        compliance_report: ComplianceReport,
        new_summary: ReportComplianceSummary,
        previous_summary: ReportComplianceSummary,
        version_count: int,
    ) -> Optional[ComplianceReportVersion]:
        ...


# Concrete strategy for increased obligations
class IncreasedObligationHandler:
    def can_handle(self, new_summary: ReportComplianceSummary, previous_summary: ReportComplianceSummary) -> bool:
        # Return True if excess emissions increased from previous version
        if (
            new_summary.excess_emissions > Decimal('0')
            and previous_summary.excess_emissions < new_summary.excess_emissions
        ):
            return True
        return False

    def handle(
        self,
        compliance_report: ComplianceReport,
        new_summary: ReportComplianceSummary,
        previous_summary: ReportComplianceSummary,
        version_count: int,
    ) -> Optional[ComplianceReportVersion]:
        # Handle increased obligation logic
        excess_emission_delta = new_summary.excess_emissions - previous_summary.excess_emissions

        compliance_report_version = ComplianceReportVersion.objects.create(
            compliance_report=compliance_report,
            report_compliance_summary=new_summary,
            status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET,
            excess_emissions_delta_from_previous=excess_emission_delta,
            is_supplementary=True,
        )
        obligation = ComplianceObligationService.create_compliance_obligation(
            compliance_report_version.id, excess_emission_delta
        )

        # Integration operation - handle eLicensing integration
        # This is done outside of the main transaction to prevent rollback if integration fails
        transaction.on_commit(lambda: ComplianceReportVersionService._process_obligation_integration(obligation.id))
        return compliance_report_version


# # Concrete strategy for decreased obligations
# class DecreasedObligationHandler:
#     def can_handle(self, new_summary: ReportComplianceSummary, previous_summary: ReportComplianceSummary) -> bool:
#         # Return True if excess emissions decreased from previous version
#         return False # return False until implemented

#     def handle(self, compliance_report: ComplianceReport, new_summary: ReportComplianceSummary,
#                previous_summary: ReportComplianceSummary, version_count: int) -> Optional[ComplianceReportVersion]:
#         # Handle decreased obligation logic
#         pass

# # Concrete strategy for no significant change
# class NoChangeHandler:
#     def can_handle(self, new_summary: ReportComplianceSummary, previous_summary: ReportComplianceSummary) -> bool:
#         # Return True if no significant change in excess emissions
#         return False # return False until implemented

#     def handle(self, compliance_report: ComplianceReport, new_summary: ReportComplianceSummary,
#                previous_summary: ReportComplianceSummary, version_count: int) -> Optional[ComplianceReportVersion]:
#         # Return None - no action needed
#         pass

# # Concrete strategy for increased credits
# class IncreasedCreditHandler:
#     def can_handle(self, new_summary: ReportComplianceSummary, previous_summary: ReportComplianceSummary) -> bool:
#         # Return True if credited emissions increased from previous version
#         return False # return False until implemented

#     def handle(self, compliance_report: ComplianceReport, new_summary: ReportComplianceSummary,
#                previous_summary: ReportComplianceSummary, version_count: int) -> Optional[ComplianceReportVersion]:
#         # Handle increased credit logic
#         pass

# # Concrete strategy for decreased credits
# class DecreasedCreditHandler:
#     def can_handle(self, new_summary: ReportComplianceSummary, previous_summary: ReportComplianceSummary) -> bool:
#         # Return True if credited emissions decreased from previous version
#         return False # return False until implemented

#     def handle(self, compliance_report: ComplianceReport, new_summary: ReportComplianceSummary,
#                previous_summary: ReportComplianceSummary, version_count: int) -> Optional[ComplianceReportVersion]:
#         # Handle decreased credit logic
#         pass

# Main service becomes much cleaner
class SupplementaryVersionService:
    def __init__(self) -> None:
        self.handlers = [
            IncreasedObligationHandler(),
            # DecreasedObligationHandler(),
            # NoChangeHandler(),
            # IncreasedCreditHandler(),
            # DecreasedCreditHandler(),
        ]

    def handle_supplementary_version(
        self, compliance_report: ComplianceReport, report_version: ReportVersion, version_count: int
    ) -> Optional[ComplianceReportVersion]:
        report_versions = ReportVersion.objects.filter(report_id=report_version.report_id).order_by('-created_at')
        previous_version = report_versions[1]
        new_version_compliance_summary = ReportComplianceSummary.objects.get(report_version_id=report_version.id)
        previous_version_compliance_summary = ReportComplianceSummary.objects.get(report_version_id=previous_version.id)
        # Find the right handler and delegate
        for handler in self.handlers:
            if handler.can_handle(
                new_summary=new_version_compliance_summary, previous_summary=previous_version_compliance_summary
            ):
                return handler.handle(
                    compliance_report=compliance_report,
                    new_summary=new_version_compliance_summary,
                    previous_summary=previous_version_compliance_summary,
                    version_count=version_count,
                )
        return None
