import pytest
from datetime import date, datetime, timedelta
from decimal import Decimal
from unittest.mock import patch
from model_bakery import baker
from compliance.models import CompliancePenalty
from compliance.service.penalty_calculation_service import PenaltyCalculationService
from compliance.dataclass import RefreshWrapperReturn


pytestmark = pytest.mark.django_db


class TestPenaltyCalculationService:
    """Tests for the PenaltyCalculationService class"""

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
            due_date=datetime(2025, 11, 30),
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
            adjustment_date=datetime(2025, 12, 5),
        )
        baker.make_recipe(
            "compliance.tests.utils.elicensing_adjustment",
            elicensing_line_item=self.line_item,
            amount=Decimal("-30000.00"),
            adjustment_date=datetime(2025, 12, 8),
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
            due_date=datetime(2025, 11, 30),
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
            due_date=datetime(2025, 11, 30),
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
            due_date=datetime(2026, 1, 10),
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

    @patch(
        'compliance.service.elicensing.elicensing_data_refresh_service.ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id'
    )
    @patch("compliance.service.penalty_calculation_service.PenaltyCalculationService.calculate_penalty")
    @patch("compliance.service.penalty_calculation_service.CompliancePenalty.objects.get")
    def test_create_penalty(self, mock_get_penalty, mock_calculate, mock_refresh_data):
        """Test create_penalty calls calculate_penalty with expected data"""
        clean_invoice = baker.make_recipe(
            "compliance.tests.utils.elicensing_invoice",
            due_date=datetime(2025, 11, 30),
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
        mock_refresh_data.return_value = RefreshWrapperReturn(data_is_fresh=True, invoice=clean_invoice)
        mock_get_penalty.return_value = None
        PenaltyCalculationService.create_penalty(self.obligation)
        mock_calculate.assert_called_with(
            obligation=self.obligation,
            persist_penalty_data=True,
            accrual_start_date=clean_invoice.due_date + timedelta(days=1),
            final_accrual_date=clean_payment.received_date,
        )
