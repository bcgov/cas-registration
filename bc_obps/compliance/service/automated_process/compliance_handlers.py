import logging
from decimal import Decimal
from typing import Protocol
from django.utils import timezone
from compliance.models.elicensing_invoice import ElicensingInvoice
from compliance.models.compliance_obligation import ComplianceObligation
from compliance.models.compliance_report_version import ComplianceReportVersion
from compliance.service.penalty_calculation_service import PenaltyCalculationService
from compliance.service.compliance_obligation_service import ComplianceObligationService

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

        return (
            penalty.compliance_obligation.penalty_status == ComplianceObligation.PenaltyStatus.NOT_PAID
            and invoice.outstanding_balance == Decimal('0.00')
        )

    def handle(self, invoice: ElicensingInvoice) -> None:
        """Update obligation penalty_status to PAID if the penalty invoice is fully paid."""
        obligation = invoice.compliance_penalty.compliance_obligation
        if obligation.penalty_status != ComplianceObligation.PenaltyStatus.PAID:
            ComplianceObligationService.update_penalty_status(obligation.pk, ComplianceObligation.PenaltyStatus.PAID)
            logger.info(f"Updated penalty status to PAID for obligation {obligation.obligation_id}")


class PenaltyAccruingHandler(ComplianceUpdateHandler):
    """Handler for handling obligations that need to start accruing penalties."""

    def can_handle(self, invoice: ElicensingInvoice) -> bool:
        """Check if obligation should start accruing penalties."""
        has_penalty = hasattr(invoice, 'compliance_penalty') and getattr(invoice, 'compliance_penalty', None)
        if has_penalty:
            return False

        return (
            invoice.compliance_obligation.compliance_report_version.status
            == ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET
            and invoice.outstanding_balance > Decimal('0.00')
            and invoice.due_date < timezone.now()
        )

    def handle(self, invoice: ElicensingInvoice) -> None:
        """Update penalty status to ACCRUING and create a penalty if needed."""
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
        """Update compliance status to OBLIGATION_FULLY_MET."""
        obligation = invoice.compliance_obligation
        compliance_report_version = obligation.compliance_report_version
        compliance_report_version.status = ComplianceReportVersion.ComplianceStatus.OBLIGATION_FULLY_MET
        compliance_report_version.save(update_fields=['status'])
        logger.info(f"Updated compliance status for obligation {obligation.obligation_id}")
        if invoice.due_date < timezone.now():
            PenaltyCalculationService.create_penalty(obligation)
            logger.info(f"Created penalty for obligation {obligation.obligation_id}")


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
