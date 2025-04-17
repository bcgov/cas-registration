import logging
import uuid
from typing import Optional, Dict, Any

from compliance.models.compliance_obligation import ComplianceObligation
from compliance.models.elicensing_link import ELicensingLink
from service.compliance.elicensing.operator_elicensing_service import OperatorELicensingService
from service.compliance.elicensing.elicensing_link_service import ELicensingLinkService
from service.compliance.elicensing.elicensing_api_client import ELicensingAPIClient
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
            Exception: For any other unexpected errors
        """
        with transaction.atomic():
            # Validate the obligation exists
            obligation = ComplianceObligation.objects.get(id=obligation_id)

            # Ensure client exists in eLicensing
            client_link = OperatorELicensingService.sync_client_with_elicensing(
                obligation.compliance_summary.report.operation.operator.id
            )
            if not client_link:
                raise Exception(f"Failed to ensure client exists for obligation {obligation_id}")

            # Create fee in eLicensing
            fee_link = cls.sync_fee_with_elicensing(obligation_id, client_link)
            if not fee_link:
                raise Exception(f"Failed to sync fee for obligation {obligation_id} with eLicensing")

            # Create invoice in eLicensing
            invoice_link = cls.sync_invoice_with_elicensing(obligation_id, client_link, fee_link)
            if not invoice_link:
                raise Exception(f"Failed to sync invoice for obligation {obligation_id} with eLicensing")

            logger.info(f"Successfully processed obligation {obligation_id} integration with eLicensing")

    @classmethod
    def _ensure_client_exists(cls, obligation: ComplianceObligation) -> Optional[ELicensingLink]:
        """
        Ensures the client exists in eLicensing for the given obligation.

        Args:
            obligation: The compliance obligation

        Returns:
            The ELicensingLink object for the client if successful, None otherwise
        """
        try:
            # Get the operator from the obligation's compliance summary
            operator = obligation.compliance_summary.report.operation.operator

            # Use OperatorELicensingService to ensure client exists
            return OperatorELicensingService.sync_client_with_elicensing(operator.id)

        except Exception as e:
            logger.error(f"Error ensuring client exists for obligation {obligation.id}: {str(e)}", exc_info=True)
            return None

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
            "feeDescription": f"{obligation.compliance_summary.compliance_period.reporting_year.reporting_year} GGIRCA Compliance Obligation",
            "feeAmount": float(obligation.fee_amount_dollars),
            "feeDate": obligation.fee_date.strftime("%Y-%m-%d"),
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
    def sync_fee_with_elicensing(cls, obligation_id: int, client_link: ELicensingLink) -> Optional[ELicensingLink]:
        """
        Creates a fee in eLicensing for a compliance obligation.

        Args:
            obligation_id: The ID of the compliance obligation
            client_link: The ELicensingLink for the client

        Returns:
            The ELicensingLink object for the fee if successful, None otherwise
        """
        try:
            obligation = ComplianceObligation.objects.get(id=obligation_id)
            client_id = client_link.elicensing_object_id

            fee_data = cls._map_obligation_to_fee_data(obligation)

            # Create fee in eLicensing
            response = elicensing_api_client.create_fees(client_id, {"fees": [fee_data]})

            if not response or "fees" not in response or not response["fees"]:
                logger.error(f"Failed to create fee in eLicensing for obligation {obligation_id}")
                return None

            fee_object_id = response["fees"][0]["feeObjectId"]
            elicensing_guid = response["fees"][0]["feeGUID"]

            # Create link between obligation and eLicensing fee
            fee_link = ELicensingLinkService.create_link(
                obligation, fee_object_id, ELicensingLink.ObjectKind.FEE, elicensing_guid
            )

            return fee_link

        except Exception as e:
            logger.error(f"Error syncing fee with eLicensing for obligation {obligation_id}: {str(e)}", exc_info=True)
            return None

    @classmethod
    def sync_invoice_with_elicensing(
        cls, obligation_id: int, client_link: ELicensingLink, fee_link: ELicensingLink
    ) -> Optional[ELicensingLink]:
        """
        Creates an invoice in eLicensing for a compliance obligation.

        Args:
            obligation_id: The ID of the compliance obligation
            client_link: The ELicensingLink for the client
            fee_link: The ELicensingLink for the fee

        Returns:
            The ELicensingLink object for the invoice if successful, None otherwise
        """
        try:
            obligation = ComplianceObligation.objects.get(id=obligation_id)
            client_id = client_link.elicensing_object_id
            fee_id = fee_link.elicensing_object_id

            invoice_data = cls._map_obligation_to_invoice_data(obligation, fee_id)

            # Create invoice in eLicensing
            response = elicensing_api_client.create_invoice(client_id, invoice_data)

            if not response or "invoiceNumber" not in response:
                logger.error(f"Failed to create invoice in eLicensing for obligation {obligation_id}")
                return None

            invoice_number = response["invoiceNumber"]

            # Create link between obligation and eLicensing invoice
            invoice_link = ELicensingLinkService.create_link(
                obligation, invoice_number, ELicensingLink.ObjectKind.INVOICE, elicensing_guid=invoice_number
            )

            return invoice_link

        except Exception as e:
            logger.error(
                f"Error syncing invoice with eLicensing for obligation {obligation_id}: {str(e)}", exc_info=True
            )
            return None
