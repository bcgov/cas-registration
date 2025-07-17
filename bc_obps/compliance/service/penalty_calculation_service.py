from datetime import date
from decimal import Decimal, ROUND_HALF_UP
from enum import Enum
from typing import Dict, Any, Tuple, Optional

from compliance.models.compliance_obligation import ComplianceObligation
from compliance.service.elicensing.elicensing_data_refresh_service import (
    ElicensingDataRefreshService,
    ElicensingInvoice,
)


class PenaltyCalculationService:
    """
    Service for calculating automatic overdue penalties for compliance obligations.

    The penalty is calculated as 0.38% daily compounded interest on the outstanding amount
    starting the day after the November 30 deadline until the obligation is fully paid.
    """

    TODAY = date(2024, 12, 31)
    DAILY_PENALTY_RATE = Decimal('0.0038')  # 0.38%
    PENALTY_PAYMENT_DEADLINE_DAYS = 30

    class PenaltyType(Enum):
        AUTOMATIC_OVERDUE = "Automatic Overdue"

    @classmethod
    def get_penalty_data(cls, obligation: ComplianceObligation) -> Dict[str, Any]:
        """
        Get penalty data for a compliance obligation.

        Args:
            obligation: The compliance obligation

        Returns:
            Dictionary containing penalty details or empty penalty data if no penalty applies
        """
        # Check if penalty calculation is needed and get the invoice if available
        should_calculate, invoice = cls.should_calculate_penalty(obligation)

        if should_calculate and invoice:
            return cls.calculate_penalty(obligation, invoice)
        else:
            return cls.get_empty_penalty_data(obligation)

    @classmethod
    def should_calculate_penalty(cls, obligation: ComplianceObligation) -> Tuple[bool, Optional[ElicensingInvoice]]:
        """
        Determine if penalty calculation is needed for a compliance obligation and get the invoice.

        Args:
            obligation: The compliance obligation

        Returns:
            Tuple containing a boolean indicating if penalty calculation is needed and the invoice (or None)
        """

        # Refresh data from eLicensing to ensure we have the latest
        refresh_result = ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id(
            compliance_report_version_id=obligation.compliance_report_version_id
        )
        invoice = refresh_result.invoice

        # Check if there's an associated eLicensing invoice
        if not invoice:
            return False, None

        # Check if penalty status is PAID (no need to calculate)
        if obligation.penalty_status == ComplianceObligation.PenaltyStatus.PAID.value:
            return False, invoice

        # Check if past deadline and has outstanding amount
        # days_late = (cls.TODAY - invoice.due_date.date()).days
        # return (days_late > 0 and invoice.outstanding_balance > Decimal('0.00')), invoice

        # Temporary until we don't overdue the payment and days_late is 0
        return True, invoice

    @classmethod
    def calculate_penalty(cls, obligation: ComplianceObligation, invoice: ElicensingInvoice) -> Dict[str, Any]:
        """
        Calculate penalty for an obligation by retrieving data from eLicensing.

        Args:
            obligation: The compliance obligation
            invoice: The eLicensing invoice with penalty data

        Returns:
            Dictionary containing penalty details retrieved from eLicensing:
                - penalty_status: Status of the penalty from the obligation
                - penalty_type: Type of penalty ("Automatic Overdue")
                - penalty_charge_rate: Daily penalty rate (0.38%)
                - days_late: Number of days past the deadline
                - accumulated_penalty: Total accumulated penalty from eLicensing
                - accumulated_compounding: The accumulated compound interest on previous penalties
                - penalty_today: Total penalty from eLicensing
                - faa_interest: FAA interest from eLicensing
                - total_amount: Total amount due including penalties and interest
                - penalty_amount: Total penalty including FAA interest
        """

        # Calculate days late based on obligation deadline and today
        days_late = max(0, (cls.TODAY - invoice.due_date.date()).days)

        # TODO: Implement calculation logic

        # Pseudo-code for penalty calculation

        # base = 1000000
        # rate = .0038
        # accumulated_compounding = 0
        # accumlated_penalty = 0
        # for i in range(1...days_late):
        #     penalty_amount = (base - (sum of payments made(received_date) on or before date) + (sum adjustments made on or before date)) * rate
        #     daily_compounding = (accumulated_penalty + accumulated_compounding) * rate
        #     accumulated_penalty += penalty_amount
        #     accumulated_compounding = accumulated_compounding + daily_compounding
        #     total_penalty = accumulated_penalty + accumulated_compounding

        # Create result dictionary
        result = {
            "penalty_status": obligation.penalty_status,
            "penalty_type": cls.PenaltyType.AUTOMATIC_OVERDUE.value,
            "days_late": days_late,
            "penalty_charge_rate": cls.DAILY_PENALTY_RATE * 100,
            # TODO: Uncomment when calculation logic will be implemented
            # "accumulated_penalty": accumulated_penalty,
            # "accumulated_compounding": Decimal('0.00'),
            # "penalty_today": penalty_today,
            # "faa_interest": faa_interest,
            # "total_amount": total_amount,
            # "penalty_amount": penalty_today + faa_interest,
        }

        # Format all Decimal values to 2 decimal places
        for key, value in result.items():
            if isinstance(value, Decimal):
                result[key] = value.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

        return result

    @classmethod
    def get_empty_penalty_data(cls, obligation: ComplianceObligation) -> Dict[str, Any]:
        """
        Return empty penalty data for a compliance obligation when no penalty applies.

        Args:
            obligation: The compliance obligation object

        Returns:
            Dictionary with default/empty penalty data
        """
        return {
            "penalty_status": obligation.penalty_status,
            "penalty_type": cls.PenaltyType.AUTOMATIC_OVERDUE.value,
            "days_late": 0,
            "penalty_charge_rate": cls.DAILY_PENALTY_RATE * 100,
            # TODO: Uncomment when calculation logic will be implemented
            # "accumulated_penalty": Decimal('0'),
            # "accumulated_compounding": Decimal('0'),
            # "penalty_today": Decimal('0'),
            # "faa_interest": Decimal('0'),
            # "total_amount": obligation.fee_amount_dollars,
            # "penalty_amount": Decimal('0'),
        }
