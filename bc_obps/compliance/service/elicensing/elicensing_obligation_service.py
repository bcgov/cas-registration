import logging
import uuid
from typing import Dict, Any
from zoneinfo import ZoneInfo

from django.db.models import QuerySet

from compliance.service.elicensing.elicensing_operator_service import ElicensingOperatorService
from compliance.service.elicensing.elicensing_api_client import (
    ELicensingAPIClient,
    FeeCreationRequest,
    InvoiceCreationRequest,
)
from compliance.service.elicensing.schema import FeeCreationItem
from django.db import transaction
from compliance.models import ComplianceObligation, ElicensingInvoice, ComplianceReportVersion, CompliancePeriod
from compliance.service.elicensing.elicensing_data_refresh_service import ElicensingDataRefreshService

from django.utils import timezone

logger = logging.getLogger(__name__)

elicensing_api_client = ELicensingAPIClient()


class ElicensingObligationService:
    """
    Service for managing Compliance Obligation-related eLicensing operations.
    This service handles eLicensing integration for compliance obligations,
    including fee creation and synchronization with the eLicensing system.
    """

    @classmethod
    def _is_invoice_generation_date_reached(cls, compliance_period: CompliancePeriod) -> bool:
        # Convert current UTC time to Vancouver timezone before extracting date to ensure proper comparison
        vancouver_timezone = ZoneInfo("America/Vancouver")
        current_date = timezone.now().astimezone(vancouver_timezone).date()
        return current_date >= compliance_period.invoice_generation_date

    @classmethod
    def _is_invoice_generation_date_today(cls, compliance_period: CompliancePeriod) -> bool:
        # Convert current UTC time to Vancouver timezone before extracting date to ensure proper comparison
        vancouver_timezone = ZoneInfo("America/Vancouver")
        current_date = timezone.now().astimezone(vancouver_timezone).date()
        return current_date == compliance_period.invoice_generation_date

    @classmethod
    def handle_obligation_integration(cls, obligation_id: int, compliance_period: CompliancePeriod) -> None:
        """
        Handle the obligation integration with eLicensing if the invoice generation date has passed.
        If the invoice generation date has not passed, update the status to pending invoice creation.

        Args:
            obligation_id: The ID of the compliance obligation
            compliance_period: The compliance period associated with the report
        """

        # Check if we should run the eLicensing integration based on the invoice generation date
        if cls._is_invoice_generation_date_reached(compliance_period):
            from compliance.tasks import retryable_process_obligation_integration

            # This is done outside the main transaction to prevent rollback if integration fails
            transaction.on_commit(lambda: retryable_process_obligation_integration.execute(obligation_id))
        else:
            # Update the status to pending invoice creation if the invoice generation date hasn't passed
            obligation = ComplianceObligation.objects.get(id=obligation_id)
            obligation.compliance_report_version.status = (
                ComplianceReportVersion.ComplianceStatus.OBLIGATION_PENDING_INVOICE_CREATION
            )
            obligation.compliance_report_version.save(update_fields=["status"])

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

    @classmethod
    def generate_invoices_for_current_period(cls) -> None:
        """
        Generates invoices for all obligations in the current compliance period
        that are due for invoice generation on the current date.

        This method:
        1. Gets the current reporting year
        2. Finds the corresponding compliance period
        3. Checks if today is the invoice generation date
        4. Processes all obligations for that period that don't have invoices yet
        5. Excludes superseded obligations
        """
        from service.reporting_year_service import ReportingYearService

        current_reporting_year = ReportingYearService.get_current_reporting_year()

        try:
            compliance_period = CompliancePeriod.objects.get(reporting_year=current_reporting_year)
        except CompliancePeriod.DoesNotExist:
            logger.warning(f"No compliance period found for reporting year {current_reporting_year.reporting_year}")
            return

        # Check if today is the invoice generation date
        if not cls._is_invoice_generation_date_today(compliance_period):
            return

        obligations = cls._get_obligations_for_invoice_generation(compliance_period)

        if not obligations.exists():
            logger.info("No obligations found that need invoice generation")
            return

        for obligation in obligations:
            try:
                cls.handle_obligation_integration(obligation.id, compliance_period)
            except Exception as e:
                logger.error(f"Failed to process obligation {obligation.obligation_id}: {e}")
                # Continue processing other obligations even if one fails
                continue

    @classmethod
    def _get_obligations_for_invoice_generation(
        cls, compliance_period: CompliancePeriod
    ) -> QuerySet[ComplianceObligation]:
        """
        Get obligations that need invoice generation for the given compliance period.

        Returns obligations that:
        1. Belong to the specified compliance period
        2. Don't already have an invoice (elicensing_invoice is None)
        3. Are not superseded (compliance_report_version status is not SUPERCEDED)
        """
        return (
            ComplianceObligation.objects.filter(
                compliance_report_version__compliance_report__compliance_period=compliance_period,
                elicensing_invoice__isnull=True,  # No invoice yet
            )
            .exclude(
                compliance_report_version__status=ComplianceReportVersion.ComplianceStatus.SUPERCEDED
            )  # Not superseded
            .select_related(
                'compliance_report_version__compliance_report__compliance_period', 'compliance_report_version'
            )
        )
