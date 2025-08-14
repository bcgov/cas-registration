from decimal import Decimal
from typing import Any, Dict
from django.db.models import Sum
from compliance.models.compliance_obligation import ComplianceObligation
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
            - data_is_fresh (bool): Whether the penalty calculation data is up to date.
            - payments_fresh (bool): Whether the payment data is up to date.
            - payments (QuerySet[ElicensingPayment]): Payments associated with the penalty invoice.
        """
        obligation = ComplianceObligation.objects.get(compliance_report_version_id=compliance_report_version_id)

        penalty_data = PenaltyCalculationService.get_penalty_data(obligation=obligation)

        payments_wrapper = ComplianceDashboardService.get_penalty_payments_by_compliance_report_version_id(
            compliance_report_version_id=compliance_report_version_id
        )

        payments = payments_wrapper.data
        payments_sum: Decimal = payments.aggregate(total=Sum("amount"))["total"] or Decimal("0.00")

        outstanding_amount: Decimal = penalty_data["total_amount"] - payments_sum

        return {
            "outstanding_amount": outstanding_amount,
            "penalty_status": penalty_data["penalty_status"],
            "data_is_fresh": penalty_data["data_is_fresh"],
            "payments_fresh": payments_wrapper.data_is_fresh,
            "payments": payments,
        }
