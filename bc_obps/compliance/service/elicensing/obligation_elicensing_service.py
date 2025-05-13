import logging
import uuid
from typing import Dict, Any

from compliance.models.compliance_obligation import ComplianceObligation
from compliance.models.elicensing_link import ELicensingLink
from compliance.service.elicensing.operator_elicensing_service import OperatorELicensingService
from compliance.service.elicensing.elicensing_link_service import ELicensingLinkService
from compliance.service.elicensing.elicensing_api_client import (
    ELicensingAPIClient,
    FeeCreationRequest,
    FeeCreationItem,
    InvoiceCreationRequest,
)
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
    def process_obligation_integration(cls, obligation_id: int) -> None:
        """
        Processes the full eLicensing integration for a compliance obligation.
        This includes creating a fee and syncing it with eLicensing.

        Args:
            obligation_id: The ID of the compliance obligation to process

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
