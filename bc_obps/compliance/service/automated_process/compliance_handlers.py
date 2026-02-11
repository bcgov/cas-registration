import logging
from decimal import Decimal
from typing import Protocol
from django.utils import timezone
from compliance.models.elicensing_invoice import ElicensingInvoice
from compliance.models.compliance_obligation import ComplianceObligation
from compliance.models.compliance_report_version import ComplianceReportVersion
from compliance.models.compliance_penalty import CompliancePenalty
from compliance.service.penalty_calculation_service import PenaltyCalculationService
from compliance.service.compliance_obligation_service import ComplianceObligationService
from compliance.service.penalty.queries import has_outstanding_penalty

logger = logging.getLogger(__name__)


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
        has_penalty = hasattr(invoice, 'compliance_penalty') and getattr(invoice, 'compliance_penalty', None)
        if not has_penalty:
            return False

        penalty = invoice.compliance_penalty
        if not penalty or not penalty.elicensing_invoice:
            return False

        return penalty.status == CompliancePenalty.Status.NOT_PAID and invoice.outstanding_balance == Decimal('0.00')

    def handle(self, invoice: ElicensingInvoice) -> None:
        """Update obligation penalty_status to PAID if ALL penalty invoices are fully paid."""
        obligation = invoice.compliance_penalty.compliance_obligation

        # Check if all penalties for this obligation are paid
        all_penalties = obligation.compliance_penalties.all()
        all_penalties_paid = all(
            penalty.elicensing_invoice and penalty.elicensing_invoice.outstanding_balance == Decimal('0.00')
            for penalty in all_penalties
        )

        if all_penalties_paid and obligation.penalty_status != ComplianceObligation.PenaltyStatus.PAID:
            ComplianceObligationService.update_penalty_status(obligation.pk, ComplianceObligation.PenaltyStatus.PAID)
            logger.info(f"Updated penalty status to PAID for obligation {obligation.obligation_id}")

        penalty = invoice.compliance_penalty

        # Mark the current penalty (for this invoice) as PAID
        penalty.status = CompliancePenalty.Status.PAID
        penalty.save(update_fields=['status'])


class PenaltyAccruingHandler(ComplianceUpdateHandler):
    """Handler for handling obligations that need to start accruing penalties."""

    def can_handle(self, invoice: ElicensingInvoice) -> bool:
        """Check if obligation should start accruing penalties."""

        # Only run for obligation invoices; skip penalty invoices
        has_penalty = hasattr(invoice, 'compliance_penalty') and getattr(invoice, 'compliance_penalty', None)
        if has_penalty:
            return False

        obligation = invoice.compliance_obligation
        compliance_period = obligation.compliance_report_version.compliance_report.compliance_period
        compliance_deadline = compliance_period.compliance_deadline

        return (
            invoice.compliance_obligation.compliance_report_version.status
            == ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET
            and invoice.outstanding_balance > Decimal('0.00')
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
    """Handler for handling obligations that are fully paid."""

    def can_handle(self, invoice: ElicensingInvoice) -> bool:
        """Check if the obligation is fully paid and should be updated to OBLIGATION_FULLY_MET."""

        # Ensure this is an obligation invoice, not a penalty invoice
        has_penalty = hasattr(invoice, 'compliance_penalty') and getattr(invoice, 'compliance_penalty', None)
        if has_penalty:
            return False
        return (
            invoice.compliance_obligation.compliance_report_version.status
            == ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET
            and invoice.outstanding_balance == Decimal('0.00')
        )

    def handle(self, invoice: ElicensingInvoice) -> None:
        """
        Update compliance status to OBLIGATION_FULLY_MET
        and create penalties if the invoice is overdue.
        """
        from compliance.tasks import (
            retryable_notice_of_obligation_met_email,
            retryable_notice_of_obligation_met_penalty_due_email,
        )

        obligation = invoice.compliance_obligation
        compliance_report_version = obligation.compliance_report_version
        compliance_report_version.status = ComplianceReportVersion.ComplianceStatus.OBLIGATION_FULLY_MET
        compliance_report_version.save(update_fields=['status'])
        retryable_notice_of_obligation_met_email.execute(obligation.id)
        logger.info(f"Updated compliance status for obligation {obligation.obligation_id}")
        final_transaction_date = PenaltyCalculationService.determine_last_transaction_date(obligation)

        # Determine if late submission penalty applies
        compliance_period = obligation.compliance_report_version.compliance_report.compliance_period
        compliance_deadline = compliance_period.compliance_deadline
        submission_date = obligation.created_at.date()  # type: ignore[union-attr]
        has_late_submission = submission_date > compliance_deadline

        # Effective deadline determines when the large automatic overdue penalty is applied
        # It is equal to the compliance deadline except in the case of late supplementary reports, which are granted 30 days to pay the additional obligation
        # For late supplementary reports the effective deadline becomes the due_date of the invoice (ie: 30 days after report submission/invoice creation)
        # As per the Greenhouse Gas Emission Administrative Penalties and Appeals Regulation https://www.bclaws.gov.bc.ca/civix/document/id/lc/statreg/248_2015#section2
        effective_deadline = compliance_deadline
        if obligation.compliance_report_version.is_supplementary and has_late_submission:
            effective_deadline = invoice.due_date
            # Create a late submission penalty if a supplementary obligation was submitted late
            PenaltyCalculationService.create_late_submission_penalty(obligation)

        # If we are past the deadline & the last transaction that brought the obligation to zero was also received past the deadline, create an automatic overdue penalty
        if effective_deadline < timezone.now().date() and final_transaction_date > effective_deadline:  # type: ignore [operator]
            PenaltyCalculationService.create_penalty(obligation, effective_deadline)
            logger.info(f"Created penalties for obligation {obligation.obligation_id}")
        # After penalties may have been created (late submission and/or overdue)
        if has_outstanding_penalty(obligation.compliance_penalties.all()):
            retryable_notice_of_obligation_met_penalty_due_email.execute(obligation.id)


class ComplianceHandlerManager:
    """Manages and executes compliance update handlers."""

    def __init__(self) -> None:
        self.handlers: list[ComplianceUpdateHandler] = [
            PenaltyPaidHandler(),
            PenaltyAccruingHandler(),
            ObligationPaidHandler(),
        ]

    def process_compliance_updates(self, invoice: ElicensingInvoice) -> None:
        for handler in self.handlers:
            if handler.can_handle(invoice):
                handler.handle(invoice)
