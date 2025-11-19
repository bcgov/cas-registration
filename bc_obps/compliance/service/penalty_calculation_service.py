from datetime import date
import calendar
from decimal import Decimal, ROUND_HALF_UP
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
    ElicensingInterestRate,
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

    @classmethod
    def get_automatic_overdue_penalty_data(cls, compliance_report_version_id: int) -> Dict[str, Any]:
        """
        Get automatic overdue penalty data for a compliance obligation.

        Args:
            compliance_report_version_id: The ID of the compliance report version

        Returns:
            Dictionary containing penalty details or CompliancePenalty.DoesNotExist if no penalty applies
        """
        refresh_result = ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id(
            compliance_report_version_id=compliance_report_version_id
        )
        obligation = ComplianceObligation.objects.get(compliance_report_version_id=compliance_report_version_id)
        penalty = CompliancePenalty.objects.get(
            compliance_obligation=obligation, penalty_type=CompliancePenalty.PenaltyType.AUTOMATIC_OVERDUE
        )
        last_accrual_record = penalty.compliance_penalty_accruals.all().last()
        faa_interest = refresh_result.invoice.invoice_interest_balance if refresh_result.invoice else Decimal('0.00')
        total_amount = penalty.penalty_amount + faa_interest if faa_interest else penalty.penalty_amount

        return {
            "penalty_status": obligation.penalty_status,
            "penalty_type": CompliancePenalty.PenaltyType.AUTOMATIC_OVERDUE,
            "penalty_charge_rate": (cls.DAILY_PENALTY_RATE * 100).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
            "days_late": penalty.compliance_penalty_accruals.count(),
            "accumulated_penalty": last_accrual_record.accumulated_penalty,  # type: ignore [union-attr]
            "accumulated_compounding": last_accrual_record.accumulated_compounded,  # type: ignore [union-attr]
            "total_penalty": penalty.penalty_amount,
            "faa_interest": faa_interest,
            "total_amount": total_amount,
            "data_is_fresh": refresh_result.data_is_fresh,
        }

    @classmethod
    def get_late_submission_penalty_data(cls, compliance_report_version_id: int) -> Dict[str, Any]:
        """
        Get late submission penalty data for a compliance obligation.
        Returns late submission penalty data calculated using prime + 3% rate, accrued monthly.

        Args:
            compliance_report_version_id: The ID of the compliance report version

        Returns:
            Dictionary containing late submission penalty details:
                - has_penalty: Boolean flag indicating if a penalty exists
                - penalty_status: Status of the penalty from the obligation
                - penalty_type: Type of penalty (LATE_SUBMISSION)
                - penalty_charge_rate: Annual interest rate percentage
                - penalty_amount: Total penalty amount
                - faa_interest: FAA interest amount (currently 0.00)
                - total_amount: Total amount including FAA interest
                - data_is_fresh: Flag indicating if data is fresh from eLicensing API
        """
        refresh_result = ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id(
            compliance_report_version_id=compliance_report_version_id
        )
        obligation = ComplianceObligation.objects.get(compliance_report_version_id=compliance_report_version_id)

        # Check if late submission penalty exists
        late_submission_penalty = CompliancePenalty.objects.filter(
            compliance_obligation=obligation, penalty_type=CompliancePenalty.PenaltyType.LATE_SUBMISSION
        ).first()

        if not late_submission_penalty:
            return {
                "has_penalty": False,
                "penalty_status": obligation.penalty_status,
                "penalty_type": CompliancePenalty.PenaltyType.LATE_SUBMISSION,
                "penalty_amount": Decimal('0.00'),
                "faa_interest": Decimal('0.00'),
                "total_amount": Decimal('0.00'),
                "data_is_fresh": refresh_result.data_is_fresh,
            }

        penalty_amount = late_submission_penalty.penalty_amount
        faa_interest = refresh_result.invoice.invoice_interest_balance if refresh_result.invoice else Decimal('0.00')
        total_amount = penalty_amount + faa_interest if faa_interest else late_submission_penalty.penalty_amount

        return {
            "has_penalty": True,
            "penalty_status": obligation.penalty_status,
            "penalty_type": CompliancePenalty.PenaltyType.LATE_SUBMISSION,
            "penalty_amount": penalty_amount,
            "faa_interest": faa_interest,
            "total_amount": total_amount,
            "data_is_fresh": refresh_result.data_is_fresh,
        }

    @classmethod
    def sum_payments_before_date(cls, invoice: ElicensingInvoice, cutoff_date: date) -> Decimal:
        """
        Calculate the sum of all payments received on or before the given date.

        Args:
            invoice: The eLicensing invoice
            cutoff_date: The cutoff date for payments

        Returns:
            Decimal sum of payment amounts
        """
        # Get line items for this invoice and sum payments received on or before date
        line_items = ElicensingLineItem.objects.filter(elicensing_invoice=invoice)

        return ElicensingPayment.objects.filter(
            elicensing_line_item__in=line_items, received_date__lt=cutoff_date
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

    @classmethod
    def sum_adjustments_before_date(cls, invoice: ElicensingInvoice, cutoff_date: date) -> Decimal:
        """
        Calculate the sum of all adjustments made on or before the given date.

        Args:
            invoice: The eLicensing invoice
            cutoff_date: The cutoff date for adjustments

        Returns:
            Decimal sum of adjustment amounts
        """
        # Get line items for this invoice and sum adjustments made on or before date
        line_items = ElicensingLineItem.objects.filter(elicensing_invoice=invoice)

        return ElicensingAdjustment.objects.filter(
            elicensing_line_item__in=line_items, adjustment_date__lt=cutoff_date
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
            "feeProfileGroupName": "OBPS Administrative Penalty",
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
                accrual_final_date=final_accrual_date,
                accrual_frequency=CompliancePenalty.Frequency.DAILY,
                compounding_frequency=CompliancePenalty.Frequency.DAILY,
                penalty_type=CompliancePenalty.PenaltyType.AUTOMATIC_OVERDUE,
            )

        last_calculation_day = final_accrual_date if final_accrual_date else cls.TODAY

        # Initialize variables
        base = obligation.fee_amount_dollars or Decimal('0.00')
        accumulated_penalty = Decimal('0.00')
        accumulated_compounding = Decimal('0.00')
        days_late = max(0, (last_calculation_day - invoice.due_date).days)
        current_date = invoice.due_date + timedelta(days=1)
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
                    interest_rate=cls.DAILY_PENALTY_RATE,
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
            obligation.penalty_status = ComplianceObligation.PenaltyStatus.NOT_PAID
            obligation.save(update_fields=['penalty_status'])

        total_amount = total_penalty + faa_interest

        result = {
            "penalty_status": obligation.penalty_status,
            "penalty_type": CompliancePenalty.PenaltyType.AUTOMATIC_OVERDUE,
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

    @staticmethod
    def determine_last_transaction_date(obligation: ComplianceObligation) -> date | None:
        # Determine the last date that reduced the triggering obligation to 0.
        fee_line_item = ElicensingLineItem.objects.get(
            elicensing_invoice=obligation.elicensing_invoice,
            line_item_type=ElicensingLineItem.LineItemType.FEE,
        )

        last_payment = (
            ElicensingPayment.objects.filter(elicensing_line_item=fee_line_item).order_by('-received_date').first()
        )
        last_payment_received_date = last_payment.received_date if last_payment else None

        last_adjustment = (
            ElicensingAdjustment.objects.filter(elicensing_line_item=fee_line_item, adjustment_date__isnull=False)
            .order_by('-adjustment_date')
            .first()
        )
        last_adjustment_date = last_adjustment.adjustment_date if last_adjustment else None

        return max(filter(None, [last_payment_received_date, last_adjustment_date]), default=None)

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

        # Determine if late submission penalty applies
        compliance_period = obligation.compliance_report_version.compliance_report.compliance_period
        compliance_deadline = compliance_period.compliance_deadline
        submission_date = obligation.created_at.date()  # type: ignore[union-attr]
        has_late_submission = submission_date > compliance_deadline

        if has_late_submission:
            cls.create_late_submission_penalty(obligation)

        penalty_accrual_start_date = obligation.elicensing_invoice.due_date + timedelta(days=1)  # type: ignore[union-attr]

        final_transaction_date = PenaltyCalculationService.determine_last_transaction_date(obligation)

        # Calculate the penalty data, persist it to our database & create the invoice/fee in elicensing for the penalty
        cls.calculate_penalty(
            obligation=obligation,
            persist_penalty_data=True,
            accrual_start_date=penalty_accrual_start_date,
            final_accrual_date=final_transaction_date,
        )

        return CompliancePenalty.objects.get(
            compliance_obligation=obligation,
            penalty_type=CompliancePenalty.PenaltyType.AUTOMATIC_OVERDUE,
        )

    @classmethod
    def _get_rate_for_date(cls, date_to_check: date) -> Decimal:
        m = date_to_check.month
        y = date_to_check.year
        match m:
            case 1 | 2 | 3:
                reference_date = date(y - 1, 12, 15)
            case 4 | 5 | 6:
                reference_date = date(y, 3, 15)
            case 7 | 8 | 9:
                reference_date = date(y, 6, 15)
            case 10 | 11 | 12:
                reference_date = date(y, 9, 15)

        annual_rate = ElicensingInterestRate.objects.get(
            start_date__lte=reference_date,
            end_date__gte=reference_date,
        ).interest_rate

        days_in_year = Decimal("366") if calendar.isleap(date_to_check.year) else Decimal("365")

        return annual_rate / days_in_year

    @classmethod
    @transaction.atomic
    def _calculate_late_submission_penalty(
        cls,
        obligation: ComplianceObligation,
        accrual_start_date: date,
        final_accrual_date: date,
        persist_penalty_data: bool = False,
    ) -> CompliancePenalty | None:
        """
        Calculate late submission penalty using prime + 3% rate from ElicensingInterestRate.
        Penalty accrues monthly on the 1st day of each month from Dec 1 (day after compliance deadline) until obligation is paid.

        Args:
            obligation: The compliance obligation
            accrual_start_date: The date on which the penalty began accruing (Dec 1)
            final_accrual_date: The last day that the penalty accrued (payment date)
            persist_penalty_data: Should the calculation persist the penalty data to the database, default False

        Returns:
            CompliancePenalty when persist_penalty_data is True; otherwise None.
        """
        refresh_result = ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id(
            compliance_report_version_id=obligation.compliance_report_version_id
        )

        if persist_penalty_data:
            compliance_penalty_record = CompliancePenalty.objects.create(
                compliance_obligation=obligation,
                fee_date=date.today(),
                accrual_start_date=accrual_start_date.strftime("%Y-%m-%d"),
                accrual_final_date=final_accrual_date,
                accrual_frequency=CompliancePenalty.Frequency.DAILY,
                compounding_frequency=CompliancePenalty.Frequency.MONTHLY,
                penalty_type=CompliancePenalty.PenaltyType.LATE_SUBMISSION,
            )

        # Initialize variables
        base = obligation.fee_amount_dollars or Decimal('0.00')
        accumulated_penalty = Decimal('0.00')
        accumulated_compounding = Decimal('0.00')
        uncompounded_penalty = Decimal('0.00')
        total_penalty = Decimal('0.00')
        invoice = refresh_result.invoice
        days_late = max(0, (final_accrual_date - accrual_start_date).days)
        current_date = accrual_start_date

        # Daily accrual with monthly compounding on the 1st of each month
        for _ in range(1, days_late + 1):
            monthly_compounding = Decimal('0.00')
            # On the 1st of each month, compound interest accrued
            if current_date.day == 1 and current_date != accrual_start_date:
                monthly_compounding = uncompounded_penalty
                accumulated_compounding += monthly_compounding
                uncompounded_penalty = Decimal('0.00')

            daily_rate = cls._get_rate_for_date(current_date)
            payments = cls.sum_payments_before_date(invoice, current_date)
            adjustments = cls.sum_adjustments_before_date(invoice, current_date)

            outstanding_base = base - payments + adjustments
            principal_for_interest = outstanding_base + accumulated_compounding
            penalty_amount = principal_for_interest * daily_rate
            uncompounded_penalty += penalty_amount
            accumulated_penalty += penalty_amount
            total_penalty = accumulated_penalty

            if persist_penalty_data:
                CompliancePenaltyAccrual.objects.create(
                    compliance_penalty=compliance_penalty_record,
                    date=current_date,
                    interest_rate=daily_rate.quantize(Decimal('0.0001'), rounding=ROUND_HALF_UP),
                    daily_penalty=penalty_amount.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
                    daily_compounded=monthly_compounding.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
                    accumulated_penalty=accumulated_penalty.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
                    accumulated_compounded=accumulated_compounding.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
                )

            current_date += timedelta(days=1)

        if persist_penalty_data:
            compliance_penalty_record.penalty_amount = total_penalty.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
            compliance_penalty_record.save()
            return compliance_penalty_record

        return None

    @classmethod
    def create_late_submission_penalty(cls, obligation: ComplianceObligation) -> CompliancePenalty | None:
        """
        Calculate late submission penalty,
        persist the penalty data to the database & generate an invoice in elicensing.

        Args:
            obligation: The compliance obligation object

        Returns:
            CompliancePenalty Record
        """

        # Refresh the elicensing data
        ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id(
            compliance_report_version_id=obligation.compliance_report_version_id
        )

        # Get the compliance deadline (Nov 30 of the year following the compliance period)
        compliance_period = obligation.compliance_report_version.compliance_report.compliance_period
        compliance_deadline = compliance_period.compliance_deadline

        # Late submission penalty: Dec 1 (day after Nov 30)
        late_submission_start_date = compliance_deadline + timedelta(days=1)

        late_submission_final_date = PenaltyCalculationService.determine_last_transaction_date(obligation)  # type: ignore[union-attr]

        # Calculate late submission penalty
        penalty_record = cls._calculate_late_submission_penalty(
            obligation=obligation,
            accrual_start_date=late_submission_start_date,
            final_accrual_date=late_submission_final_date,
            persist_penalty_data=True,
        )

        return penalty_record
