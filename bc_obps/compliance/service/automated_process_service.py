from compliance.service.elicensing.elicensing_data_refresh_service import ElicensingDataRefreshService
from compliance.models.elicensing_invoice import ElicensingInvoice
import logging

logger = logging.getLogger(__name__)


class AutomatedProcessService:
    @classmethod
    def refresh_all_obligation_invoices(cls) -> None:
        """
        Refreshes data for all invoices
        This method is designed to be run as a scheduled task to keep all
        invoice data fresh from the eLicensing API.
        """
        all_invoices = ElicensingInvoice.objects.select_related('elicensing_client_operator')
        total_invoices = all_invoices.count()
        successful_refreshes = 0

        logger.info(f"Found {total_invoices} invoices to refresh")

        for invoice in all_invoices:
            logger.info(f"Refreshing invoice {invoice.invoice_number}")

            ElicensingDataRefreshService.refresh_data_by_invoice(
                client_operator_id=invoice.elicensing_client_operator.id, invoice_number=invoice.invoice_number
            )

            successful_refreshes += 1
            logger.info(f"Successfully refreshed invoice {invoice.invoice_number}")
        logger.info(f"Completed refresh of all invoices. Total: {total_invoices}, Success: {successful_refreshes}")
