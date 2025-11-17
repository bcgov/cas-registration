import pytest
from datetime import date, timedelta
from decimal import Decimal
from unittest.mock import patch
from model_bakery import baker
from compliance.models import CompliancePenalty, ComplianceObligation, ElicensingInterestRate
from compliance.service.penalty_calculation_service import PenaltyCalculationService
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

    @patch("compliance.service.penalty_calculation_service.PenaltyCalculationService.TODAY", date(2025, 12, 10))
    @patch(
        'compliance.service.elicensing.elicensing_data_refresh_service.ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id'
    )
    def test_calculate_penalty_without_persistence(self, mock_refresh_data):
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
        result = PenaltyCalculationService.calculate_penalty(self.obligation)

        assert result["days_late"] == 10
        assert result["accumulated_penalty"].quantize(Decimal('0.01')) == Decimal('38000.00')
        assert result["accumulated_compounding"] == Decimal('656.43')
        assert result["faa_interest"] == Decimal('0.00')
        assert result["total_penalty"] == result["accumulated_penalty"] + result["accumulated_compounding"]

    @patch("compliance.service.penalty_calculation_service.PenaltyCalculationService.TODAY", date(2025, 12, 10))
    @patch(
        'compliance.service.elicensing.elicensing_data_refresh_service.ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id'
    )
    @patch("compliance.service.penalty_calculation_service.PenaltyCalculationService.create_penalty_invoice")
    def test_calculate_penalty_with_persistence(self, mock_create_invoice, mock_refresh_data):
        """Test calculate_penalty returns correct penalty data when persisted"""
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
        mock_create_invoice.return_value = baker.make_recipe(
            "compliance.tests.utils.elicensing_invoice",
            due_date=date(2026, 1, 10),
            outstanding_balance=Decimal("1000000.00"),
            invoice_interest_balance=Decimal("0.00"),
        )
        PenaltyCalculationService.calculate_penalty(
            obligation=self.obligation,
            persist_penalty_data=True,
            accrual_start_date=date(2025, 12, 1),
            final_accrual_date=date(2025, 12, 10),
        )
        penalty_record = CompliancePenalty.objects.get(compliance_obligation=self.obligation)
        assert penalty_record.penalty_amount == Decimal('38656.43')
        assert penalty_record.compliance_penalty_accruals.all().count() == 10
        assert penalty_record.fee_date == date.today()
        assert penalty_record.penalty_type == CompliancePenalty.PenaltyType.AUTOMATIC_OVERDUE
        assert self.obligation.penalty_status == ComplianceObligation.PenaltyStatus.NOT_PAID

    @patch(
        'compliance.service.elicensing.elicensing_data_refresh_service.ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id'
    )
    @patch("compliance.service.penalty_calculation_service.PenaltyCalculationService.calculate_penalty")
    @patch("compliance.service.penalty_calculation_service.CompliancePenalty.objects.get")
    def test_create_penalty(self, mock_get_penalty, mock_calculate, mock_refresh_data):
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
        self.obligation.elicensing_invoice = clean_invoice
        compliance_period = self.obligation.compliance_report_version.compliance_report.compliance_period
        compliance_deadline = compliance_period.compliance_deadline
        self.obligation.created_at = compliance_deadline - timedelta(days=1)
        self.obligation.save(update_fields=["created_at"])
        mock_refresh_data.return_value = RefreshWrapperReturn(data_is_fresh=True, invoice=clean_invoice)
        mock_get_penalty.return_value = None
        PenaltyCalculationService.create_penalty(self.obligation)
        mock_calculate.assert_called_with(
            obligation=self.obligation,
            persist_penalty_data=True,
            accrual_start_date=clean_invoice.due_date + timedelta(days=1),
            final_accrual_date=clean_payment.received_date,
        )

    @patch(
        'compliance.service.elicensing.elicensing_data_refresh_service.ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id'
    )
    @patch("compliance.service.penalty_calculation_service.PenaltyCalculationService.calculate_penalty")
    @patch("compliance.service.penalty_calculation_service.CompliancePenalty.objects.get")
    def test_create_penalty_uses_latest_adjustment_date_when_after_payment(
        self, mock_get_penalty, mock_calculate, mock_refresh_data
    ):
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
        mock_refresh_data.return_value = RefreshWrapperReturn(data_is_fresh=True, invoice=clean_invoice)
        mock_get_penalty.return_value = None

        PenaltyCalculationService.create_penalty(self.obligation)

        mock_calculate.assert_called_with(
            obligation=self.obligation,
            persist_penalty_data=True,
            accrual_start_date=clean_invoice.due_date + timedelta(days=1),
            final_accrual_date=later_adjustment.adjustment_date,
        )

    @patch(
        'compliance.service.elicensing.elicensing_data_refresh_service.ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id'
    )
    @patch("compliance.service.penalty_calculation_service.PenaltyCalculationService.calculate_penalty")
    @patch("compliance.service.penalty_calculation_service.CompliancePenalty.objects.get")
    def test_create_penalty_uses_adjustment_date_when_no_payments(
        self, mock_get_penalty, mock_calculate, mock_refresh_data
    ):
        """When there are no payments, use the latest adjustment date as final_accrual_date."""
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
        only_adjustment = baker.make_recipe(
            "compliance.tests.utils.elicensing_adjustment",
            elicensing_line_item=clean_fee,
            amount=Decimal("-250000.00"),
            adjustment_date=date(2025, 12, 5),
        )
        self.obligation.elicensing_invoice = clean_invoice
        compliance_period = self.obligation.compliance_report_version.compliance_report.compliance_period
        compliance_deadline = compliance_period.compliance_deadline
        self.obligation.created_at = compliance_deadline - timedelta(days=1)
        self.obligation.save(update_fields=["created_at"])
        mock_refresh_data.return_value = RefreshWrapperReturn(data_is_fresh=True, invoice=clean_invoice)
        mock_get_penalty.return_value = None

        PenaltyCalculationService.create_penalty(self.obligation)

        mock_calculate.assert_called_with(
            obligation=self.obligation,
            persist_penalty_data=True,
            accrual_start_date=clean_invoice.due_date + timedelta(days=1),
            final_accrual_date=only_adjustment.adjustment_date,
        )

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
        # accrual
        baker.make_recipe(
            "compliance.tests.utils.compliance_penalty_accrual",
            compliance_penalty=compliance_penalty,
            accumulated_penalty=5,
            accumulated_compounded=5,
        )
        result = PenaltyCalculationService.get_automatic_overdue_penalty_data(self.compliance_report_version.id)
        assert result == {
            "penalty_status": self.obligation.penalty_status,
            "penalty_type": CompliancePenalty.PenaltyType.AUTOMATIC_OVERDUE,
            "penalty_charge_rate": PenaltyCalculationService.DAILY_PENALTY_RATE * 100,
            "days_late": 1,
            "accumulated_penalty": Decimal('5'),
            "accumulated_compounding": Decimal('5'),
            "total_penalty": Decimal("1000000.00"),
            "faa_interest": Decimal("0"),
            "total_amount": Decimal("1000000.00"),
            "data_is_fresh": True,
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
        baker.make_recipe(
            "compliance.tests.utils.compliance_penalty",
            compliance_obligation=self.obligation,
            penalty_amount=Decimal("15000.00"),
            penalty_type=CompliancePenalty.PenaltyType.LATE_SUBMISSION,
            accrual_frequency=CompliancePenalty.Frequency.DAILY,
            compounding_frequency=CompliancePenalty.Frequency.MONTHLY,
        )

        result = PenaltyCalculationService.get_late_submission_penalty_data(self.compliance_report_version.id)

        assert result["has_penalty"] is True
        assert result["penalty_status"] == self.obligation.penalty_status
        assert result["penalty_type"] == CompliancePenalty.PenaltyType.LATE_SUBMISSION
        assert result["penalty_amount"] == Decimal("15000.00")
        assert result["faa_interest"] == Decimal("0.00")
        assert result["total_amount"] == Decimal("15000.00")
        assert result["data_is_fresh"] is True

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
        assert result["penalty_status"] == self.obligation.penalty_status
        assert result["penalty_type"] == CompliancePenalty.PenaltyType.LATE_SUBMISSION
        assert result["penalty_amount"] == Decimal("0.00")
        assert result["faa_interest"] == Decimal("0.00")
        assert result["total_amount"] == Decimal("0.00")
        assert result["data_is_fresh"] is True

    @patch(
        'compliance.service.elicensing.elicensing_data_refresh_service.ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id'
    )
    @patch(
        "compliance.service.penalty_calculation_service.PenaltyCalculationService._calculate_late_submission_penalty"
    )
    @patch("compliance.service.penalty_calculation_service.CompliancePenalty.objects.get")
    def test_create_late_submission_penalty_uses_payment_deadline(
        self, mock_get_penalty, mock_calculate, mock_refresh_data
    ):
        """Test create_late_submission_penalty uses payment deadline (submission + 30 days) not actual payment date"""
        clean_invoice = baker.make_recipe(
            "compliance.tests.utils.elicensing_invoice",
            due_date=date(2024, 11, 30),
            outstanding_balance=Decimal("0.00"),
            invoice_interest_balance=Decimal("0.00"),
        )
        mock_refresh_data.return_value = RefreshWrapperReturn(data_is_fresh=True, invoice=clean_invoice)
        submission_date = date(2025, 3, 15)
        self.obligation.created_at = submission_date
        self.obligation.save(update_fields=["created_at"])
        clean_fee = baker.make_recipe(
            "compliance.tests.utils.elicensing_line_item",
            elicensing_invoice=clean_invoice,
            base_amount=Decimal("1000000.00"),
        )
        baker.make_recipe(
            "compliance.tests.utils.elicensing_payment",
            elicensing_line_item=clean_fee,
            amount=Decimal("1000000.00"),
            received_date=date(2025, 5, 15),  # Actual payment date
        )
        self.obligation.elicensing_invoice = clean_invoice
        mock_penalty = baker.make_recipe(
            "compliance.tests.utils.compliance_penalty",
            compliance_obligation=self.obligation,
            penalty_type=CompliancePenalty.PenaltyType.LATE_SUBMISSION,
        )
        mock_get_penalty.return_value = mock_penalty

        PenaltyCalculationService.create_late_submission_penalty(self.obligation)

        expected_payment_deadline = submission_date + timedelta(days=30)
        expected_start_date = (
            self.obligation.compliance_report_version.compliance_report.compliance_period.compliance_deadline
            + timedelta(days=1)
        )

        mock_calculate.assert_called_once_with(
            obligation=self.obligation,
            accrual_start_date=expected_start_date,
            final_accrual_date=expected_payment_deadline,
            persist_penalty_data=True,
        )

    @patch("compliance.service.penalty_calculation_service.PenaltyCalculationService.TODAY", date(2025, 4, 15))
    @patch(
        'compliance.service.elicensing.elicensing_data_refresh_service.ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id'
    )
    def test_calculate_late_submission_penalty_with_persistence(self, mock_refresh_data):
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

        PenaltyCalculationService._calculate_late_submission_penalty(
            obligation=self.obligation,
            accrual_start_date=date(2024, 12, 1),
            final_accrual_date=date(2025, 4, 14),
            persist_penalty_data=True,
        )

        penalty_record = CompliancePenalty.objects.get(
            compliance_obligation=self.obligation, penalty_type=CompliancePenalty.PenaltyType.LATE_SUBMISSION
        )

        assert penalty_record.penalty_type == CompliancePenalty.PenaltyType.LATE_SUBMISSION
        assert penalty_record.accrual_frequency == CompliancePenalty.Frequency.DAILY
        assert penalty_record.compounding_frequency == CompliancePenalty.Frequency.MONTHLY
        assert penalty_record.accrual_start_date == date(2024, 12, 1)
        assert penalty_record.accrual_final_date == date(2025, 4, 14)
        assert penalty_record.penalty_amount == Decimal("29504.25")
        assert penalty_record.compliance_penalty_accruals.count() == 134

    @patch("compliance.service.penalty_calculation_service.PenaltyCalculationService.TODAY", date(2025, 4, 15))
    @patch(
        'compliance.service.elicensing.elicensing_data_refresh_service.ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id'
    )
    def test_calculate_late_submission_penalty_with_multiple_interest_rates(self, mock_refresh_data):
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

        PenaltyCalculationService._calculate_late_submission_penalty(
            obligation=self.obligation,
            accrual_start_date=date(2024, 12, 1),
            final_accrual_date=date(2025, 7, 14),
            persist_penalty_data=True,
        )

        penalty_record = CompliancePenalty.objects.get(
            compliance_obligation=self.obligation, penalty_type=CompliancePenalty.PenaltyType.LATE_SUBMISSION
        )

        assert penalty_record.penalty_type == CompliancePenalty.PenaltyType.LATE_SUBMISSION
        assert penalty_record.accrual_frequency == CompliancePenalty.Frequency.DAILY
        assert penalty_record.compounding_frequency == CompliancePenalty.Frequency.MONTHLY
        assert penalty_record.accrual_start_date == date(2024, 12, 1)
        assert penalty_record.penalty_amount == Decimal("47845.11")
        assert penalty_record.compliance_penalty_accruals.count() == (date(2025, 7, 14) - date(2024, 12, 1)).days

    @patch(
        'compliance.service.elicensing.elicensing_data_refresh_service.ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id'
    )
    def test_calculate_late_submission_penalty_includes_payment(self, mock_refresh_data):
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

        PenaltyCalculationService._calculate_late_submission_penalty(
            obligation=self.obligation,
            accrual_start_date=date(2024, 12, 1),
            final_accrual_date=date(2025, 2, 15),
            persist_penalty_data=True,
        )

        penalty_record = CompliancePenalty.objects.get(
            compliance_obligation=self.obligation,
            penalty_type=CompliancePenalty.PenaltyType.LATE_SUBMISSION,
        )
        assert penalty_record.penalty_amount == Decimal("12279.79")

    @patch(
        'compliance.service.elicensing.elicensing_data_refresh_service.ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id'
    )
    def test_calculate_late_submission_penalty_includes_adjustment(self, mock_refresh_data):
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

        PenaltyCalculationService._calculate_late_submission_penalty(
            obligation=self.obligation,
            accrual_start_date=date(2024, 12, 1),
            final_accrual_date=date(2025, 2, 15),
            persist_penalty_data=True,
        )

        penalty_record = CompliancePenalty.objects.get(
            compliance_obligation=self.obligation,
            penalty_type=CompliancePenalty.PenaltyType.LATE_SUBMISSION,
        )
        assert penalty_record.penalty_amount == Decimal("13885.67")

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
            PenaltyCalculationService._calculate_late_submission_penalty(
                obligation=self.obligation,
                accrual_start_date=date(2024, 12, 1),
                final_accrual_date=date(2025, 1, 1),
                persist_penalty_data=True,
            )
