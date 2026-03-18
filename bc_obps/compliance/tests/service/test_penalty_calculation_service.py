import pytest
from datetime import date, timedelta
from decimal import Decimal
from unittest.mock import patch
from model_bakery import baker
from compliance.models import CompliancePenalty, CompliancePenaltyAccrual
from compliance.service.penalty_calculation_service import (
    PenaltyCalculationService,
    CalculatedPenaltyData,
    CalculatedPenaltyAccrualData,
    ElicensingInterestRate,
)
from compliance.dataclass import RefreshWrapperReturn


pytestmark = pytest.mark.django_db


class TestPenaltyCalculationService:
    def setup_method(self):
        # Create test data
        self.compliance_report_version = baker.make_recipe("compliance.tests.utils.compliance_report_version")
        self.obligation = baker.make_recipe(
            "compliance.tests.utils.compliance_obligation",
            compliance_report_version=self.compliance_report_version,
            fee_amount_dollars=Decimal("1000000.00"),
        )
        self.invoice = baker.make_recipe(
            "compliance.tests.utils.elicensing_invoice",
            due_date=date(2025, 11, 30),
            outstanding_balance=Decimal("0.00"),
            invoice_interest_balance=Decimal("5000.00"),
        )
        self.line_item = baker.make_recipe(
            "compliance.tests.utils.elicensing_line_item",
            elicensing_invoice=self.invoice,
            base_amount=Decimal("1000000.00"),
        )

        # Create payments and adjustments
        baker.make_recipe(
            "compliance.tests.utils.elicensing_payment",
            elicensing_line_item=self.line_item,
            amount=Decimal("300000.00"),
            received_date=date(2025, 11, 25),
        )
        baker.make_recipe(
            "compliance.tests.utils.elicensing_payment",
            elicensing_line_item=self.line_item,
            amount=Decimal("200000.00"),
            received_date=date(2025, 12, 1),
        )
        baker.make_recipe(
            "compliance.tests.utils.elicensing_adjustment",
            elicensing_line_item=self.line_item,
            amount=Decimal("50000.00"),
            adjustment_date=date(2025, 12, 5),
        )
        baker.make_recipe(
            "compliance.tests.utils.elicensing_adjustment",
            elicensing_line_item=self.line_item,
            amount=Decimal("-30000.00"),
            adjustment_date=date(2025, 12, 8),
        )

    def test_sum_payments_and_adjustments(self):
        """Test sum_payments_before_date and sum_adjustments_before_date"""
        # Test payments
        assert PenaltyCalculationService.sum_payments_before_date(self.invoice, date(2025, 11, 24)) == Decimal('0.00')
        assert PenaltyCalculationService.sum_payments_before_date(self.invoice, date(2025, 11, 26)) == Decimal(
            '300000.00'
        )
        assert PenaltyCalculationService.sum_payments_before_date(self.invoice, date(2025, 12, 2)) == Decimal(
            '500000.00'
        )

        # Test adjustments
        assert PenaltyCalculationService.sum_adjustments_before_date(self.invoice, date(2025, 12, 4)) == Decimal('0.00')
        assert PenaltyCalculationService.sum_adjustments_before_date(self.invoice, date(2025, 12, 6)) == Decimal(
            '50000.00'
        )
        assert PenaltyCalculationService.sum_adjustments_before_date(self.invoice, date(2025, 12, 9)) == Decimal(
            '20000.00'
        )

    @patch(
        'compliance.service.elicensing.elicensing_data_refresh_service.ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id'
    )
    def test_calculate_penalty(self, mock_refresh_data):
        """Test calculate_penalty returns correct penalty data"""
        clean_invoice = baker.make_recipe(
            "compliance.tests.utils.elicensing_invoice",
            due_date=date(2025, 11, 30),
            outstanding_balance=Decimal("1000000.00"),
            invoice_interest_balance=Decimal("0.00"),
        )
        baker.make_recipe(
            "compliance.tests.utils.elicensing_line_item",
            elicensing_invoice=clean_invoice,
            base_amount=Decimal("1000000.00"),
        )
        mock_refresh_data.return_value = RefreshWrapperReturn(data_is_fresh=True, invoice=clean_invoice)
        result = PenaltyCalculationService.calculate_penalty(self.obligation, date(2025, 12, 1), date(2025, 12, 10))

        assert result.penalty_type == CompliancePenalty.PenaltyType.AUTOMATIC_OVERDUE
        assert result.penalty_charge_rate == PenaltyCalculationService.DAILY_PENALTY_RATE * 100
        assert result.total_penalty == Decimal('38656.43')
        assert result.faa_interest == Decimal('0.00')
        assert result.total_amount == result.total_penalty

    @patch(
        'compliance.service.elicensing.elicensing_data_refresh_service.ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id'
    )
    @patch(
        'compliance.service.elicensing.elicensing_data_refresh_service.ElicensingDataRefreshService.refresh_data_by_invoice'
    )
    @patch("compliance.service.penalty_calculation_service.ElicensingClientOperator.objects.get")
    @patch(
        "compliance.service.penalty_calculation_service.PenaltyCalculationService.perform_idempotent_penalty_creation"
    )
    @patch("compliance.service.penalty_calculation_service.PenaltyCalculationService.calculate_penalty")
    @patch("compliance.service.penalty_calculation_service.ElicensingInvoice.objects.get")
    def test_create_penalty_integration(
        self,
        mock_get_invoice,
        mock_calculate,
        mock_idempotent_creation,
        mock_get_client_operator,
        mock_refresh_by_invoice,
        mock_refresh_data,
    ):
        """Test create_penalty calls calculate_penalty with expected data"""
        clean_invoice = baker.make_recipe(
            "compliance.tests.utils.elicensing_invoice",
            due_date=date(2025, 11, 30),
            outstanding_balance=Decimal("1000000.00"),
            invoice_interest_balance=Decimal("0.00"),
        )
        clean_fee = baker.make_recipe(
            "compliance.tests.utils.elicensing_line_item",
            elicensing_invoice=clean_invoice,
            base_amount=Decimal("1000000.00"),
        )
        clean_payment = baker.make_recipe(
            "compliance.tests.utils.elicensing_payment",
            elicensing_line_item=clean_fee,
            amount=Decimal("1000000.00"),
            received_date=date(2025, 12, 7),
        )
        penalty_invoice = baker.make_recipe(
            "compliance.tests.utils.elicensing_invoice",
            due_date=date(2025, 1, 8),
            outstanding_balance=Decimal("20000.00"),
            invoice_interest_balance=Decimal("0.00"),
            invoice_number='OBI000000',
        )
        self.obligation.elicensing_invoice = clean_invoice
        compliance_period = self.obligation.compliance_report_version.compliance_report.compliance_period
        compliance_deadline = compliance_period.compliance_deadline
        self.obligation.created_at = compliance_deadline - timedelta(days=1)
        self.obligation.save()

        mock_refresh_data.return_value = RefreshWrapperReturn(data_is_fresh=True, invoice=clean_invoice)
        mock_get_client_operator.return_value = baker.make_recipe(
            "compliance.tests.utils.elicensing_client_operator",
        )

        mock_idempotent_creation.return_value = baker.make_recipe(
            "compliance.tests.utils.compliance_penalty",
            compliance_obligation=self.obligation,
            penalty_type=CompliancePenalty.PenaltyType.AUTOMATIC_OVERDUE,
        )
        mock_calculate.return_value = CalculatedPenaltyData(
            penalty_type=CompliancePenalty.PenaltyType.AUTOMATIC_OVERDUE,
            penalty_charge_rate=0.5,
            days_late=2,
            accumulated_penalty=100,
            accumulated_compounding=100,
            total_penalty=200,
            faa_interest=0,
            total_amount=200,
            daily_accumulated_list=[
                CalculatedPenaltyAccrualData(
                    date='2025-12-01',
                    interest_rate=0.38,
                    daily_penalty=5,
                    daily_compounded=1,
                    accumulated_penalty=5,
                    accumulated_compounded=1,
                ),
                CalculatedPenaltyAccrualData(
                    date='2025-12-01',
                    interest_rate=0.38,
                    daily_penalty=6,
                    daily_compounded=2,
                    accumulated_penalty=6,
                    accumulated_compounded=2,
                ),
            ],
        )
        mock_refresh_by_invoice.return_value = RefreshWrapperReturn(data_is_fresh=True, invoice=penalty_invoice)
        mock_get_invoice.return_value = penalty_invoice
        PenaltyCalculationService.create_penalty(
            obligation=self.obligation,
            penalty_type=CompliancePenalty.PenaltyType.AUTOMATIC_OVERDUE,
            effective_deadline=compliance_deadline,
        )
        # Calculated with correct data
        mock_calculate.assert_called_with(
            obligation=self.obligation,
            accrual_start_date=compliance_deadline + timedelta(days=1),
            final_accrual_date=clean_payment.received_date,
        )
        # Called the idempotent creation functions with correct data
        mock_idempotent_creation.assert_called_with(
            obligation=self.obligation,
            penalty_type=CompliancePenalty.PenaltyType.AUTOMATIC_OVERDUE,
            penalty_data=mock_calculate.return_value,
            penalty_accrual_start_date=compliance_deadline + timedelta(days=1),
            final_transaction_date=clean_payment.received_date,
        )
        # Created the correct number of accrual records
        accruals = CompliancePenaltyAccrual.objects.filter(compliance_penalty=mock_idempotent_creation.return_value)
        assert accruals.count() == 2

    def test_determine_last_transaction_date(self):
        """Payment does not cover the full obligation; later adjustment fully covers the remainder."""
        clean_invoice = baker.make_recipe(
            "compliance.tests.utils.elicensing_invoice",
            due_date=date(2025, 11, 30),
            outstanding_balance=Decimal("1000000.00"),
            invoice_interest_balance=Decimal("0.00"),
        )
        clean_fee = baker.make_recipe(
            "compliance.tests.utils.elicensing_line_item",
            elicensing_invoice=clean_invoice,
            base_amount=Decimal("1000000.00"),
        )
        baker.make_recipe(
            "compliance.tests.utils.elicensing_payment",
            elicensing_line_item=clean_fee,
            amount=Decimal("500000.00"),
            received_date=date(2025, 12, 5),
        )
        later_adjustment = baker.make_recipe(
            "compliance.tests.utils.elicensing_adjustment",
            elicensing_line_item=clean_fee,
            amount=Decimal("-500000.00"),
            adjustment_date=date(2025, 12, 10),
        )
        self.obligation.elicensing_invoice = clean_invoice
        compliance_period = self.obligation.compliance_report_version.compliance_report.compliance_period
        compliance_deadline = compliance_period.compliance_deadline
        self.obligation.created_at = compliance_deadline - timedelta(days=1)
        self.obligation.save(update_fields=["created_at"])

        last_transaction_date = PenaltyCalculationService.determine_last_transaction_date(obligation=self.obligation)
        assert last_transaction_date == later_adjustment.adjustment_date

    @patch(
        'compliance.service.elicensing.elicensing_data_refresh_service.ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id'
    )
    def test_get_automatic_overdue_penalty(self, mock_refresh_data):
        clean_invoice = baker.make_recipe(
            "compliance.tests.utils.elicensing_invoice",
            due_date=date(2025, 11, 30),
            outstanding_balance=Decimal("1000000.00"),
            invoice_interest_balance=Decimal("0.00"),
        )
        mock_refresh_data.return_value = RefreshWrapperReturn(data_is_fresh=True, invoice=clean_invoice)
        compliance_penalty = baker.make_recipe(
            "compliance.tests.utils.compliance_penalty",
            compliance_obligation=self.obligation,
            penalty_amount=Decimal("1000000.00"),
        )
        result = PenaltyCalculationService.get_automatic_overdue_penalty_data(self.compliance_report_version.id)
        assert result == {
            "penalty_status": compliance_penalty.status,
            "penalty_type": CompliancePenalty.PenaltyType.AUTOMATIC_OVERDUE,
            "penalty_charge_rate": PenaltyCalculationService.DAILY_PENALTY_RATE * 100,
            "total_penalty": Decimal("1000000.00"),
            "faa_interest": Decimal("0"),
            "total_amount": Decimal("1000000.00"),
        }

    @patch(
        'compliance.service.elicensing.elicensing_data_refresh_service.ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id'
    )
    def test_get_late_submission_penalty_with_penalty(self, mock_refresh_data):
        """Test get_late_submission_penalty_data returns correct data when penalty exists"""
        clean_invoice = baker.make_recipe(
            "compliance.tests.utils.elicensing_invoice",
            due_date=date(2025, 11, 30),
            outstanding_balance=Decimal("0.00"),
            invoice_interest_balance=Decimal("0.00"),
        )
        # Create line item (required by get_late_submission_penalty_data)
        baker.make_recipe(
            "compliance.tests.utils.elicensing_line_item",
            elicensing_invoice=clean_invoice,
            base_amount=Decimal("1000000.00"),
        )
        self.obligation.elicensing_invoice = clean_invoice
        self.obligation.save()
        mock_refresh_data.return_value = RefreshWrapperReturn(data_is_fresh=True, invoice=clean_invoice)
        # Ensure there is a current interest rate available (fraction form, e.g., 6.95% => 0.0695)
        baker.make_recipe(
            "compliance.tests.utils.elicensing_interest_rate",
            start_date=date(2024, 1, 1),
            end_date=date(2025, 12, 31),
            is_current_rate=True,
            interest_rate=Decimal("0.0695"),
        )
        # Create late submission penalty
        late_penalty = baker.make_recipe(
            "compliance.tests.utils.compliance_penalty",
            compliance_obligation=self.obligation,
            penalty_amount=Decimal("15000.00"),
            penalty_type=CompliancePenalty.PenaltyType.LATE_SUBMISSION,
            accrual_frequency=CompliancePenalty.Frequency.DAILY,
            compounding_frequency=CompliancePenalty.Frequency.MONTHLY,
            status=CompliancePenalty.Status.NOT_PAID,
        )

        result = PenaltyCalculationService.get_late_submission_penalty_data(self.compliance_report_version.id)

        assert result["has_penalty"] is True
        assert result["penalty_status"] == late_penalty.status
        assert result["penalty_type"] == CompliancePenalty.PenaltyType.LATE_SUBMISSION
        assert result["penalty_amount"] == Decimal("15000.00")
        assert result["faa_interest"] == Decimal("0.00")
        assert result["total_amount"] == Decimal("15000.00")

    @patch(
        'compliance.service.elicensing.elicensing_data_refresh_service.ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id'
    )
    def test_get_late_submission_penalty_without_penalty(self, mock_refresh_data):
        """Test get_late_submission_penalty_data returns correct data when no penalty exists"""
        clean_invoice = baker.make_recipe(
            "compliance.tests.utils.elicensing_invoice",
            due_date=date(2025, 11, 30),
            outstanding_balance=Decimal("0.00"),
            invoice_interest_balance=Decimal("0.00"),
        )
        mock_refresh_data.return_value = RefreshWrapperReturn(data_is_fresh=True, invoice=clean_invoice)

        result = PenaltyCalculationService.get_late_submission_penalty_data(self.compliance_report_version.id)

        assert result["has_penalty"] is False
        assert result["penalty_status"] == CompliancePenalty.Status.NOT_PAID
        assert result["penalty_type"] == CompliancePenalty.PenaltyType.LATE_SUBMISSION
        assert result["penalty_amount"] == Decimal("0.00")
        assert result["faa_interest"] == Decimal("0.00")
        assert result["total_amount"] == Decimal("0.00")

    @patch(
        'compliance.service.elicensing.elicensing_data_refresh_service.ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id'
    )
    @patch("compliance.service.penalty_calculation_service.PenaltyCalculationService.create_penalty_invoice")
    def test_calculate_late_submission_penalty(self, mock_create_invoice, mock_refresh_data):
        """Test _calculate_late_submission_penalty creates penalty with monthly compounding"""
        clean_invoice = baker.make_recipe(
            "compliance.tests.utils.elicensing_invoice",
            due_date=date(2024, 11, 30),
            outstanding_balance=Decimal("0.00"),
            invoice_interest_balance=Decimal("0.00"),
        )
        mock_refresh_data.return_value = RefreshWrapperReturn(data_is_fresh=True, invoice=clean_invoice)

        baker.make_recipe(
            "compliance.tests.utils.elicensing_interest_rate",
            start_date=date(2024, 1, 1),
            end_date=date(2025, 12, 31),
            interest_rate=Decimal("0.0795"),
        )

        penalty_invoice = baker.make_recipe("compliance.tests.utils.elicensing_invoice")
        mock_create_invoice.return_value = penalty_invoice

        result = PenaltyCalculationService.calculate_late_submission_penalty(
            obligation=self.obligation,
            accrual_start_date=date(2024, 12, 1),
            final_accrual_date=date(2025, 4, 14),
        )

        assert result.penalty_type == CompliancePenalty.PenaltyType.LATE_SUBMISSION
        assert result.total_penalty == Decimal("29727.85")
        assert len(result.daily_accumulated_list) == 135

    @patch(
        'compliance.service.elicensing.elicensing_data_refresh_service.ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id'
    )
    @patch("compliance.service.penalty_calculation_service.PenaltyCalculationService.create_penalty_invoice")
    def test_calculate_late_submission_penalty_with_multiple_interest_rates(
        self, mock_create_invoice, mock_refresh_data
    ):
        """Test _calculate_late_submission_penalty with multiple interest rate periods during accrual."""

        clean_invoice = baker.make_recipe(
            "compliance.tests.utils.elicensing_invoice",
            due_date=date(2024, 11, 30),
            outstanding_balance=Decimal("0.00"),
            invoice_interest_balance=Decimal("0.00"),
        )
        mock_refresh_data.return_value = RefreshWrapperReturn(data_is_fresh=True, invoice=clean_invoice)

        # Rate 1: Jan 1, 2024 → Feb 28, 2025 at 6.95
        baker.make_recipe(
            "compliance.tests.utils.elicensing_interest_rate",
            start_date=date(2024, 1, 1),
            end_date=date(2025, 2, 28),
            interest_rate=Decimal("0.0695"),
            is_current_rate=False,
        )

        # Rate 2: Mar 1, 2025 → May 31, 2025 at 7.95%
        baker.make_recipe(
            "compliance.tests.utils.elicensing_interest_rate",
            start_date=date(2025, 3, 1),
            end_date=date(2025, 5, 31),
            interest_rate=Decimal("0.0795"),
            is_current_rate=False,
        )

        # Rate 3: Jun 1, 2025 → Dec 31, 2025 at 8.25%
        baker.make_recipe(
            "compliance.tests.utils.elicensing_interest_rate",
            start_date=date(2025, 6, 1),
            end_date=date(2025, 12, 31),
            interest_rate=Decimal("0.0825"),
            is_current_rate=True,
        )

        penalty_invoice = baker.make_recipe("compliance.tests.utils.elicensing_invoice")
        mock_create_invoice.return_value = penalty_invoice

        result = PenaltyCalculationService.calculate_late_submission_penalty(
            obligation=self.obligation,
            accrual_start_date=date(2024, 12, 1),
            final_accrual_date=date(2025, 7, 14),
        )

        assert result.penalty_type == CompliancePenalty.PenaltyType.LATE_SUBMISSION
        assert result.total_penalty == Decimal("46940.61")
        assert len(result.daily_accumulated_list) == (date(2025, 7, 14) - date(2024, 12, 1)).days + 1

    @patch(
        'compliance.service.elicensing.elicensing_data_refresh_service.ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id'
    )
    @patch("compliance.service.penalty_calculation_service.PenaltyCalculationService.create_penalty_invoice")
    def test_calculate_late_submission_penalty_includes_payment(self, mock_create_invoice, mock_refresh_data):
        clean_invoice = baker.make_recipe(
            "compliance.tests.utils.elicensing_invoice",
            due_date=date(2024, 11, 30),
            outstanding_balance=Decimal("0.00"),
            invoice_interest_balance=Decimal("0.00"),
        )
        clean_fee = baker.make_recipe(
            "compliance.tests.utils.elicensing_line_item",
            elicensing_invoice=clean_invoice,
            base_amount=Decimal("1000000.00"),
        )
        baker.make_recipe(
            "compliance.tests.utils.elicensing_payment",
            elicensing_line_item=clean_fee,
            amount=Decimal("200000.00"),
            received_date=date(2024, 12, 15),
        )
        mock_refresh_data.return_value = RefreshWrapperReturn(data_is_fresh=True, invoice=clean_invoice)
        baker.make_recipe(
            "compliance.tests.utils.elicensing_interest_rate",
            start_date=date(2024, 1, 1),
            end_date=date(2025, 12, 31),
            interest_rate=Decimal("0.07"),
            is_current_rate=True,
        )

        penalty_invoice = baker.make_recipe("compliance.tests.utils.elicensing_invoice")
        mock_create_invoice.return_value = penalty_invoice

        result = PenaltyCalculationService.calculate_late_submission_penalty(
            obligation=self.obligation,
            accrual_start_date=date(2024, 12, 1),
            final_accrual_date=date(2025, 2, 15),
        )

        assert result.total_penalty == Decimal("12435.15")

    @patch(
        'compliance.service.elicensing.elicensing_data_refresh_service.ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id'
    )
    @patch("compliance.service.penalty_calculation_service.PenaltyCalculationService.create_penalty_invoice")
    def test_calculate_late_submission_penalty_includes_adjustment(self, mock_create_invoice, mock_refresh_data):
        clean_invoice = baker.make_recipe(
            "compliance.tests.utils.elicensing_invoice",
            due_date=date(2024, 11, 30),
            outstanding_balance=Decimal("0.00"),
            invoice_interest_balance=Decimal("0.00"),
        )
        clean_fee = baker.make_recipe(
            "compliance.tests.utils.elicensing_line_item",
            elicensing_invoice=clean_invoice,
            base_amount=Decimal("1000000.00"),
        )
        baker.make_recipe(
            "compliance.tests.utils.elicensing_adjustment",
            elicensing_line_item=clean_fee,
            amount=Decimal("-100000.00"),
            adjustment_date=date(2024, 12, 20),
        )
        baker.make_recipe(
            "compliance.tests.utils.elicensing_adjustment",
            elicensing_line_item=clean_fee,
            amount=Decimal("50000.00"),
            adjustment_date=date(2025, 1, 10),
        )
        mock_refresh_data.return_value = RefreshWrapperReturn(data_is_fresh=True, invoice=clean_invoice)
        baker.make_recipe(
            "compliance.tests.utils.elicensing_interest_rate",
            start_date=date(2024, 1, 1),
            end_date=date(2025, 12, 31),
            interest_rate=Decimal("0.07"),
            is_current_rate=True,
        )

        penalty_invoice = baker.make_recipe("compliance.tests.utils.elicensing_invoice")
        mock_create_invoice.return_value = penalty_invoice

        result = PenaltyCalculationService.calculate_late_submission_penalty(
            obligation=self.obligation, accrual_start_date=date(2024, 12, 1), final_accrual_date=date(2025, 2, 15)
        )

        assert result.total_penalty == Decimal("14070.03")

    @patch(
        'compliance.service.elicensing.elicensing_data_refresh_service.ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id'
    )
    def test_calculate_late_submission_penalty_raises_when_interest_rate_does_not_cover_reference_date(
        self, mock_refresh_data
    ):
        """Integration: calculation should raise when no interest rate covers the reference date."""
        clean_invoice = baker.make_recipe(
            "compliance.tests.utils.elicensing_invoice",
            due_date=date(2024, 11, 30),
            outstanding_balance=Decimal("0.00"),
            invoice_interest_balance=Decimal("0.00"),
        )
        baker.make_recipe(
            "compliance.tests.utils.elicensing_line_item",
            elicensing_invoice=clean_invoice,
            base_amount=Decimal("1000000.00"),
        )
        mock_refresh_data.return_value = RefreshWrapperReturn(data_is_fresh=True, invoice=clean_invoice)

        baker.make_recipe(
            "compliance.tests.utils.elicensing_interest_rate",
            start_date=date(2025, 1, 1),
            end_date=date(2025, 12, 31),
            interest_rate=Decimal("0.0500"),
            is_current_rate=True,
        )

        with pytest.raises(ElicensingInterestRate.DoesNotExist):
            PenaltyCalculationService.calculate_late_submission_penalty(
                obligation=self.obligation, accrual_start_date=date(2024, 12, 1), final_accrual_date=date(2025, 1, 1)
            )
