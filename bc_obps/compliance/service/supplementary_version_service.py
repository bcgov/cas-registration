from reporting.models import ReportVersion, ReportComplianceSummary
from compliance.models.elicensing_invoice import ElicensingInvoice
from compliance.models.elicensing_adjustment import ElicensingAdjustment
from compliance.models import ComplianceReport, ComplianceEarnedCredit, ComplianceReportVersion, ComplianceObligation
from compliance.service.compliance_obligation_service import ComplianceObligationService
from compliance.service.compliance_adjustment_service import ComplianceAdjustmentService
from compliance.service.compliance_charge_rate_service import ComplianceChargeRateService
from compliance.service.elicensing.elicensing_obligation_service import ElicensingObligationService
from compliance.service.earned_credits_service import ComplianceEarnedCreditsService
from compliance.service.elicensing.elicensing_data_refresh_service import ElicensingDataRefreshService

from django.db import transaction
from decimal import Decimal
from typing import Protocol, Optional
import logging

logger = logging.getLogger(__name__)

# Constants
ZERO_DECIMAL = Decimal('0')
MONEY = Decimal("0.01")
EMISS = Decimal("0.0000")


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


# Concrete strategy for superceding compliance report versions when no binding action has occurred (invoice generated / earned credits requested or issued)
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
            return SupplementaryVersionService._obligation_has_no_invoice(previous_compliance_report_version)
        if previous_summary.credited_emissions > ZERO_DECIMAL:
            # Return True if the previous version has earned credits that have not been requested
            return SupplementaryVersionService._earned_credits_not_issued(previous_compliance_report_version)
        return False

    @staticmethod
    def handle(
        compliance_report: ComplianceReport,
        new_summary: ReportComplianceSummary,
        previous_summary: ReportComplianceSummary,
        version_count: int,
    ) -> Optional[ComplianceReportVersion]:

        previous_compliance_version = (
            SupplementaryVersionService._get_previous_compliance_version_by_report_and_summary(
                compliance_report, previous_summary
            )
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
        if previous_summary.credited_emissions > ZERO_DECIMAL:
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
        if new_summary.credited_emissions > ZERO_DECIMAL:
            ComplianceEarnedCreditsService.create_earned_credits_record(compliance_report_version)
            compliance_report_version.status = ComplianceReportVersion.ComplianceStatus.EARNED_CREDITS
            compliance_report_version.save()

        return compliance_report_version


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
        Create a supplementary ComplianceReportVersion,
        compute an invoice-aware adjustment strategy,
        and schedule the posting/crediting work on transaction commit.

        The strategy is invoice-aware: it determines, in one pass, how much of any refund
        should be applied to the outstanding invoice vs. kept as surplus (how many
        earned credits should be created).

        Returns:
            The created supplementary ComplianceReportVersion.
        """
        excess_emission_delta = new_summary.excess_emissions - previous_summary.excess_emissions
        charge_rate = ComplianceChargeRateService.get_rate_for_year(new_summary.report_version.report.reporting_year)

        previous_compliance_version = (
            SupplementaryVersionService._get_previous_compliance_version_by_report_and_summary(
                compliance_report, previous_summary
            )
        )

        compliance_report_version = ComplianceReportVersion.objects.create(
            compliance_report=compliance_report,
            report_compliance_summary=new_summary,
            status=ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS,
            excess_emissions_delta_from_previous=excess_emission_delta,
            is_supplementary=True,
            previous_version=previous_compliance_version,
        )

        invoice = ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id(
            previous_compliance_version.id,
        ).invoice

        outstanding = invoice.outstanding_balance

        adjustment_strategy = DecreasedObligationHandler._determine_adjustment_strategy(
            new_summary.excess_emissions,
            previous_summary.excess_emissions,
            charge_rate,
            outstanding,
            credited_emissions=new_summary.credited_emissions,
        )

        transaction.on_commit(
            lambda: DecreasedObligationHandler._process_adjustment_after_commit(
                previous_compliance_version.id,
                compliance_report_version.id,
                adjustment_strategy,
            )
        )

        return compliance_report_version

    @staticmethod
    def _process_adjustment_after_commit(
        previous_version_id: int, compliance_report_version_id: int, strategy: dict
    ) -> None:

        applied = strategy.get("applied_to_invoice", ZERO_DECIMAL)
        if applied != ZERO_DECIMAL:
            reason = (
                ElicensingAdjustment.Reason.SUPPLEMENTARY_REPORT_ADJUSTMENT_TO_VOID_INVOICE
                if strategy["should_void_invoice"]
                else ElicensingAdjustment.Reason.SUPPLEMENTARY_REPORT_ADJUSTMENT
            )
            ComplianceAdjustmentService.create_adjustment_for_target_version(
                target_compliance_report_version_id=previous_version_id,
                adjustment_total=applied,  # signed (negative reduces outstanding)
                supplementary_compliance_report_version_id=compliance_report_version_id,
                reason=reason,
            )

        if strategy["create_earned_credits"]:
            tonnes = strategy.get("credits_tonnes", ZERO_DECIMAL)
            if tonnes > ZERO_DECIMAL:
                DecreasedObligationHandler._create_earned_credits(
                    compliance_report_version_id,
                    tonnes,
                )

        if strategy["mark_previous_fully_met"]:
            DecreasedObligationHandler._mark_previous_version_fully_met(previous_version_id)

        if strategy.get("should_void_invoice"):
            DecreasedObligationHandler._void_unpaid_invoices(previous_version_id)

    @staticmethod
    def _determine_adjustment_strategy(
        new_excess_emissions: Decimal,
        previous_excess_emissions: Decimal,
        charge_rate: Decimal,
        invoice_outstanding_balance: Decimal,
        credited_emissions: Optional[Decimal] = None,
    ) -> dict:
        """
        Compute an **invoice-aware** adjustment strategy.

        This method normalizes and quantizes inputs, calculates the signed money delta
        (negative = refund, positive = additional fee) from the change in excess emissions,
        allocates any refund against the current invoice outstanding first, and determines the
        credits to create.

        Invoice-aware in one pass means:
        1) Calculate monetary delta from emissions change (delta * rate).
        2) If refund, apply up to the outstanding balance (reducing the invoice).
        3) Track any surplus refund (informational).
        4) Compute credits using the provided credited_emissions (if any),
            over-compliance tonnes (when new excess ≤ 0), and any conversion of surplus
            refund dollars into tonnes at the charge rate (if applicable in your policy).
        5) Determine `should_void_invoice` — if there have been **previous payments** on the
            invoice (i.e., prev*rate > outstanding), do **not** void even when fully met.
        """
        # Normalize & quantize
        excess = (new_excess_emissions or ZERO_DECIMAL).quantize(EMISS)
        prev = (previous_excess_emissions or ZERO_DECIMAL).quantize(EMISS)
        rate = (charge_rate or ZERO_DECIMAL).quantize(Decimal("0.00"))
        credited_in = (credited_emissions or ZERO_DECIMAL).quantize(EMISS)

        outstanding = max(invoice_outstanding_balance or ZERO_DECIMAL, ZERO_DECIMAL).quantize(MONEY)

        # Emissions delta (negative for decrease)
        delta_emiss = (excess - prev).quantize(EMISS)

        # Money delta before allocation (signed: negative = refund)
        adjustment_amount = (delta_emiss * rate).quantize(MONEY)

        # Apply refund toward the invoice first
        refund_abs = max(-adjustment_amount, ZERO_DECIMAL).quantize(MONEY)  # positive $
        apply_abs = min(refund_abs, outstanding).quantize(MONEY)  # $ used to zero/down invoice
        remainder = (refund_abs - apply_abs).quantize(MONEY)  # $ left after invoice

        # Over-compliance tonnes (from emissions crossing ≤ 0)
        over_compliance_tonnes = max(-excess, ZERO_DECIMAL).quantize(EMISS)

        # Convert any leftover refund dollars into tonnes at the charge rate
        remainder_tonnes = (remainder / rate).quantize(EMISS) if rate > ZERO_DECIMAL else ZERO_DECIMAL

        # Final credits in TONNES:
        #   provided credited tonnes (from new summary)
        # + over-compliance tonnes
        # + tonnes converted from surplus refund money
        credits_tonnes = (credited_in + over_compliance_tonnes + remainder_tonnes).quantize(EMISS)

        # --- previous-payments awareness for void decision ---
        previous_billed_dollars = (prev * rate).quantize(MONEY)
        previous_payments_dollars = max(previous_billed_dollars - outstanding, ZERO_DECIMAL).quantize(MONEY)
        net_outstanding_after = (outstanding - apply_abs).quantize(MONEY)

        mark_previous_fully_met = net_outstanding_after == ZERO_DECIMAL
        # Void only if fully met AND there were no previous payments.
        should_void_invoice = mark_previous_fully_met and (previous_payments_dollars == ZERO_DECIMAL)

        return {
            # Money fields
            "adjustment_amount": adjustment_amount,  # signed; neg = refund
            "applied_to_invoice": -apply_abs,  # neg reduces outstanding
            "refund_surplus_money": remainder,  # informational
            # Credits (TONNES)
            "credits_tonnes": credits_tonnes,
            "create_earned_credits": (credits_tonnes > ZERO_DECIMAL),
            # Status / invoice handling
            "mark_previous_fully_met": mark_previous_fully_met,
            "should_void_invoice": should_void_invoice,
            "net_invoice_outstanding_after": net_outstanding_after,
        }

    @staticmethod
    def _void_unpaid_invoices(previous_version_id: int) -> None:
        ElicensingInvoice.objects.filter(
            compliance_obligation__compliance_report_version_id=previous_version_id,
            is_void=False,
        ).update(is_void=True)

    @staticmethod
    def _mark_previous_version_fully_met(previous_version_id: int) -> None:
        ComplianceReportVersion.objects.filter(id=previous_version_id).update(
            status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_FULLY_MET
        )

    @staticmethod
    def _create_earned_credits(compliance_report_version_id: int, tonnes: Decimal) -> None:
        crv = ComplianceReportVersion.objects.get(id=compliance_report_version_id)

        ComplianceEarnedCreditsService.create_earned_credits_record(
            compliance_report_version=crv,
            amount=int(tonnes),
        )
        ComplianceReportVersion.objects.filter(id=compliance_report_version_id).update(
            status=ComplianceReportVersion.ComplianceStatus.EARNED_CREDITS
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

    @staticmethod
    def _obligation_has_no_invoice(previous_compliance_report_version: ComplianceReportVersion) -> bool:
        previous_obligation = ComplianceObligation.objects.get(
            compliance_report_version=previous_compliance_report_version
        )
        return (
            previous_compliance_report_version.status
            == ComplianceReportVersion.ComplianceStatus.OBLIGATION_PENDING_INVOICE_CREATION
            and previous_obligation.elicensing_invoice is None
        )

    @staticmethod
    def _earned_credits_not_issued(previous_compliance_report_version: ComplianceReportVersion) -> bool:
        previous_earned_credit = ComplianceEarnedCredit.objects.get(
            compliance_report_version=previous_compliance_report_version
        )
        return previous_earned_credit.issuance_status == ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED

    @transaction.atomic
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

        # If the previous version can be superceded, run the supercede handler & exit
        if SupercedeVersionHandler.can_handle(
            new_summary=new_version_compliance_summary, previous_summary=previous_version_compliance_summary
        ):
            SupercedeVersionHandler.handle(
                compliance_report=compliance_report,
                new_summary=new_version_compliance_summary,
                previous_summary=previous_version_compliance_summary,
                version_count=version_count,
            )
            return None
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
