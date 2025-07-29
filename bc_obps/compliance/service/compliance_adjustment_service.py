import uuid
import logging
from decimal import Decimal
from django.utils import timezone
from compliance.models.elicensing_client_operator import ElicensingClientOperator
from compliance.models.elicensing_line_item import ElicensingLineItem
from compliance.models.compliance_obligation import ComplianceObligation
from compliance.service.elicensing.elicensing_data_refresh_service import ElicensingDataRefreshService
from compliance.service.elicensing.elicensing_api_client import ELicensingAPIClient

logger = logging.getLogger(__name__)


class ComplianceAdjustmentService:
    """
    Service for handling compliance adjustments.
    """

    @classmethod
    def create_adjustment(
        cls,
        compliance_report_version_id: int,
        adjustment_total: Decimal,
        supplementary_compliance_report_version_id: int | None = None,
    ) -> None:
        """
        Creates fee adjustment connecting with elicensing service.

        Args:
            compliance_report_version_id: ID of the compliance report version to which the adjustment applies
            adjustment_total: Total amount of the adjustment to be applied
            supplementary_compliance_report_version_id: ID of the supplementary compliance report version that triggered this adjustment
        """

        # Get the compliance obligation from the compliance report version
        compliance_obligation = ComplianceObligation.objects.get(
            compliance_report_version_id=compliance_report_version_id
        )

        # Get the elicensing invoice from the compliance obligation
        elicensing_invoice = compliance_obligation.elicensing_invoice
        if not elicensing_invoice:
            raise ValueError(
                f"No elicensing invoice found for compliance obligation with compliance_report_version_id: {compliance_report_version_id}"
            )

        # Get the elicensing line item from the invoice
        elicensing_line_item = ElicensingLineItem.objects.get(
            elicensing_invoice_id=elicensing_invoice.id,
            line_item_type=ElicensingLineItem.LineItemType.FEE,
        )

        adjustment_data = [
            {
                "feeObjectId": elicensing_line_item.object_id,
                "adjustmentGUID": str(uuid.uuid4()),
                "adjustmentTotal": float(adjustment_total),
                "date": timezone.now().strftime("%Y-%m-%d"),
                "reason": "Compliance Units and/or Payments Applied",
                "type": "Adjustment",
            }
        ]
        request_body = {"adjustments": adjustment_data}

        # Grab client ID from invoice
        client_operator = ElicensingClientOperator.objects.get(id=elicensing_invoice.elicensing_client_operator_id)
        client_operator_object_id = client_operator.client_object_id

        # Call the elicensing API to create the adjustment
        elicensing_api_client = ELicensingAPIClient()
        try:
            response = elicensing_api_client.adjust_fees(client_operator_object_id, request_body)
        except Exception as e:
            logger.error(f"Failed to adjust fees: {str(e)}")
            raise ValueError("Failed to adjust fees")

        # Force refresh local wrapper to ensure local tables are up-to-date
        if response.get("clientObjectId"):
            ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id(
                compliance_report_version_id=compliance_report_version_id,
                force_refresh=True,
                supplementary_compliance_report_version_id=supplementary_compliance_report_version_id,
            )
