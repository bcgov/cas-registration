from compliance.service.elicensing.elicensing_api_client import ELicensingAPIClient
from django.db import transaction
from compliance.models import (
    ElicensingClientOperator,
    ElicensingInvoice,
    ElicensingLineItem,
    ElicensingPayment,
    ElicensingAdjustment,
)

elicensing_api_client = ELicensingAPIClient()


class ElicensingDataRefreshService:
    """
    Service for refreshing our elicensing models with fresh data from elicensing.
    """

    @classmethod
    @transaction.atomic
    def refresh_data_by_invoice(cls, client_operator_id: int, invoice_number: str) -> None:
        """
        Refresh BCIERS elicensing data by an invoice number. Refreshes the invoice data and all child data

        Args:
            client_id: The client_object_id for the requesting client in elicensing
            invoice_number: The invoice number of the invoice to refresh from elicensing

        Returns:
            None
        """

        client_operator = ElicensingClientOperator.objects.get(id=client_operator_id)
        invoice_response = elicensing_api_client.query_invoice(
            client_id=client_operator.client_object_id, invoice_number=invoice_number
        )

        invoice_record, _ = ElicensingInvoice.objects.update_or_create(
            elicensing_client_operator=client_operator,
            invoice_number=invoice_response.invoiceNumber,
            defaults={
                "due_date": invoice_response.invoiceDueDate,
                "outstanding_balance": invoice_response.invoiceOutstandingBalance,
                "invoice_fee_balance": invoice_response.invoiceFeeBalance,
                "invoice_interest_balance": invoice_response.invoiceInterestBalance,
            },
        )
        for fee in invoice_response.fees:
            fee_record, _ = ElicensingLineItem.objects.update_or_create(
                elicensing_invoice=invoice_record,
                object_id=fee.feeObjectId,
                guid=fee.feeGUID,
                line_item_type=ElicensingLineItem.LineItemType.FEE,
            )
            for payment in fee.payments:
                ElicensingPayment.objects.update_or_create(
                    elicensing_line_item=fee_record,
                    payment_object_id=payment.paymentObjectId,
                    defaults={"received_date": payment.receivedDate, "amount": payment.amount},
                )
            for adjustment in fee.adjustments:
                ElicensingAdjustment.objects.update_or_create(
                    elicensing_line_item=fee_record,
                    adjustment_object_id=adjustment.adjustmentObjectId,
                    defaults={
                        "amount": adjustment.amount,
                        "adjustment_date": adjustment.date,
                        "reason": adjustment.reason,
                        "type": adjustment.type,
                        "comment": adjustment.comment,
                    },
                )
