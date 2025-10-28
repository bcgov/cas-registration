from datetime import date
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
    ComplianceReportVersion,
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
                "penalty_charge_rate": Decimal('0.00'),
                "penalty_amount": Decimal('0.00'),
                "faa_interest": Decimal('0.00'),
                "total_amount": Decimal('0.00'),
                "data_is_fresh": refresh_result.data_is_fresh,
            }

        # Get the final payment received date
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
        )

        # Get interest rate for the penalty period, fallback to current rate
        interest_rate = (
            ElicensingInterestRate.objects.filter(
                start_date__lte=late_submission_penalty.accrual_start_date,
                end_date__gte=final_payment_received_date.received_date,
            ).first()
            if final_payment_received_date
            else None
        ) or ElicensingInterestRate.objects.filter(is_current_rate=True).first()

        if not interest_rate:
            raise ValueError("No interest rate found in database")

        annual_rate_pct = (interest_rate.interest_rate * 100).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        penalty_amount = late_submission_penalty.penalty_amount
        faa_interest = refresh_result.invoice.invoice_interest_balance if refresh_result.invoice else Decimal('0.00')
        total_amount = penalty_amount + faa_interest if faa_interest else late_submission_penalty.penalty_amount

        return {
            "has_penalty": True,
            "penalty_status": obligation.penalty_status,
            "penalty_type": CompliancePenalty.PenaltyType.LATE_SUBMISSION,
            "penalty_charge_rate": annual_rate_pct,
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
                accrual_frequency=CompliancePenalty.AccrualFrequency.DAILY,
                is_compounding=True,
                penalty_type=CompliancePenalty.PenaltyType.AUTOMATIC_OVERDUE,
            )

        last_calculation_day = final_accrual_date if final_accrual_date else cls.TODAY

        submission_date = cls._get_last_supplementary_submission_date(obligation)
        if submission_date is not None:
            effective_start_date = submission_date + timedelta(days=31)
        else:
            effective_start_date = invoice.due_date + timedelta(days=1)

        # Initialize variables
        base = obligation.fee_amount_dollars or Decimal('0.00')
        accumulated_penalty = Decimal('0.00')
        accumulated_compounding = Decimal('0.00')
        days_late = max(0, (last_calculation_day - effective_start_date).days + 1)
        current_date = effective_start_date
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

    @classmethod
    def _get_last_supplementary_submission_date(cls, obligation: ComplianceObligation) -> date | None:
        compliance_report = obligation.compliance_report_version.compliance_report
        latest_supplementary = (
            ComplianceReportVersion.objects.filter(compliance_report=compliance_report, is_supplementary=True)
            .order_by('-created_at')
            .first()
        )
        if latest_supplementary and latest_supplementary.created_at:
            compliance_period = latest_supplementary.compliance_report.compliance_period
            compliance_deadline = compliance_period.compliance_deadline
            report_submission_date = latest_supplementary.created_at.date()
            if report_submission_date > compliance_deadline:
                return report_submission_date
        return None

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

        submission_date = cls._get_last_supplementary_submission_date(obligation)
        penalty_accrual_start_date = (
            submission_date + timedelta(days=31)
            if submission_date
            else obligation.elicensing_invoice.due_date + timedelta(days=1)  # type: ignore[union-attr]
        )

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

        final_transaction_date = max(filter(None, [last_payment_received_date, last_adjustment_date]), default=None)

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
    @transaction.atomic
    def _calculate_late_submission_penalty(
        cls,
        obligation: ComplianceObligation,
        accrual_start_date: date,
        final_accrual_date: date,
        persist_penalty_data: bool = False,
    ) -> Dict[str, Any]:
        """
        Calculate late submission penalty using prime + 3% rate from ElicensingInterestRate.
        Penalty accrues monthly on the 1st day of each month from Dec 1 (day after compliance deadline) until obligation is paid.

        Args:
            obligation: The compliance obligation
            accrual_start_date: The date on which the penalty began accruing (Dec 1)
            final_accrual_date: The last day that the penalty accrued (payment date)
            persist_penalty_data: Should the calculation persist the penalty data to the database, default False

        Returns:
            Dictionary containing penalty details:
                - penalty_type: Type of penalty ("Late Submission")
                - days_late: Number of days from Dec 1 to payment date
                - accumulated_penalty: Total accumulated penalty
                - accumulated_compounding: The accumulated compound interest on previous penalties
                - total_penalty: Total penalty amount
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
                accrual_frequency=CompliancePenalty.AccrualFrequency.MONTHLY,
                is_compounding=True,
                penalty_type=CompliancePenalty.PenaltyType.LATE_SUBMISSION,
            )

        # Initialize variables
        base = obligation.fee_amount_dollars or Decimal('0.00')
        accumulated_penalty = Decimal('0.00')
        accumulated_compounding = Decimal('0.00')
        total_penalty = Decimal('0.00')
        days_late = (final_accrual_date - accrual_start_date).days + 1
        invoice = refresh_result.invoice

        # Generate list of monthly accrual dates (1st of each month)
        monthly_accrual_dates = []
        current_date = accrual_start_date

        # Add the first accrual date
        monthly_accrual_dates.append(current_date)

        # Generate subsequent months until we reach or pass final_accrual_date
        while current_date <= final_accrual_date:
            # Move to the 1st of the next month
            if current_date.month == 12:
                next_month = date(current_date.year + 1, 1, 1)
            else:
                next_month = date(current_date.year, current_date.month + 1, 1)

            if next_month <= final_accrual_date:
                monthly_accrual_dates.append(next_month)
            current_date = next_month

        # Fetch all interest rates for the period
        interest_rates = ElicensingInterestRate.objects.filter(
            start_date__lte=accrual_start_date,
            end_date__gte=final_accrual_date,
        ).order_by('start_date')

        # If no rates found for the period, use the current rate
        if not interest_rates.exists():
            interest_rates = ElicensingInterestRate.objects.filter(is_current_rate=True)

        if not interest_rates.exists():
            raise ValueError("No interest rates configured in the system")

        def get_rate_for_date(date_to_check: date) -> Decimal:
            """Helper function to get the interest rate for a specific date"""
            for rate in interest_rates:
                if rate.start_date <= date_to_check <= rate.end_date:
                    return rate.interest_rate

            return interest_rates[0].interest_rate

        # Calculate penalty for each monthly accrual date
        for accrual_date in monthly_accrual_dates:
            annual_rate = get_rate_for_date(accrual_date)
            monthly_rate = annual_rate / 12
            payments = cls.sum_payments_before_date(invoice, accrual_date)
            adjustments = cls.sum_adjustments_before_date(invoice, accrual_date)
            penalty_amount = (base - payments + adjustments) * monthly_rate
            monthly_compounding = (accumulated_penalty + accumulated_compounding) * monthly_rate
            accumulated_penalty += penalty_amount
            accumulated_compounding += monthly_compounding
            total_penalty = accumulated_penalty + accumulated_compounding

            if persist_penalty_data:
                CompliancePenaltyAccrual.objects.create(
                    compliance_penalty=compliance_penalty_record,
                    date=accrual_date,
                    interest_rate=monthly_rate.quantize(Decimal('0.0001'), rounding=ROUND_HALF_UP),
                    daily_penalty=penalty_amount.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
                    daily_compounded=monthly_compounding.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
                    accumulated_penalty=accumulated_penalty.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
                    accumulated_compounded=accumulated_compounding.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
                )

        if persist_penalty_data:
            compliance_penalty_record.penalty_amount = total_penalty.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
            compliance_penalty_record.save()

        result = {
            "penalty_status": obligation.penalty_status,
            "penalty_type": CompliancePenalty.PenaltyType.LATE_SUBMISSION,
            "penalty_charge_rate": (get_rate_for_date(final_accrual_date) * 100) / 12,
            "days_late": days_late,
            "accumulated_penalty": accumulated_penalty.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
            "accumulated_compounding": accumulated_compounding.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
            "total_penalty": total_penalty.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
        }

        return result

    @classmethod
    def create_late_submission_penalty(cls, obligation: ComplianceObligation) -> CompliancePenalty:
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

        # Get supplementary submission date and calculate payment deadline (30 days after submission)
        supplementary_submission_date = cls._get_last_supplementary_submission_date(obligation)
        payment_deadline = supplementary_submission_date + timedelta(days=30)  # type: ignore[operator]

        # Calculate late submission penalty
        cls._calculate_late_submission_penalty(
            obligation=obligation,
            accrual_start_date=late_submission_start_date,
            final_accrual_date=payment_deadline,  # type: ignore[arg-type]
            persist_penalty_data=True,
        )

        return CompliancePenalty.objects.get(
            compliance_obligation=obligation,
            penalty_type=CompliancePenalty.PenaltyType.LATE_SUBMISSION,
        )
