import pytest
from datetime import date, datetime
from decimal import Decimal
from unittest.mock import patch
from model_bakery import baker
from compliance.models import ComplianceObligation
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
            outstanding_balance=Decimal("1000000.00"),
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
            received_date=datetime(2025, 11, 25),
        )
        baker.make_recipe(
            "compliance.tests.utils.elicensing_payment",
            elicensing_line_item=self.line_item,
            amount=Decimal("200000.00"),
            received_date=datetime(2025, 12, 1),
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

    @patch("compliance.service.penalty_calculation_service.PenaltyCalculationService.TODAY", date(2025, 12, 10))
    @patch(
        "compliance.service.penalty_calculation_service.ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id"
    )
    def test_should_calculate_penalty_with_invoice(self, mock_refresh):
        """Test should_calculate_penalty returns True when conditions are met"""
        refresh_result = RefreshWrapperReturn(data_is_fresh=True, invoice=self.invoice)
        mock_refresh.return_value = refresh_result
        should_calculate, result = PenaltyCalculationService.should_calculate_penalty(self.obligation)

        assert should_calculate is True
        assert result == refresh_result

    @patch(
        "compliance.service.penalty_calculation_service.ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id"
    )
    def test_should_calculate_penalty_no_invoice(self, mock_refresh):
        """Test should_calculate_penalty raises AttributeError when no invoice exists"""
        refresh_result = RefreshWrapperReturn(data_is_fresh=True, invoice=None)
        mock_refresh.return_value = refresh_result

    @patch(
        "compliance.service.penalty_calculation_service.ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id"
    )
    def test_should_calculate_penalty_paid_status(self, mock_refresh):
        """Test should_calculate_penalty returns False when penalty status is PAID"""
        self.obligation.penalty_status = ComplianceObligation.PenaltyStatus.PAID.value
        refresh_result = RefreshWrapperReturn(data_is_fresh=True, invoice=self.invoice)
        mock_refresh.return_value = refresh_result
        should_calculate, result = PenaltyCalculationService.should_calculate_penalty(self.obligation)

        assert should_calculate is False
        assert result == refresh_result

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
    def test_calculate_penalty(self):
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
        refresh_result = RefreshWrapperReturn(data_is_fresh=True, invoice=clean_invoice)
        result = PenaltyCalculationService.calculate_penalty(self.obligation, refresh_result)

        assert result["days_late"] == 10
        assert result["accumulated_penalty"].quantize(Decimal('0.01')) == Decimal('38000.00')
        assert result["accumulated_compounding"] == Decimal('656.43')
        assert result["faa_interest"] == Decimal('0.00')
        assert result["total_penalty"] == result["accumulated_penalty"] + result["accumulated_compounding"]

    @patch("compliance.service.penalty_calculation_service.PenaltyCalculationService.should_calculate_penalty")
    @patch("compliance.service.penalty_calculation_service.PenaltyCalculationService.calculate_penalty")
    def test_get_penalty_data_with_penalty(self, mock_calculate, mock_should):
        """Test get_penalty_data when a penalty should be calculated"""
        expected_result = {"penalty_status": "ACCRUING", "total_amount": Decimal("1000.00")}
        refresh_result = RefreshWrapperReturn(data_is_fresh=True, invoice=self.invoice)
        mock_should.return_value = (True, refresh_result)
        mock_calculate.return_value = expected_result
        result = PenaltyCalculationService.get_penalty_data(self.obligation)

        assert result == expected_result
        mock_calculate.assert_called_once_with(self.obligation, refresh_result)

    @patch("compliance.service.penalty_calculation_service.PenaltyCalculationService.should_calculate_penalty")
    @patch("compliance.service.penalty_calculation_service.PenaltyCalculationService.calculate_penalty")
    @patch("compliance.service.penalty_calculation_service.PenaltyCalculationService.get_empty_penalty_data")
    def test_get_penalty_data_without_penalty(self, mock_empty, mock_calculate, mock_should):
        """Test get_penalty_data when no penalty should be calculated"""
        expected_result = {"penalty_status": "NONE", "total_amount": Decimal("0.00")}
        refresh_result = RefreshWrapperReturn(data_is_fresh=True, invoice=None)
        mock_should.return_value = (False, refresh_result)
        mock_empty.return_value = expected_result
        result = PenaltyCalculationService.get_penalty_data(self.obligation)

        assert result == expected_result
        mock_calculate.assert_not_called()
        mock_empty.assert_called_once_with(self.obligation, refresh_result.data_is_fresh)
