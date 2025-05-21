import logging
import uuid
from typing import List, Optional, Dict, Any

from compliance.models.compliance_obligation import ComplianceObligation
from compliance.models.elicensing_link import ELicensingLink
from compliance.service.elicensing.operator_elicensing_service import OperatorELicensingService
from compliance.service.elicensing.elicensing_link_service import ELicensingLinkService
from compliance.service.elicensing.elicensing_api_client import (
    ELicensingAPIClient,
    FeeCreationRequest,
    InvoiceCreationRequest,
    InvoiceQueryResponse,
    InvoiceFee,
)
from registration.models.operator import Operator
from compliance.service.elicensing.schema import FeeCreationItem, PaymentRecord
from django.db import transaction

logger = logging.getLogger(__name__)

elicensing_api_client = ELicensingAPIClient()


class ObligationELicensingService:
    """
    Service for managing Compliance Obligation-related eLicensing operations.
    This service handles eLicensing integration for compliance obligations,
    including fee creation and synchronization with the eLicensing system.
    """

    @classmethod
    def get_obligation_invoice_payments(cls, obligation_id: int) -> List[PaymentRecord]:
        """
        Get all payments and adjustments for a compliance obligation's invoice.

        Args:
            obligation_id: The ID of the compliance obligation

        Returns:
            List of payment records including both payments and adjustments

        Raises:
            ComplianceObligation.DoesNotExist: If the obligation doesn't exist
            ValueError: If client or invoice links are missing
            requests.RequestException: If there's an API error
        """
        obligation = ComplianceObligation.objects.get(id=obligation_id)
        invoice = cls._get_obligation_invoice(obligation)
        if not invoice:
            return []

        return cls._parse_invoice_payments(invoice)

    @classmethod
    def _get_obligation_invoice(cls, obligation: ComplianceObligation) -> Optional[InvoiceQueryResponse]:
        """
        Get the invoice for a compliance obligation from eLicensing.

        Args:
            obligation: The compliance obligation object

        Returns:
            InvoiceQueryResponse if found, None if no payments exist

        Raises:
            ValueError: If client or invoice links are missing
            requests.RequestException: If there's an API error
        """
        # Get client link from operator
        client_link = ELicensingLinkService.get_link_for_model(
            Operator,
            obligation.compliance_report_version.compliance_report.report.operation.operator.id,
            ELicensingLink.ObjectKind.CLIENT,
        )
        invoice_link = ELicensingLinkService.get_link_for_model(
            ComplianceObligation, obligation.id, ELicensingLink.ObjectKind.INVOICE
        )

        if not client_link or not invoice_link:
            error_msg = (
                f"No client or invoice link found for obligation {obligation.id}. "
                f"Client link: {client_link}, Invoice link: {invoice_link}"
            )
            logger.error(error_msg)
            raise ValueError(error_msg)

        client_id = client_link.elicensing_object_id
        invoice_number = invoice_link.elicensing_object_id

        if not client_id or not invoice_number:
            error_msg = (
                f"Missing client_id or invoice_number for obligation {obligation.id}. "
                f"Client ID: {client_id}, Invoice number: {invoice_number}"
            )
            logger.error(error_msg)
            raise ValueError(error_msg)

        try:
            return elicensing_api_client.query_invoice(client_id, invoice_number)
        except Exception as e:
            error_msg = f"Failed to query invoice for obligation {obligation.id}: {str(e)}"
            logger.error(error_msg)
            raise

    @classmethod
    def _parse_invoice_payments(cls, invoice: InvoiceQueryResponse) -> List[PaymentRecord]:
        """
        Parse payments and adjustments from an invoice.

        Args:
            invoice: The invoice response from eLicensing

        Returns:
            List of payment records
        """
        payments = []
        for fee in invoice.fees:
            payments.extend(cls._parse_fee_payments(fee))
            payments.extend(cls._parse_fee_adjustments(fee))
        return payments

    @classmethod
    def _parse_fee_payments(cls, fee: InvoiceFee) -> List[PaymentRecord]:
        """
        Parse payments from a fee.

        Args:
            fee: The fee object from eLicensing

        Returns:
            List of payment records
        """
        return [
            PaymentRecord(
                id=str(payment.paymentObjectId),
                paymentReceivedDate=payment.receivedDate,
                paymentAmountApplied=payment.amount,
                paymentMethod=payment.method,
                transactionType="Payment",
                referenceNumber=payment.referenceNumber,
                receiptNumber=payment.receiptNumber,
            )
            for payment in fee.payments
        ]

    @classmethod
    def _parse_fee_adjustments(cls, fee: InvoiceFee) -> List[PaymentRecord]:
        """
        Parse adjustments from a fee.

        Args:
            fee: The fee object from eLicensing

        Returns:
            List of adjustment records formatted as payments
        """
        return [
            PaymentRecord(
                id=str(adjustment.adjustmentObjectId),
                paymentReceivedDate=adjustment.date,
                paymentAmountApplied=adjustment.amount,
                paymentMethod="Adjustment",
                transactionType="Payment Adjustment",
                referenceNumber=adjustment.reason,
                receiptNumber=str(adjustment.adjustmentObjectId),
            )
            for adjustment in fee.adjustments
        ]

    @classmethod
    def process_obligation_integration(cls, obligation_id: int) -> None:
        """
        Processes the full eLicensing integration for a compliance obligation.
        This includes creating a fee and syncing it with eLicensing.

        Args:
            obligation_id: The ID of the compliance obligation

        Raises:
            ComplianceObligation.DoesNotExist: If the obligation doesn't exist
            requests.RequestException: If there's an API error
        """
        try:
            with transaction.atomic():
                # Validate the obligation exists
                obligation = ComplianceObligation.objects.get(id=obligation_id)

                # Ensure client exists in eLicensing
                client_link = OperatorELicensingService.sync_client_with_elicensing(
                    obligation.compliance_report_version.report_compliance_summary.report_version.report.operation.operator.id
                )

                # Create fee in eLicensing
                fee_link = cls.sync_fee_with_elicensing(obligation_id, client_link)

                # Create invoice in eLicensing
                cls.sync_invoice_with_elicensing(obligation_id, client_link, fee_link)

                logger.info(f"Successfully processed obligation {obligation_id} integration with eLicensing")
        except Exception as e:
            logger.error(f"Failed to process obligation {obligation_id} integration with eLicensing: {str(e)}")
            raise

    @classmethod
    def _map_obligation_to_fee_data(cls, obligation: ComplianceObligation) -> Dict[str, Any]:
        """
        Map obligation data to eLicensing fee data format.

        Args:
            obligation: The compliance obligation object

        Returns:
            A dictionary with fee data in the format expected by the eLicensing API
        """
        return {
            "businessAreaCode": "OBPS",
            "feeGUID": str(uuid.uuid4()),
            "feeProfileGroupName": "OBPS Compliance Obligation",
            "feeDescription": f"{obligation.compliance_report_version.compliance_report.compliance_period.reporting_year.reporting_year} GGIRCA Compliance Obligation",
            "feeAmount": float(obligation.fee_amount_dollars) if obligation.fee_amount_dollars else 0.0,
            "feeDate": obligation.fee_date.strftime("%Y-%m-%d") if obligation.fee_date else None,
        }

    @classmethod
    def _map_obligation_to_invoice_data(cls, obligation: ComplianceObligation, fee_id: str) -> Dict[str, Any]:
        """
        Map obligation data to eLicensing invoice data format.

        Args:
            obligation: The compliance obligation object
            fee_id: The eLicensing fee ID to include in the invoice

        Returns:
            A dictionary with invoice data in the format expected by the eLicensing API
        """
        return {
            "paymentDueDate": obligation.obligation_deadline.strftime("%Y-%m-%d"),
            "businessAreaCode": "OBPS",
            "fees": [fee_id],
        }

    @classmethod
    def sync_fee_with_elicensing(cls, obligation_id: int, client_link: ELicensingLink) -> ELicensingLink:
        """
        Creates a fee in eLicensing for a compliance obligation.

        Args:
            obligation_id: The ID of the compliance obligation
            client_link: The ELicensingLink for the client

        Returns:
            The ELicensingLink object for the fee

        Raises:
            ComplianceObligation.DoesNotExist: If the obligation doesn't exist
            ValueError: If client_link.elicensing_object_id is None
            Exception: For any other unexpected errors
        """
        obligation = ComplianceObligation.objects.get(id=obligation_id)
        client_id = client_link.elicensing_object_id
        if not client_id:
            raise ValueError("Client link has no elicensing_object_id")

        fee_data = cls._map_obligation_to_fee_data(obligation)

        # Create fee in eLicensing
        response = elicensing_api_client.create_fees(client_id, FeeCreationRequest(fees=[FeeCreationItem(**fee_data)]))

        fee_object_id = response.fees[0].feeObjectId
        elicensing_guid = uuid.UUID(response.fees[0].feeGUID)

        # Create link between obligation and eLicensing fee
        fee_link = ELicensingLinkService.create_link(
            obligation, fee_object_id, ELicensingLink.ObjectKind.FEE, elicensing_guid
        )

        return fee_link

    @classmethod
    def sync_invoice_with_elicensing(
        cls, obligation_id: int, client_link: ELicensingLink, fee_link: ELicensingLink
    ) -> ELicensingLink:
        """
        Creates an invoice in eLicensing for a compliance obligation.

        Args:
            obligation_id: The ID of the compliance obligation
            client_link: The ELicensingLink for the client
            fee_link: The ELicensingLink for the fee

        Returns:
            The ELicensingLink object for the invoice

        Raises:
            ComplianceObligation.DoesNotExist: If the obligation doesn't exist
            ValueError: If client_link.elicensing_object_id or fee_link.elicensing_object_id is None
            Exception: For any other unexpected errors
        """
        obligation = ComplianceObligation.objects.get(id=obligation_id)
        client_id = client_link.elicensing_object_id
        fee_id = fee_link.elicensing_object_id

        if not client_id:
            raise ValueError("Client link has no elicensing_object_id")
        if not fee_id:
            raise ValueError("Fee link has no elicensing_object_id")

        invoice_data = cls._map_obligation_to_invoice_data(obligation, fee_id)

        # Create invoice in eLicensing
        response = elicensing_api_client.create_invoice(client_id, InvoiceCreationRequest(**invoice_data))

        invoice_number = response.invoiceNumber

        # Create link between obligation and eLicensing invoice
        invoice_link = ELicensingLinkService.create_link(
            obligation, invoice_number, ELicensingLink.ObjectKind.INVOICE, elicensing_guid=uuid.uuid4()
        )

        return invoice_link
