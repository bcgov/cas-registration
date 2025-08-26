from compliance.enums import ComplianceInvoiceTypes
from compliance.models.compliance_penalty import CompliancePenalty

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
from datetime import datetime, timedelta
from decimal import Decimal
from compliance.dataclass import LastRefreshMetaData, RefreshWrapperReturn
import logging
from pydantic import ValidationError
from django.utils import timezone

logger = logging.getLogger(__name__)

elicensing_api_client = ELicensingAPIClient()


class ElicensingDataRefreshService:
    """
    Wrapper for refreshing elicensing data with the compliance_report_version_id
    """

    @classmethod
    def refresh_data_wrapper_by_compliance_report_version_id(
        cls,
        compliance_report_version_id: int,
        force_refresh: bool = False,
        supplementary_compliance_report_version_id: int | None = None,
        invoice_type: ComplianceInvoiceTypes = ComplianceInvoiceTypes.OBLIGATION,
    ) -> RefreshWrapperReturn:
        """
        Refreshes eLicensing invoice data for a given compliance report version ID.

        This method retrieves the related invoice (obligation or penalty) for the specified compliance report version.
        It checks if the invoice data is fresh (recently refreshed) and, unless forced, avoids unnecessary API calls.
        If the data is stale or a forced refresh is requested, it fetches the latest invoice data from the eLicensing API
        and updates the database records accordingly. Returns a wrapper indicating whether the data is fresh and the invoice instance.

        Args:
            compliance_report_version_id (int): The ID of the compliance report version to refresh data for.
            force_refresh (bool, optional): If True, forces a refresh from the API regardless of last refresh time. Defaults to False.
            supplementary_compliance_report_version_id (int | None): The ID of the supplementary compliance report version that triggered the refresh. Defaults to None.
            invoice_type (ComplianceInvoiceTypes, optional): The type of invoice to refresh (OBLIGATION or PENALTY). Defaults to OBLIGATION.

        Returns:
            RefreshWrapperReturn: An object containing whether the data is fresh and the invoice instance.

        Raises:
            ValidationError: If no related invoice is found for the given report version ID.
        """
        data_is_fresh = True
        compliance_obligation: ComplianceObligation = ComplianceObligation.objects.get(
            compliance_report_version_id=compliance_report_version_id
        )

        invoice = (
            compliance_obligation.elicensing_invoice
            if invoice_type == ComplianceInvoiceTypes.OBLIGATION
            else CompliancePenalty.objects.get(compliance_obligation=compliance_obligation).elicensing_invoice
        )

        if not invoice:
            raise ValidationError(f"No related invoice found for report version ID: {compliance_report_version_id}")
        # Limit calls successive calls to refresh an invoice from the elicensing API to once per 15mins
        if (
            invoice.last_refreshed is not None
            and (invoice.last_refreshed > timezone.now() - timedelta(seconds=900))
            and not force_refresh
        ):
            return RefreshWrapperReturn(data_is_fresh=True, invoice=invoice)
        try:
            ElicensingDataRefreshService.refresh_data_by_invoice(
                client_operator_id=invoice.elicensing_client_operator_id,
                invoice_number=invoice.invoice_number,
                supplementary_compliance_report_version_id=supplementary_compliance_report_version_id,
            )
        except Exception as e:  # noqa: E722
            logger.error(f"Failed to refresh data by invoice: {str(e)}")
            data_is_fresh = False

        invoice.refresh_from_db()
        return RefreshWrapperReturn(data_is_fresh=data_is_fresh, invoice=invoice)

    @classmethod
    @transaction.atomic
    def refresh_data_by_invoice(
        cls, client_operator_id: int, invoice_number: str, supplementary_compliance_report_version_id: int | None = None
    ) -> None:
        """
        Refresh BCIERS elicensing data by an invoice number. Refreshes the invoice data and all child data

        Args:
            client_operator_id: The client_operator_id for the requesting client in elicensing
            invoice_number: The invoice number of the invoice to refresh from elicensing
            supplementary_compliance_report_version_id: ID of the supplementary compliance report version that triggered this refresh
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
                "last_refreshed": timezone.now(),
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
            cls._process_fee_payments(fee_record, fee.payments)
            cls._process_fee_adjustments(fee_record, fee.adjustments, supplementary_compliance_report_version_id)

    @classmethod
    def _process_fee_payments(cls, fee_record: ElicensingLineItem, payments: list) -> None:
        for payment in payments:
            ElicensingPayment.objects.update_or_create(
                elicensing_line_item=fee_record,
                payment_object_id=payment.paymentObjectId,
                defaults={
                    "received_date": datetime.fromisoformat(payment.receivedDate),
                    "amount": Decimal(payment.amount).quantize(Decimal("0.00")),
                    "method": payment.method,
                    "receipt_number": payment.receiptNumber,
                },
            )

    @classmethod
    def _process_fee_adjustments(
        cls, fee_record: ElicensingLineItem, adjustments: list, supplementary_compliance_report_version_id: int | None
    ) -> None:
        for adjustment in adjustments:
            adjustment_defaults = {
                "amount": Decimal(adjustment.amount).quantize(Decimal("0.00")),
                "adjustment_date": datetime.fromisoformat(adjustment.date),
                "reason": adjustment.reason,
                "type": adjustment.type,
                "comment": adjustment.comment,
            }
            if supplementary_compliance_report_version_id:
                adjustment_defaults[
                    "supplementary_compliance_report_version_id"
                ] = supplementary_compliance_report_version_id

            ElicensingAdjustment.objects.update_or_create(
                elicensing_line_item=fee_record,
                adjustment_object_id=adjustment.adjustmentObjectId,
                defaults=adjustment_defaults,
            )

    @staticmethod
    def get_last_refreshed_metadata(
        refresh_result: RefreshWrapperReturn,
        *,
        fmt: str = "%Y-%m-%d %H:%M:%S %Z",
        default_fresh: bool = False,
    ) -> LastRefreshMetaData:

        """
        Extract last-refresh metadata from a RefreshWrapperReturn.

        - Formats invoice.last_refreshed
        - data_is_fresh defaults to `default_fresh` when absent
        """
        invoice = getattr(refresh_result, "invoice", None)
        last_refreshed = getattr(invoice, "last_refreshed", None)

        if last_refreshed:
            last_refreshed_str = last_refreshed.strftime(fmt)
        else:
            last_refreshed_str = ""

        data_is_fresh = getattr(refresh_result, "data_is_fresh", default_fresh)

        return {
            "last_refreshed_display": last_refreshed_str,
            "data_is_fresh": bool(data_is_fresh),
        }
