import logging
import uuid
from typing import Dict, Any

from compliance.service.elicensing.elicensing_operator_service import ElicensingOperatorService
from compliance.service.elicensing.elicensing_api_client import (
    ELicensingAPIClient,
    FeeCreationRequest,
    InvoiceCreationRequest,
)
from compliance.service.elicensing.schema import FeeCreationItem
from django.db import transaction
from compliance.models import ComplianceObligation, ElicensingInvoice, ComplianceReportVersion
from compliance.service.elicensing.elicensing_data_refresh_service import ElicensingDataRefreshService

logger = logging.getLogger(__name__)

elicensing_api_client = ELicensingAPIClient()


class ElicensingObligationService:
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
            obligation_id: The ID of the compliance obligation

        Raises:
            ComplianceObligation.DoesNotExist: If the obligation doesn't exist
            requests.RequestException: If there's an API error
        """
        from compliance.service.compliance_report_version_service import ComplianceReportVersionService

        obligation = ComplianceObligation.objects.get(id=obligation_id)
        try:
            with transaction.atomic():
                # Validate the obligation exists
                obligation = ComplianceObligation.objects.get(id=obligation_id)

                # Ensure client exists in eLicensing
                client_operator = ElicensingOperatorService.sync_client_with_elicensing(
                    obligation.compliance_report_version.compliance_report.report.operator_id
                )

                # Create fee in eLicensing
                fee_data = cls._map_obligation_to_fee_data(obligation)
                fee_response = elicensing_api_client.create_fees(
                    client_operator.client_object_id, FeeCreationRequest(fees=[FeeCreationItem(**fee_data)])
                )

                # Create invoice in eLicensing
                invoice_data = cls._map_obligation_to_invoice_data(obligation, fee_response.fees[0].feeObjectId)

                invoice_response = elicensing_api_client.create_invoice(
                    client_operator.client_object_id, InvoiceCreationRequest(**invoice_data)
                )

                # Create data in BCIERS database
                ElicensingDataRefreshService.refresh_data_by_invoice(
                    client_operator_id=client_operator.id, invoice_number=invoice_response.invoiceNumber
                )
                invoice_record = ElicensingInvoice.objects.get(invoice_number=invoice_response.invoiceNumber)
                obligation.elicensing_invoice = invoice_record
                obligation.save()

                # If successful, update the compliance status
                ComplianceReportVersionService.update_compliance_status(obligation.compliance_report_version)

        except Exception:
            obligation.compliance_report_version.status = (
                ComplianceReportVersion.ComplianceStatus.OBLIGATION_PENDING_INVOICE_CREATION
            )
            obligation.compliance_report_version.save(update_fields=["status"])
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
