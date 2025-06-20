from compliance.service.elicensing.elicensing_api_client import ELicensingAPIClient
from django.db import transaction
from compliance.models import (
    ElicensingClientOperator,
    ElicensingInvoice,
    ElicensingLineItem,
    ElicensingPayment,
    ElicensingAdjustment,
    ComplianceObligation,
)
from datetime import datetime
from decimal import Decimal
from compliance.dataclass import RefreshWrapperReturn
import logging
from pydantic import ValidationError

logger = logging.getLogger(__name__)

elicensing_api_client = ELicensingAPIClient()


class ElicensingDataRefreshService:
    """
    Wrapper for refreshing elicensing data with the compliance_report_version_id
    """

    @classmethod
    def refresh_data_wrapper_by_compliance_report_version_id(
        cls, compliance_report_version_id: int
    ) -> RefreshWrapperReturn:
        data_is_fresh = True
        invoice = ComplianceObligation.objects.get(
            compliance_report_version_id=compliance_report_version_id
        ).elicensing_invoice
        if not invoice:
            raise ValidationError(f"No related invoice found for report version ID: {compliance_report_version_id}")
        try:
            ElicensingDataRefreshService.refresh_data_by_invoice(
                client_operator_id=invoice.elicensing_client_operator_id, invoice_number=invoice.invoice_number
            )
        except Exception as e:  # noqa: E722
            logger.error(f"Failed to refresh data by invoice: {str(e)}")
            data_is_fresh = False

        invoice.refresh_from_db()
        return RefreshWrapperReturn(data_is_fresh=data_is_fresh, invoice=invoice)

    @classmethod
    @transaction.atomic
    def refresh_data_by_invoice(cls, client_operator_id: int, invoice_number: str) -> None:
        """
        Refresh BCIERS elicensing data by an invoice number. Refreshes the invoice data and all child data

        Args:
            client_id: The client_operator_id for the requesting client in elicensing
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
                "due_date": datetime.fromisoformat(invoice_response.invoicePaymentDueDate),
                "outstanding_balance": Decimal(invoice_response.invoiceOutstandingBalance).quantize(Decimal("0.00")),
                "invoice_fee_balance": Decimal(invoice_response.invoiceFeeBalance).quantize(Decimal("0.00")),
                "invoice_interest_balance": Decimal(invoice_response.invoiceInterestBalance).quantize(Decimal("0.00")),
            },
        )
        for fee in invoice_response.fees:
            fee_record, _ = ElicensingLineItem.objects.update_or_create(
                elicensing_invoice=invoice_record,
                object_id=fee.feeObjectId,
                guid=fee.feeGUID,
                line_item_type=ElicensingLineItem.LineItemType.FEE,
                defaults={
                    "fee_date": datetime.fromisoformat(fee.feeDate),
                    "description": fee.description,
                    "base_amount": Decimal(fee.baseAmount).quantize(Decimal("0.00")),
                },
            )
            for payment in fee.payments:
                ElicensingPayment.objects.update_or_create(
                    elicensing_line_item=fee_record,
                    payment_object_id=payment.paymentObjectId,
                    defaults={
                        "received_date": datetime.fromisoformat(payment.receivedDate),
                        "amount": Decimal(payment.amount).quantize(Decimal("0.00")),
                    },
                )
            for adjustment in fee.adjustments:
                ElicensingAdjustment.objects.update_or_create(
                    elicensing_line_item=fee_record,
                    adjustment_object_id=adjustment.adjustmentObjectId,
                    defaults={
                        "amount": Decimal(adjustment.amount).quantize(Decimal("0.00")),
                        "adjustment_date": datetime.fromisoformat(adjustment.date),
                        "reason": adjustment.reason,
                        "type": adjustment.type,
                        "comment": adjustment.comment,
                    },
                )
