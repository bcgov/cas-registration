from compliance.service.elicensing.elicensing_data_refresh_service import ElicensingDataRefreshService
from compliance.models.elicensing_invoice import ElicensingInvoice
from compliance.service.automated_process.compliance_handlers import ComplianceHandlerManager
from django.db import transaction
import logging

logger = logging.getLogger(__name__)


class AutomatedProcessService:
    @classmethod
    def run_scheduled_compliance_sync(cls) -> None:
        """
        Refreshes data for all invoices and processes automated compliance updates.
        This method is designed to be run as a scheduled task to keep all
        invoice data fresh from the eLicensing API and update compliance statuses.
        """
        all_invoices = ElicensingInvoice.objects.select_related('elicensing_client_operator')
        total_invoices = all_invoices.count()
        successful_refreshes = 0
        successful_updates = 0

        logger.info(f"Found {total_invoices} invoices to refresh")

        for invoice in all_invoices:
            logger.info(f"Processing invoice {invoice.invoice_number}")

            cls._refresh_invoice_data(invoice)
            successful_refreshes += 1

            cls._process_compliance_updates(invoice)
            successful_updates += 1

        logger.info(
            f"Completed processing of all invoices. Total: {total_invoices}, Refreshes: {successful_refreshes}, Updates: {successful_updates}"
        )

    @classmethod
    def _refresh_invoice_data(cls, invoice: ElicensingInvoice) -> None:
        """Refresh invoice data from eLicensing API."""
        logger.info(f"Refreshing invoice {invoice.invoice_number}")
        ElicensingDataRefreshService.refresh_data_by_invoice(
            client_operator_id=invoice.elicensing_client_operator.id, invoice_number=invoice.invoice_number
        )
        logger.info(f"Successfully refreshed invoice {invoice.invoice_number}")

    @classmethod
    def _process_compliance_updates(cls, invoice: ElicensingInvoice) -> None:
        logger.info(f"Processing compliance updates for invoice {invoice.invoice_number}")
        with transaction.atomic():
            handler_manager = ComplianceHandlerManager()
            handler_manager.process_compliance_updates(invoice)
        logger.info(f"Completed compliance updates for invoice {invoice.invoice_number}")
