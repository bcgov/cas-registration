from datetime import date
from decimal import Decimal, ROUND_HALF_UP
from enum import Enum
from typing import Dict, Any
from compliance.service.elicensing.elicensing_data_refresh_service import (
    ElicensingDataRefreshService,
    ElicensingInvoice,
)
from datetime import timedelta
from django.db.models import Sum
from compliance.models import (
    ElicensingLineItem,
    ElicensingPayment,
    ElicensingAdjustment,
    ComplianceObligation,
    CompliancePenalty,
    CompliancePenaltyAccrual,
    ElicensingClientOperator,
)
import uuid
from compliance.service.elicensing.elicensing_api_client import (
    ELicensingAPIClient,
    FeeCreationRequest,
    InvoiceCreationRequest,
)
from compliance.service.elicensing.schema import FeeCreationItem
from django.db import transaction

elicensing_api_client = ELicensingAPIClient()


class PenaltyCalculationService:
    """
    Service for calculating automatic overdue penalties for compliance obligations.

    The penalty is calculated as 0.38% daily compounded on the outstanding amount
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
        refresh_result = ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id(
            compliance_report_version_id=obligation.compliance_report_version_id
        )
        penalty = CompliancePenalty.objects.get(compliance_obligation=obligation)
        last_accrual_record = penalty.compliance_penalty_accruals.all().last()
        faa_interest = refresh_result.invoice.invoice_interest_balance if refresh_result.invoice else Decimal('0.00')
        total_amount = penalty.penalty_amount + faa_interest if faa_interest else penalty.penalty_amount

        return {
            "penalty_status": obligation.penalty_status,
            "penalty_type": cls.PenaltyType.AUTOMATIC_OVERDUE.value,
            "penalty_charge_rate": cls.DAILY_PENALTY_RATE * 100,
            "days_late": penalty.compliance_penalty_accruals.count(),
            "accumulated_penalty": last_accrual_record.accumulated_penalty,  # type: ignore [union-attr]
            "accumulated_compounding": last_accrual_record.accumulated_compounded,  # type: ignore [union-attr]
            "total_penalty": penalty.penalty_amount,
            "faa_interest": faa_interest,
            "total_amount": total_amount,
            "data_is_fresh": refresh_result.data_is_fresh,
        }

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

        return ElicensingPayment.objects.filter(elicensing_line_item__in=line_items, received_date__lt=date).aggregate(
            total=Sum('amount')
        )['total'] or Decimal('0.00')

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
            elicensing_line_item__in=line_items, adjustment_date__lt=date
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

    @staticmethod
    def create_penalty_invoice(
        obligation: ComplianceObligation, total_penalty: Decimal, final_accrual_date: date
    ) -> ElicensingInvoice:
        """
        Create a fee and invoice for the penalty in elicensing

        Args:
            obligation: The compliance obligation object
            total_penalty: The total amount of the penalty to be applied to the invoice
            final_accrual_date: The last day the penalty accrued

        Returns:
            ElicensingInvoice Record
        """

        # Get the client_operator record for the responsible operator
        client_operator = ElicensingClientOperator.objects.get(
            operator_id=obligation.compliance_report_version.compliance_report.report.operator_id
        )

        # Compose the fee data for the penalty fee
        fee_data: Dict[str, Any] = {
            "businessAreaCode": "OBPS",
            "feeGUID": str(uuid.uuid4()),
            "feeProfileGroupName": "OBPS Compliance Obligation",
            "feeDescription": "Automatic Overdue Penalty",
            "feeAmount": float(total_penalty),
            "feeDate": (final_accrual_date + timedelta(days=1)).strftime("%Y-%m-%d"),
        }

        # Create fee in eLicensing
        fee_response = elicensing_api_client.create_fees(
            client_operator.client_object_id, FeeCreationRequest(fees=[FeeCreationItem(**fee_data)])
        )

        # Compose the invoice data for the penalty invoice
        invoice_data: Dict[str, Any] = {
            "paymentDueDate": (final_accrual_date + timedelta(days=30)).strftime(
                "%Y-%m-%d"
            ),  # 30 days after the triggering obligation was met
            "businessAreaCode": "OBPS",
            "fees": [fee_response.fees[0].feeObjectId],
        }

        # Create invoice in eLicensing
        invoice_response = elicensing_api_client.create_invoice(
            client_operator.client_object_id, InvoiceCreationRequest(**invoice_data)
        )

        # Create data in BCIERS database
        ElicensingDataRefreshService.refresh_data_by_invoice(
            client_operator_id=client_operator.id, invoice_number=invoice_response.invoiceNumber
        )
        invoice_record = ElicensingInvoice.objects.get(invoice_number=invoice_response.invoiceNumber)

        return invoice_record

    @classmethod
    @transaction.atomic
    def calculate_penalty(
        cls,
        obligation: ComplianceObligation,
        persist_penalty_data: bool = False,
        accrual_start_date: date | None = None,
        final_accrual_date: date | None = None,
    ) -> Dict[str, Any]:
        """
        Calculate penalty for an obligation by retrieving data from eLicensing.

        Args:
            obligation: The compliance obligation
            persist_penalty_data: Should the calculation persist the penalty data to the database, default False
            final_accrual_date: The last day that the penalty accrued, default None

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
                - data_is_fresh: Flag indicating if the data is fresh from the eLicensing API
        """
        refresh_result = ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id(
            compliance_report_version_id=obligation.compliance_report_version_id
        )

        invoice = refresh_result.invoice

        if persist_penalty_data:
            compliance_penalty_record = CompliancePenalty.objects.create(
                compliance_obligation=obligation,
                fee_date=date.today(),
                accrual_start_date=accrual_start_date.strftime("%Y-%m-%d"),  # type: ignore[union-attr]
            )

        last_calculation_day = final_accrual_date if final_accrual_date else cls.TODAY

        # Initialize variables
        base = obligation.fee_amount_dollars or Decimal('0.00')
        accumulated_penalty = Decimal('0.00')
        accumulated_compounding = Decimal('0.00')
        days_late = max(0, (last_calculation_day - invoice.due_date.date()).days)
        current_date = invoice.due_date.date() + timedelta(days=1)
        total_penalty = Decimal('0.00')

        for _ in range(1, days_late + 1):
            payments = cls.sum_payments_before_date(invoice, current_date)
            adjustments = cls.sum_adjustments_before_date(invoice, current_date)
            penalty_amount = (base - payments + adjustments) * cls.DAILY_PENALTY_RATE
            daily_compounding = (accumulated_penalty + accumulated_compounding) * cls.DAILY_PENALTY_RATE
            accumulated_penalty += penalty_amount
            accumulated_compounding += daily_compounding
            total_penalty = accumulated_penalty + accumulated_compounding

            if persist_penalty_data:
                CompliancePenaltyAccrual.objects.create(
                    compliance_penalty=compliance_penalty_record,
                    date=current_date.strftime("%Y-%m-%d"),
                    daily_penalty=penalty_amount.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
                    daily_compounded=daily_compounding.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
                    accumulated_penalty=accumulated_penalty.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
                    accumulated_compounded=accumulated_compounding.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
                )

            current_date += timedelta(days=1)

        faa_interest = invoice.invoice_interest_balance or Decimal('0.00')

        # Apply maximum penalty cap if needed
        if base > 0 and total_penalty > base * Decimal('3.00'):
            total_penalty = base * Decimal('3.00')

        if persist_penalty_data:
            penalty_invoice = PenaltyCalculationService.create_penalty_invoice(obligation=obligation, total_penalty=total_penalty.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP), final_accrual_date=final_accrual_date)  # type: ignore [arg-type]
            compliance_penalty_record.elicensing_invoice = penalty_invoice
            compliance_penalty_record.penalty_amount = total_penalty.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
            compliance_penalty_record.save()

        total_amount = total_penalty + faa_interest

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
            "data_is_fresh": refresh_result.data_is_fresh,
        }

        # Format all Decimal values to 2 decimal places
        for key, value in result.items():
            if type(value) is Decimal:
                result[key] = value.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

        return result

    @classmethod
    def create_penalty(cls, obligation: ComplianceObligation) -> CompliancePenalty:
        """
        Calculate the penalty, persist the penalty data to the database & generate an invoice in elicensing.

        Args:
            obligation: The compliance obligation object

        Returns:
            CompliancePenalty Record
        """

        # Refresh the elicensing data
        ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id(
            compliance_report_version_id=obligation.compliance_report_version_id
        )

        # Get the date at which the penalty started accruing
        penalty_accrual_start_date = obligation.elicensing_invoice.due_date + timedelta(days=1)  # type: ignore [union-attr]
        # Get the received_date of the payment that reduced the triggering obligation to 0. This is the last date that the penalty should be calculated to.
        final_payment_received_date = (
            ElicensingPayment.objects.filter(
                elicensing_line_item=(
                    ElicensingLineItem.objects.get(
                        elicensing_invoice=obligation.elicensing_invoice,
                        line_item_type=ElicensingLineItem.LineItemType.FEE,
                    )
                )
            )
            .order_by('-received_date')
            .first()
            .received_date  # type: ignore [union-attr]
        )

        # Calculate the penalty data, persist it to our database & create the invoice/fee in elicensing for the penalty
        cls.calculate_penalty(
            obligation=obligation,
            persist_penalty_data=True,
            accrual_start_date=penalty_accrual_start_date,
            final_accrual_date=final_payment_received_date,
        )

        return CompliancePenalty.objects.get(compliance_obligation=obligation)
