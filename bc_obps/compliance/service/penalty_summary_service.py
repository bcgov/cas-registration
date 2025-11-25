from decimal import Decimal
from typing import Any, Dict
from django.db.models import Sum
from compliance.enums import ComplianceInvoiceTypes
from compliance.service.penalty_calculation_service import PenaltyCalculationService
from compliance.service.compliance_dashboard_service import ComplianceDashboardService


class PenaltySummaryService:
    """
    Orchestrates retrieval of penalty calculation data and related payments for a
    given compliance report version, and computes the outstanding amount.
    """

    @classmethod
    def get_summary_by_compliance_report_version_id(cls, compliance_report_version_id: int) -> Dict[str, Any]:
        """
        Build a penalty summary for the specified compliance report version.

        Args:
            compliance_report_version_id: The ID of the compliance report version to summarize.

        Returns:
            Dict with the following keys:
            - outstanding_amount (Decimal): Remaining penalty after applying all penalty payments.
            - penalty_status (str): Current penalty status from penalty calculation data.
            - payments (QuerySet[ElicensingPayment]): Payments associated with the penalty invoice.
        """
        penalty_data = PenaltyCalculationService.get_automatic_overdue_penalty_data(compliance_report_version_id)

        payments = ComplianceDashboardService.get_penalty_payments_by_compliance_report_version_id(
            compliance_report_version_id=compliance_report_version_id,
            invoice_type=ComplianceInvoiceTypes.AUTOMATIC_OVERDUE_PENALTY,
        )

        payments_sum: Decimal = payments.aggregate(total=Sum("amount"))["total"] or Decimal("0.00")

        outstanding_amount: Decimal = penalty_data["total_amount"] - payments_sum

        return {
            "outstanding_amount": outstanding_amount,
            "penalty_status": penalty_data["penalty_status"],
            "payments": payments,
        }

    @classmethod
    def get_late_submission_summary_by_compliance_report_version_id(
        cls, compliance_report_version_id: int
    ) -> Dict[str, Any]:
        """Build a late submission (GGEAPAR interest) penalty summary for the specified compliance report version.

        Returns the remaining amount after applying all penalty payments together with the
        current penalty status and the underlying payment records.
        """

        penalty_data = PenaltyCalculationService.get_late_submission_penalty_data(compliance_report_version_id)

        payments = ComplianceDashboardService.get_penalty_payments_by_compliance_report_version_id(
            compliance_report_version_id=compliance_report_version_id,
            invoice_type=ComplianceInvoiceTypes.LATE_SUBMISSION_PENALTY,
        )

        payments_sum: Decimal = payments.aggregate(total=Sum("amount"))["total"] or Decimal("0.00")

        outstanding_amount: Decimal = penalty_data["total_amount"] - payments_sum

        return {
            "outstanding_amount": outstanding_amount,
            "penalty_status": penalty_data["penalty_status"],
            "payments": payments,
        }
