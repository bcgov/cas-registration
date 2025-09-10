from reporting.models import ReportVersion, ReportComplianceSummary
from compliance.models import ComplianceReport, ComplianceEarnedCredit
from compliance.models.compliance_report_version import ComplianceReportVersion
from compliance.models.compliance_obligation import ComplianceObligation
from compliance.models.elicensing_invoice import ElicensingInvoice
from compliance.service.compliance_obligation_service import ComplianceObligationService
from compliance.service.compliance_adjustment_service import ComplianceAdjustmentService
from compliance.service.compliance_charge_rate_service import ComplianceChargeRateService
from compliance.service.elicensing.elicensing_obligation_service import ElicensingObligationService
from compliance.service.earned_credits_service import ComplianceEarnedCreditsService

from django.db import transaction
from decimal import Decimal
from typing import Protocol, Optional
import logging

logger = logging.getLogger(__name__)

# Constants
ZERO_DECIMAL = Decimal('0')


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
            new_summary.excess_emissions > ZERO_DECIMAL
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
        previous_compliance_version = (
            SupplementaryVersionService._get_previous_compliance_version_by_report_and_summary(
                compliance_report, previous_summary
            )
        )

        compliance_report_version = ComplianceReportVersion.objects.create(
            compliance_report=compliance_report,
            report_compliance_summary=new_summary,
            status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET,
            excess_emissions_delta_from_previous=excess_emission_delta,
            is_supplementary=True,
            previous_version=previous_compliance_version,
        )
        obligation = ComplianceObligationService.create_compliance_obligation(
            compliance_report_version.id, excess_emission_delta
        )
        ElicensingObligationService.handle_obligation_integration(obligation.id, compliance_report.compliance_period)
        return compliance_report_version


# Concrete strategy for decreased obligations
class DecreasedObligationHandler:
    @staticmethod
    def can_handle(new_summary: ReportComplianceSummary, previous_summary: ReportComplianceSummary) -> bool:
        # Return True if excess emissions decreased from previous version
        return (
            previous_summary.excess_emissions > ZERO_DECIMAL
            and new_summary.excess_emissions < previous_summary.excess_emissions
        )

    @staticmethod
    def handle(
        compliance_report: ComplianceReport,
        new_summary: ReportComplianceSummary,
        previous_summary: ReportComplianceSummary,
        version_count: int,
    ) -> Optional[ComplianceReportVersion]:
        """
        Handle a supplementary decrease in obligation:
        - Get previous `ComplianceReportVersion`
        - Create a related supplementary `ComplianceReportVersion`
        - Compute the monetary adjustment based on path:
        - If 0 < new_excess < previous_excess:
            adjustment_amount = (new_excess - previous_excess) × charge_rate
        - If new_excess ≤ 0:
            adjustment_amount = -(previous_excess × charge_rate)  # refund to zero
        - Schedule the eLicensing adjustment for adjustment_amount on transaction commit
        - If resulting obligation ≤ 0:
           mark the previous version fully met
           void any unpaid invoice
        - If resulting obligation < 0:
           create earned credits for the supplementary `ComplianceReportVersion`
        """
        excess_emission_delta = new_summary.excess_emissions - previous_summary.excess_emissions

        # Calculate the dollar amount difference for the adjustment
        charge_rate = ComplianceChargeRateService.get_rate_for_year(new_summary.report_version.report.reporting_year)
        adjustment_amount = (excess_emission_delta * charge_rate).quantize(Decimal('0.01'))

        # Get the previous compliance report version to create adjustment for
        previous_compliance_version = (
            SupplementaryVersionService._get_previous_compliance_version_by_report_and_summary(
                compliance_report, previous_summary
            )
        )

        compliance_report_version = ComplianceReportVersion.objects.create(
            compliance_report=compliance_report,
            report_compliance_summary=new_summary,
            # using NO_OBLIGATION_OR_EARNED_CREDITS status because this report version is supplementary
            # and does not have an obligation
            status=ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS,
            excess_emissions_delta_from_previous=excess_emission_delta,
            is_supplementary=True,
            previous_version=previous_compliance_version,
        )

        # Overrides for the less-likely paths
        mark_previous_fully_met = False
        create_earned_credits = False
        if new_summary.excess_emissions == ZERO_DECIMAL:
            # Full refund to zero: previous * rate (negative)
            adjustment_amount = (-previous_summary.excess_emissions * charge_rate).quantize(Decimal('0.01'))
            mark_previous_fully_met = True
        elif new_summary.excess_emissions < ZERO_DECIMAL:
            # Refund only up to zero: previous * rate (negative)
            adjustment_amount = (-previous_summary.excess_emissions * charge_rate).quantize(Decimal('0.01'))
            mark_previous_fully_met = True
            create_earned_credits = True

        # Create adjustment in elicensing for the dollar amount difference
        # This is done outside the main transaction to prevent rollback if integration fails
        def _after_commit(
            pv_id=previous_compliance_version.id,
            amt=adjustment_amount,
            crv_id=compliance_report_version.id,
            mark=mark_previous_fully_met,
            do_credits=create_earned_credits,
        ):
            # 1) Post the refund/credit adjustment
            ComplianceAdjustmentService.create_adjustment_for_target_version(
                target_compliance_report_version_id=pv_id,
                adjustment_total=amt,
                supplementary_compliance_report_version_id=crv_id,
            )

            # 2) If applicable, mark previous CRV fully met and void invoice
            if mark:
                ComplianceReportVersion.objects.filter(id=pv_id).update(
                    status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_FULLY_MET
                )
                ElicensingInvoice.objects.filter(
                    compliance_obligation__compliance_report_version_id=pv_id,
                    is_void=False,
                ).exclude(compliance_obligation__penalty_status=ComplianceObligation.PenaltyStatus.PAID).update(
                    is_void=True
                )

            # 3) If we’re below zero, create/update the CRV earned-credit record
            if do_credits:
                ComplianceEarnedCreditsService.create_earned_credits_record(
                    compliance_report_version=compliance_report_version
                )

        transaction.on_commit(_after_commit)

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
        # Get the previous compliance report version
        previous_compliance_version = (
            SupplementaryVersionService._get_previous_compliance_version_by_report_and_summary(
                compliance_report, previous_summary
            )
        )

        compliance_report_version = ComplianceReportVersion.objects.create(
            compliance_report=compliance_report,
            report_compliance_summary=new_summary,
            status=ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS,
            is_supplementary=True,
            previous_version=previous_compliance_version,
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
            ZERO_DECIMAL < previous_summary.credited_emissions < new_summary.credited_emissions
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

        # Get the previous compliance report version
        previous_compliance_version = (
            SupplementaryVersionService._get_previous_compliance_version_by_report_and_summary(
                compliance_report, previous_summary
            )
        )

        # Create a compliance_report_version record with the 'no obligation or earned credits' status
        compliance_report_version = ComplianceReportVersion.objects.create(
            compliance_report=compliance_report,
            report_compliance_summary=new_summary,
            status=ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS,
            credited_emissions_delta_from_previous=credited_emission_delta,
            is_supplementary=True,
            previous_version=previous_compliance_version,
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
        original_earned_credit_record = ComplianceEarnedCredit.objects.filter(
            compliance_report_version=original_compliance_report_version
        ).first()
        if not original_earned_credit_record:
            return False
        return (
            previous_summary.credited_emissions > ZERO_DECIMAL
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

        credited_emission_delta = int(new_summary.credited_emissions - previous_summary.credited_emissions)
        previous_compliance_version = (
            SupplementaryVersionService._get_previous_compliance_version_by_report_and_summary(
                compliance_report, previous_summary
            )
        )
        compliance_report_version = ComplianceReportVersion.objects.create(
            compliance_report=compliance_report,
            report_compliance_summary=new_summary,
            # using NO_OBLIGATION_OR_EARNED_CREDITS status because this report version is supplementary
            # and does not have an obligation
            status=ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS,
            credited_emissions_delta_from_previous=credited_emission_delta,
            is_supplementary=True,
            previous_version=previous_compliance_version,
        )
        # Get the original compliance report version
        original_compliance_report_version = ComplianceReportVersion.objects.get(
            compliance_report=compliance_report, is_supplementary=False
        )
        # Get the original earned credit record
        original_earned_credit_record = original_compliance_report_version.compliance_earned_credit
        # Adjust original credits record by the delta
        original_earned_credit_record.earned_credits_amount = (
            original_earned_credit_record.earned_credits_amount + credited_emission_delta
        )
        original_earned_credit_record.save(update_fields=['earned_credits_amount'])

        return compliance_report_version


class SupplementaryVersionService:
    def __init__(self) -> None:
        self.handlers: list[SupplementaryScenarioHandler] = [
            IncreasedObligationHandler(),
            DecreasedObligationHandler(),
            NoChangeHandler(),
            IncreasedCreditHandler(),
            DecreasedCreditHandler(),
        ]

    @staticmethod
    def _get_previous_compliance_version_by_report_and_summary(
        compliance_report: ComplianceReport, previous_summary: ReportComplianceSummary
    ) -> ComplianceReportVersion:
        return ComplianceReportVersion.objects.get(
            compliance_report=compliance_report,
            report_compliance_summary=previous_summary,
        )

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
