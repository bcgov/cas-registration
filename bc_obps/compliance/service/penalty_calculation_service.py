from datetime import date
from decimal import Decimal, ROUND_HALF_UP
from enum import Enum
from typing import Dict, Any, Tuple, Optional
from compliance.models.compliance_obligation import ComplianceObligation
from compliance.service.elicensing.elicensing_data_refresh_service import (
    ElicensingDataRefreshService,
    ElicensingInvoice,
)
from datetime import timedelta
from django.db.models import Sum
from compliance.models import ElicensingLineItem, ElicensingPayment, ElicensingAdjustment


class PenaltyCalculationService:
    """
    Service for calculating automatic overdue penalties for compliance obligations.

    The penalty is calculated as 0.38% daily compounded interest on the outstanding amount
    starting the day after the November 30 deadline until the obligation is fully paid.
    """

    TODAY = date.today()
    DAILY_PENALTY_RATE = Decimal('0.0038')

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
        days_late = (cls.TODAY - invoice.due_date.date()).days
        return (days_late > 0 and invoice.outstanding_balance > Decimal('0.00')), invoice

    @classmethod
    def sum_payments_before_date(cls, invoice: ElicensingInvoice, date: date) -> Decimal:
        """
        Calculate the sum of all payments received on or before the given date.

        Args:
            invoice: The eLicensing invoice
            date: The cutoff date for payments

        Returns:
            Decimal sum of payment amounts
        """
        # Get line items for this invoice and sum payments received on or before date
        line_items = ElicensingLineItem.objects.filter(elicensing_invoice=invoice)

        return ElicensingPayment.objects.filter(
            elicensing_line_item__in=line_items, received_date__date__lte=date
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

    @classmethod
    def sum_adjustments_before_date(cls, invoice: ElicensingInvoice, date: date) -> Decimal:
        """
        Calculate the sum of all adjustments made on or before the given date.

        Args:
            invoice: The eLicensing invoice
            date: The cutoff date for adjustments

        Returns:
            Decimal sum of adjustment amounts
        """
        # Get line items for this invoice and sum adjustments made on or before date
        line_items = ElicensingLineItem.objects.filter(elicensing_invoice=invoice)

        return ElicensingAdjustment.objects.filter(
            elicensing_line_item__in=line_items, adjustment_date__date__lte=date
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

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
                - total_penalty: Total penalty from eLicensing
                - faa_interest: FAA interest from eLicensing
                - total_amount: Total penalty including FAA interest
        """

        # Initialize variables
        base = invoice.outstanding_balance
        accumulated_penalty = Decimal('0.00')
        accumulated_compounding = Decimal('0.00')
        days_late = max(0, (cls.TODAY - invoice.due_date.date()).days)
        current_date = invoice.due_date.date()

        for _ in range(1, days_late + 1):
            payments = cls.sum_payments_before_date(invoice, current_date)
            adjustments = cls.sum_adjustments_before_date(invoice, current_date)
            penalty_amount = (base - payments + adjustments) * cls.DAILY_PENALTY_RATE
            daily_compounding = (accumulated_penalty + accumulated_compounding) * cls.DAILY_PENALTY_RATE
            accumulated_penalty += penalty_amount
            accumulated_compounding += daily_compounding
            total_penalty = accumulated_penalty + accumulated_compounding

            current_date += timedelta(days=1)

        faa_interest = invoice.invoice_interest_balance or Decimal('0.00')
        total_amount = total_penalty + faa_interest

        # Apply maximum penalty cap if needed
        if base > 0 and total_amount > base * 3:
            total_amount = base * 3

        result = {
            "penalty_status": obligation.penalty_status,
            "penalty_type": cls.PenaltyType.AUTOMATIC_OVERDUE.value,
            "penalty_charge_rate": cls.DAILY_PENALTY_RATE * 100,
            "days_late": days_late,
            "accumulated_penalty": accumulated_penalty,
            "accumulated_compounding": accumulated_compounding,
            "total_penalty": total_penalty,
            "faa_interest": faa_interest,
            "total_amount": total_amount,
        }

        # Format all Decimal values to 2 decimal places
        for key, value in result.items():
            if type(value) is Decimal:
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
            "accumulated_penalty": Decimal('0'),
            "accumulated_compounding": Decimal('0'),
            "total_penalty": Decimal('0'),
            "faa_interest": Decimal('0'),
            "total_amount": Decimal('0'),
        }
