from compliance.models.compliance_earned_credit import ComplianceEarnedCredit
from compliance.service.elicensing.elicensing_obligation_service import ElicensingObligationService
from reporting.models import ReportVersion, ReportComplianceSummary
from compliance.models import ComplianceReport, ComplianceEarnedCredit
from compliance.models.compliance_report_version import ComplianceReportVersion
from compliance.service.compliance_obligation_service import ComplianceObligationService
from compliance.service.compliance_adjustment_service import ComplianceAdjustmentService
from compliance.service.compliance_charge_rate_service import ComplianceChargeRateService
from django.db import transaction
from decimal import Decimal
from typing import Protocol, Optional
import logging

logger = logging.getLogger(__name__)


# Define the strategy interface
class SupplementaryScenarioHandler(Protocol):
    @staticmethod
    def can_handle(new_summary: ReportComplianceSummary, previous_summary: ReportComplianceSummary) -> bool:
        ...

    @staticmethod
    def handle(
        compliance_report: ComplianceReport,
        new_summary: ReportComplianceSummary,
        previous_summary: ReportComplianceSummary,
        version_count: int,
    ) -> Optional[ComplianceReportVersion]:
        ...


# Concrete strategy for increased obligations
class IncreasedObligationHandler:
    @staticmethod
    def can_handle(new_summary: ReportComplianceSummary, previous_summary: ReportComplianceSummary) -> bool:
        # Return True if excess emissions increased from previous version
        return (
            new_summary.excess_emissions > Decimal('0')
            and previous_summary.excess_emissions < new_summary.excess_emissions
        )

    @staticmethod
    def handle(
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
        # This is done outside the main transaction to prevent rollback if integration fails
        transaction.on_commit(lambda: ElicensingObligationService.process_obligation_integration(obligation.id))
        return compliance_report_version


# Concrete strategy for decreased obligations
class DecreasedObligationHandler:
    @staticmethod
    def can_handle(new_summary: ReportComplianceSummary, previous_summary: ReportComplianceSummary) -> bool:
        # Return True if excess emissions decreased from previous version
        return (
            previous_summary.excess_emissions > Decimal('0')
            and new_summary.excess_emissions < previous_summary.excess_emissions
        )

    @staticmethod
    def handle(
        compliance_report: ComplianceReport,
        new_summary: ReportComplianceSummary,
        previous_summary: ReportComplianceSummary,
        version_count: int,
    ) -> Optional[ComplianceReportVersion]:

        excess_emission_delta = new_summary.excess_emissions - previous_summary.excess_emissions

        # Calculate the dollar amount difference for the adjustment
        charge_rate = ComplianceChargeRateService.get_rate_for_year(new_summary.report_version.report.reporting_year)
        adjustment_amount = (excess_emission_delta * charge_rate).quantize(Decimal('0.01'))

        compliance_report_version = ComplianceReportVersion.objects.create(
            compliance_report=compliance_report,
            report_compliance_summary=new_summary,
            # using NO_OBLIGATION_OR_EARNED_CREDITS status because this report version is supplementary
            # and does not have an obligation
            status=ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS,
            excess_emissions_delta_from_previous=excess_emission_delta,
            is_supplementary=True,
        )

        # Get the previous compliance report version to create adjustment for
        previous_compliance_report_version = ComplianceReportVersion.objects.get(
            compliance_report=compliance_report,
            report_compliance_summary=previous_summary,
        )

        # Create adjustment in elicensing for the dollar amount difference
        # This is done outside the main transaction to prevent rollback if integration fails
        transaction.on_commit(
            lambda: ComplianceAdjustmentService.create_adjustment_for_target_version(
                target_compliance_report_version_id=previous_compliance_report_version.id,
                adjustment_total=adjustment_amount,
                supplementary_compliance_report_version_id=compliance_report_version.id,
            )
        )

        return compliance_report_version


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
        compliance_report_version = ComplianceReportVersion.objects.create(
            compliance_report=compliance_report,
            report_compliance_summary=new_summary,
            status=ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS,
            is_supplementary=True,
        )
        return compliance_report_version


# Concrete strategy for increased credits
class IncreasedCreditHandler:
    @staticmethod
    def can_handle(new_summary: ReportComplianceSummary, previous_summary: ReportComplianceSummary) -> bool:

        original_compliance_report_version = ComplianceReportVersion.objects.get(
            compliance_report=ComplianceReportVersion.objects.get(
                report_compliance_summary=previous_summary
            ).compliance_report,
            is_supplementary=False,
        )
        # Get the original earned credit record
        original_earned_credit_record = ComplianceEarnedCredit.objects.filter(
            compliance_report_version=original_compliance_report_version
        ).first()
        if not original_earned_credit_record:
            return False

        if (
            previous_summary.credited_emissions > Decimal('0')
            and new_summary.credited_emissions > previous_summary.credited_emissions
            and original_earned_credit_record.issuance_status
            == ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED
        ):
            return True
        return False

    @staticmethod
    @transaction.atomic()
    def handle(
        compliance_report: ComplianceReport,
        new_summary: ReportComplianceSummary,
        previous_summary: ReportComplianceSummary,
        version_count: int,
    ) -> Optional[ComplianceReportVersion]:
        # Increase the credits in the original earned_credit record by the appropriate amount
        earned_credit = ComplianceEarnedCredit.objects.get(
            compliance_report_version__compliance_report=compliance_report
        )

        credited_emission_delta = int(new_summary.credited_emissions - previous_summary.credited_emissions)
        earned_credit.earned_credits_amount = earned_credit.earned_credits_amount + credited_emission_delta
        earned_credit.save()

        # Create a compliance_report_version record with the 'no obligation or earned credits' status
        compliance_report_version = ComplianceReportVersion.objects.create(
            compliance_report=compliance_report,
            report_compliance_summary=new_summary,
            status=ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS,
            is_supplementary=True,
            credited_emissions_delta_from_previous=credited_emission_delta,
        )
        return compliance_report_version


# Concrete strategy for decreased credits
class DecreasedCreditHandler:
    @staticmethod
    def can_handle(new_summary: ReportComplianceSummary, previous_summary: ReportComplianceSummary) -> bool:
        # Return True if credited emissions decreased from previous version
        original_compliance_report_version = ComplianceReportVersion.objects.get(
            compliance_report=ComplianceReportVersion.objects.get(
                report_compliance_summary=previous_summary
            ).compliance_report,
            is_supplementary=False,
        )
        # Get the original earned credit record
        original_earned_credit_record = ComplianceEarnedCredit.objects.get(
            compliance_report_version=original_compliance_report_version
        )
        return (
            previous_summary.credited_emissions > Decimal('0')
            and new_summary.credited_emissions < previous_summary.credited_emissions
            and original_earned_credit_record.issuance_status
            == ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED
        )

    @staticmethod
    def handle(
        compliance_report: ComplianceReport,
        new_summary: ReportComplianceSummary,
        previous_summary: ReportComplianceSummary,
        version_count: int,
    ) -> Optional[ComplianceReportVersion]:

        # Create new version
        credited_emission_delta = int(new_summary.credited_emissions - previous_summary.credited_emissions)
        compliance_report_version = ComplianceReportVersion.objects.create(
            compliance_report=compliance_report,
            report_compliance_summary=new_summary,
            # using NO_OBLIGATION_OR_EARNED_CREDITS status because this report version is supplementary
            # and does not have an obligation
            status=ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS,
            credited_emissions_delta_from_previous=credited_emission_delta,
            is_supplementary=True,
        )
        # Get the original compliance report version
        original_compliance_report_version = ComplianceReportVersion.objects.get(
            compliance_report=compliance_report, is_supplementary=False
        )
        # Get the original earned credit record
        original_earned_credit_record = ComplianceEarnedCredit.objects.get(
            compliance_report_version=original_compliance_report_version
        )
        # Adjust original credits record by the delta
        original_earned_credit_record.earned_credits_amount = (
            original_earned_credit_record.earned_credits_amount + credited_emission_delta
        )
        original_earned_credit_record.save()

        return compliance_report_version


# Main service becomes much cleaner
class SupplementaryVersionService:
    def __init__(self) -> None:
        self.handlers: list[SupplementaryScenarioHandler] = [
            IncreasedObligationHandler(),
            DecreasedObligationHandler(),
            NoChangeHandler(),
            IncreasedCreditHandler(),
            DecreasedCreditHandler(),
        ]

    def handle_supplementary_version(
        self, compliance_report: ComplianceReport, report_version: ReportVersion, version_count: int
    ) -> Optional[ComplianceReportVersion]:

        # Get the previous version (lower ID = older)
        previous_version = (
            ReportVersion.objects.filter(report_id=report_version.report_id, id__lt=report_version.id)
            .order_by('-id')
            .first()
        )  # Get the most recent one that's older

        if not previous_version:
            logger.error(f"No previous version found for report version {report_version.id}")
            return None  # No previous version exists

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
        logger.error(
            f"No handler found for report version {report_version.id} and compliance report {compliance_report.id}"
        )
        return None
