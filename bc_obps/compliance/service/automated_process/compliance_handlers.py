import logging
from datetime import timedelta
from decimal import Decimal
from typing import Protocol
from django.utils import timezone
from compliance.models.elicensing_invoice import ElicensingInvoice
from compliance.models.compliance_obligation import ComplianceObligation
from compliance.models.compliance_report_version import ComplianceReportVersion
from compliance.models.compliance_penalty import CompliancePenalty
from compliance.service.penalty_calculation_service import CalculatedPenaltyData, PenaltyCalculationService
from compliance.service.compliance_obligation_service import ComplianceObligationService
from django.db import transaction

logger = logging.getLogger(__name__)

ZERO_DECIMAL = Decimal('0.00')


def _is_penalty_invoice(invoice: ElicensingInvoice) -> bool:
    """
    Check whether this invoice is itself a penalty's own invoice (as opposed to an obligation's invoice)
    """
    return bool(hasattr(invoice, 'compliance_penalty') and getattr(invoice, 'compliance_penalty', None))


def _has_automatic_overdue_penalty(obligation: ComplianceObligation) -> bool:
    """
    Check whether an automatic overdue penalty has already been created for this obligation
    """
    return obligation.compliance_penalties.filter(penalty_type=CompliancePenalty.PenaltyType.AUTOMATIC_OVERDUE).exists()


class ComplianceUpdateHandler(Protocol):
    """Protocol for compliance update handlers."""

    def can_handle(self, invoice: ElicensingInvoice) -> bool:
        """Determine if this handler can handle the given invoice and obligation."""
        ...

    def handle(self, invoice: ElicensingInvoice) -> None:
        """Handle the compliance update."""
        ...


class PenaltyPaidHandler(ComplianceUpdateHandler):
    """Handling invoices with penalties that are fully paid."""

    def can_handle(self, invoice: ElicensingInvoice) -> bool:
        """Check if the invoice has a penalty and the penalty invoice is fully paid."""
        if not _is_penalty_invoice(invoice):
            return False

        penalty = invoice.compliance_penalty
        if not penalty or not penalty.elicensing_invoice:
            return False

        return penalty.status == CompliancePenalty.Status.NOT_PAID and invoice.outstanding_balance == ZERO_DECIMAL

    def handle(self, invoice: ElicensingInvoice) -> None:
        """Update obligation penalty_status to PAID if ALL penalty invoices are fully paid."""
        from compliance.tasks import retryable_send_notice_of_penalty_paid_email

        with transaction.atomic():
            obligation = invoice.compliance_penalty.compliance_obligation

            # Check if all penalties for this obligation are paid
            all_penalties = obligation.compliance_penalties.all()
            all_penalties_paid = all(
                penalty.elicensing_invoice and penalty.elicensing_invoice.outstanding_balance == ZERO_DECIMAL
                for penalty in all_penalties
            )

            if all_penalties_paid and obligation.penalty_status != ComplianceObligation.PenaltyStatus.PAID:
                ComplianceObligationService.update_penalty_status(
                    obligation.pk, ComplianceObligation.PenaltyStatus.PAID
                )
                logger.info(f"Updated penalty status to PAID for obligation {obligation.obligation_id}")

            penalty = invoice.compliance_penalty

            # Mark the current penalty (for this invoice) as PAID
            penalty.status = CompliancePenalty.Status.PAID
            penalty.save(update_fields=['status'])

            # Send email notification that the penalty has been paid
            retryable_send_notice_of_penalty_paid_email.execute(obligation.id)


class PenaltyAccruingHandler(ComplianceUpdateHandler):
    """Handler for handling obligations that need to start accruing penalties."""

    def can_handle(self, invoice: ElicensingInvoice) -> bool:
        """Check if obligation should start accruing penalties."""

        # Only run for obligation invoices; skip penalty invoices
        if _is_penalty_invoice(invoice):
            return False

        obligation = invoice.compliance_obligation
        compliance_period = obligation.compliance_report_version.compliance_report.compliance_period
        compliance_deadline = compliance_period.compliance_deadline

        # Once the penalty has maxed out at 3x the obligation, it has been invoiced and is no longer
        # accruing, so it must not be flipped back to ACCRUING while the obligation stays unpaid
        if _has_automatic_overdue_penalty(obligation):
            return False

        return (
            invoice.compliance_obligation.compliance_report_version.status
            == ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET
            and invoice.outstanding_balance > ZERO_DECIMAL
            and compliance_deadline < timezone.now().date()
        )

    def handle(self, invoice: ElicensingInvoice) -> None:
        """Update penalty status to ACCRUING."""
        obligation = invoice.compliance_obligation
        if obligation.penalty_status != ComplianceObligation.PenaltyStatus.ACCRUING:
            ComplianceObligationService.update_penalty_status(
                obligation.pk, ComplianceObligation.PenaltyStatus.ACCRUING
            )
            logger.info(f"Updated penalty status to ACCRUING for obligation {obligation.obligation_id}")


class ObligationPaidHandler(ComplianceUpdateHandler):
    """Handler for handling obligations whose tCO2e fee balance has been fully paid."""

    def can_handle(self, invoice: ElicensingInvoice) -> bool:
        """Check if the obligation's fee balance is paid and should be updated to OBLIGATION_FULLY_MET or OBLIGATION_MET_INTEREST_NOT_PAID."""

        # Ensure this is an obligation invoice, not a penalty invoice
        if _is_penalty_invoice(invoice):
            return False
        # Only consider the fee balance (the tCO2e obligation) when deciding if the obligation is met.
        # Unpaid FAA interest (part of outstanding_balance) must not block the obligation from being
        # considered met or block automatic penalty generation.
        return (
            invoice.compliance_obligation.compliance_report_version.status
            == ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET
            and invoice.invoice_fee_balance == ZERO_DECIMAL
        )

    def handle(self, invoice: ElicensingInvoice) -> None:
        """
        Update compliance status to OBLIGATION_FULLY_MET, or OBLIGATION_MET_INTEREST_NOT_PAID if FAA
        interest is still outstanding, and create penalties if the invoice is overdue.
        """
        from compliance.tasks import (
            retryable_notice_of_obligation_met_email,
            retryable_create_penalty,
        )

        obligation = invoice.compliance_obligation
        compliance_report_version = obligation.compliance_report_version
        # invoice_interest_balance should never be None here; fail loudly
        interest_not_paid = invoice.invoice_interest_balance > ZERO_DECIMAL  # type: ignore[operator]
        compliance_report_version.status = (
            ComplianceReportVersion.ComplianceStatus.OBLIGATION_MET_INTEREST_NOT_PAID
            if interest_not_paid
            else ComplianceReportVersion.ComplianceStatus.OBLIGATION_FULLY_MET
        )
        compliance_report_version.save(update_fields=['status'])
        retryable_notice_of_obligation_met_email.execute(obligation.id)
        logger.info(f"Updated compliance status for obligation {obligation.obligation_id}")
        final_transaction_date = PenaltyCalculationService.determine_last_transaction_date(obligation)

        # Determine if late submission penalty applies & when the automatic overdue penalty starts accruing
        penalty_accrual_context = PenaltyCalculationService.get_penalty_accrual_context(obligation)
        effective_deadline = penalty_accrual_context.effective_deadline

        if obligation.compliance_report_version.is_supplementary and penalty_accrual_context.has_late_submission:
            # Create a late submission penalty if a supplementary obligation was submitted late
            retryable_create_penalty.execute(
                obligation_id=obligation.id,
                penalty_type=CompliancePenalty.PenaltyType.LATE_SUBMISSION,
                effective_deadline=penalty_accrual_context.compliance_deadline,
            )
            logger.info(f"Created penalties for obligation {obligation.obligation_id}")

        # If we are past the deadline & the last transaction that brought the obligation to zero was also received past the deadline, create an automatic overdue penalty
        # A penalty that already maxed out at 3x the obligation was invoiced while the obligation was still outstanding, so there is nothing left to create here
        if (
            effective_deadline < timezone.now().date()
            and final_transaction_date > effective_deadline  # type: ignore [operator]
            and not _has_automatic_overdue_penalty(obligation)
        ):
            retryable_create_penalty.execute(
                obligation_id=obligation.id,
                penalty_type=CompliancePenalty.PenaltyType.AUTOMATIC_OVERDUE,
                effective_deadline=effective_deadline,
            )
            logger.info(f"Created penalties for obligation {obligation.obligation_id}")


class MaxPenaltyHandler(ComplianceUpdateHandler):
    """
    Handler for obligations whose automatic overdue penalty has reached its maximum of 3x the
    obligation. The penalty stops accruing at that point and becomes payable immediately, so the
    penalty and its invoice are generated even though the obligation itself is still outstanding
    """

    def __init__(self) -> None:
        self._penalty_data: CalculatedPenaltyData | None = None

    def can_handle(self, invoice: ElicensingInvoice) -> bool:
        """Check if the obligation's accruing penalty has reached 3x the obligation"""

        # Only run for obligation invoices; skip penalty invoices
        if _is_penalty_invoice(invoice):
            return False

        obligation = invoice.compliance_obligation

        # Cheap checks first, so the penalty calculation below only runs for the obligations that
        # could plausibly have maxed out
        if (
            obligation.compliance_report_version.status != ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET
            or obligation.penalty_status != ComplianceObligation.PenaltyStatus.ACCRUING
            or invoice.invoice_fee_balance <= ZERO_DECIMAL  # type: ignore[operator]
            or _has_automatic_overdue_penalty(obligation)
        ):
            return False

        penalty_accrual_context = PenaltyCalculationService.get_penalty_accrual_context(obligation)
        if penalty_accrual_context.effective_deadline >= timezone.now().date():
            return False

        self._penalty_data = PenaltyCalculationService.calculate_penalty(
            obligation=obligation,
            accrual_start_date=penalty_accrual_context.effective_deadline + timedelta(days=1),
        )
        return self._penalty_data.cap_reached_date is not None

    def handle(self, invoice: ElicensingInvoice) -> None:
        """Create the maxed out automatic overdue penalty and its invoice, due 30 days from now"""
        from compliance.tasks import retryable_create_penalty

        obligation = invoice.compliance_obligation
        cap_reached_date = self._penalty_data.cap_reached_date  # type: ignore[union-attr]
        effective_deadline = PenaltyCalculationService.get_penalty_accrual_context(obligation).effective_deadline

        retryable_create_penalty.execute(
            obligation_id=obligation.id,
            penalty_type=CompliancePenalty.PenaltyType.AUTOMATIC_OVERDUE,
            effective_deadline=effective_deadline,
            final_accrual_date=cap_reached_date,
        )
        logger.info(
            f"Automatic overdue penalty reached the maximum of 3x the obligation on {cap_reached_date}; "
            f"created penalty for obligation {obligation.obligation_id}"
        )


class InterestPaidHandler(ComplianceUpdateHandler):
    """Handler for transitioning obligations from interest not paid to fully met once FAA interest is paid off."""

    def can_handle(self, invoice: ElicensingInvoice) -> bool:
        """Check if the obligation is OBLIGATION_MET_INTEREST_NOT_PAID and FAA interest has now been paid."""

        if _is_penalty_invoice(invoice):
            return False

        return (
            invoice.compliance_obligation.compliance_report_version.status
            == ComplianceReportVersion.ComplianceStatus.OBLIGATION_MET_INTEREST_NOT_PAID
            and invoice.invoice_interest_balance == ZERO_DECIMAL
        )

    def handle(self, invoice: ElicensingInvoice) -> None:
        """Update compliance status to OBLIGATION_FULLY_MET now that FAA interest is paid."""
        obligation = invoice.compliance_obligation
        compliance_report_version = obligation.compliance_report_version
        compliance_report_version.status = ComplianceReportVersion.ComplianceStatus.OBLIGATION_FULLY_MET
        compliance_report_version.save(update_fields=['status'])
        logger.info(
            f"FAA interest paid off; updated compliance status to fully met for obligation {obligation.obligation_id}"
        )


class ComplianceHandlerManager:
    """Manages and executes compliance update handlers."""

    def __init__(self) -> None:
        self.handlers: list[ComplianceUpdateHandler] = [
            PenaltyPaidHandler(),
            PenaltyAccruingHandler(),
            # Runs after PenaltyAccruingHandler, which is what moves an obligation into the ACCRUING
            # state this handler acts on
            MaxPenaltyHandler(),
            ObligationPaidHandler(),
            InterestPaidHandler(),
        ]

    def process_compliance_updates(self, invoice: ElicensingInvoice) -> None:
        for handler in self.handlers:
            if handler.can_handle(invoice):
                handler.handle(invoice)
