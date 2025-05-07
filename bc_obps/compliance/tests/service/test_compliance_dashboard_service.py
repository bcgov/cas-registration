from decimal import Decimal
from uuid import UUID
from unittest.mock import patch, MagicMock
from compliance.service.compliance_dashboard_service import ComplianceDashboardService
from django.test import SimpleTestCase
from compliance.models.compliance_summary import ComplianceSummary


class TestComplianceDashboardService(SimpleTestCase):
    """Tests for the ComplianceDashboardService class"""

    def setUp(self):
        self.user_guid = UUID("e1300fd7-2dee-47d1-b655-2ad3fd10f052")
        self.summary_id = 1

    @staticmethod
    def _patch_summary(mock_get_summary, excess_emissions, emission_limit, attributable):
        mock_summary = MagicMock(spec=ComplianceSummary)
        mock_summary.excess_emissions = Decimal(excess_emissions)
        mock_summary.emission_limit = Decimal(emission_limit) if emission_limit is not None else None
        mock_summary.emissions_attributable_for_compliance = Decimal(attributable)
        mock_get_summary.return_value = mock_summary
        return mock_summary

    def _assert_default_compliance_fields(self, result, earned_credits, expected_percentage):
        self.assertEqual(result.earned_credits, earned_credits)
        self.assertEqual(result.earned_credits_issued, False)
        self.assertEqual(result.issuance_status, "Issuance not requested")
        if expected_percentage is None:
            self.assertIsNone(result.excess_emissions_percentage)
        else:
            self.assertEqual(result.excess_emissions_percentage, expected_percentage)

    @patch("compliance.service.compliance_dashboard_service.ComplianceDashboardService.get_compliance_summary_by_id")
    def test_get_compliance_summary_issuance_data_not_found(self, mock_get_summary):
        mock_get_summary.return_value = None

        result = ComplianceDashboardService.get_compliance_summary_issuance_data(self.user_guid, self.summary_id)

        self.assertIsNone(result)
        mock_get_summary.assert_called_once_with(self.user_guid, self.summary_id)

    @patch("compliance.service.compliance_dashboard_service.ComplianceDashboardService.get_compliance_summary_by_id")
    def test_with_positive_excess_emissions(self, mock_get_summary):
        mock_summary = self._patch_summary(mock_get_summary, "10.0", "100.0", "110.0")

        result = ComplianceDashboardService.get_compliance_summary_issuance_data(self.user_guid, self.summary_id)

        mock_get_summary.assert_called_once_with(self.user_guid, self.summary_id)
        self.assertEqual(result, mock_summary)
        self._assert_default_compliance_fields(result, 100, 110.0)

    @patch("compliance.service.compliance_dashboard_service.ComplianceDashboardService.get_compliance_summary_by_id")
    def test_with_negative_excess_emissions(self, mock_get_summary):
        mock_summary = self._patch_summary(mock_get_summary, "-15.0", "100.0", "85.0")

        result = ComplianceDashboardService.get_compliance_summary_issuance_data(self.user_guid, self.summary_id)

        mock_get_summary.assert_called_once_with(self.user_guid, self.summary_id)
        self.assertEqual(result, mock_summary)
        self._assert_default_compliance_fields(result, 15, 85.0)

    @patch("compliance.service.compliance_dashboard_service.ComplianceDashboardService.get_compliance_summary_by_id")
    def test_with_zero_emission_limit(self, mock_get_summary):
        mock_summary = self._patch_summary(mock_get_summary, "10.0", "0.0", "10.0")

        result = ComplianceDashboardService.get_compliance_summary_issuance_data(self.user_guid, self.summary_id)

        mock_get_summary.assert_called_once_with(self.user_guid, self.summary_id)
        self.assertEqual(result, mock_summary)
        self._assert_default_compliance_fields(result, 100, None)

    @patch("compliance.service.compliance_dashboard_service.ComplianceDashboardService.get_compliance_summary_by_id")
    def test_with_none_emission_limit(self, mock_get_summary):
        mock_summary = self._patch_summary(mock_get_summary, "10.0", None, "10.0")

        result = ComplianceDashboardService.get_compliance_summary_issuance_data(self.user_guid, self.summary_id)

        mock_get_summary.assert_called_once_with(self.user_guid, self.summary_id)
        self.assertEqual(result, mock_summary)
        self._assert_default_compliance_fields(result, 100, None)

    @patch("service.compliance.compliance_dashboard_service.ComplianceDashboardService.get_compliance_summary_by_id")
    @patch(
        "service.compliance.elicensing.obligation_elicensing_service.ObligationELicensingService.get_obligation_invoice_payments"
    )
    def test_get_compliance_summary_payments_not_found(self, mock_get_payments, mock_get_summary):
        """Test when summary is not found"""
        mock_get_summary.return_value = None

        result = ComplianceDashboardService.get_compliance_summary_payments(self.user_guid, self.summary_id)

        mock_get_summary.assert_called_once_with(self.user_guid, self.summary_id)
        mock_get_payments.assert_not_called()
        self.assertEqual(result.rows, [])
        self.assertEqual(result.row_count, 0)

    @patch("service.compliance.compliance_dashboard_service.ComplianceDashboardService.get_compliance_summary_by_id")
    @patch(
        "service.compliance.elicensing.obligation_elicensing_service.ObligationELicensingService.get_obligation_invoice_payments"
    )
    def test_get_compliance_summary_payments_no_obligation(self, mock_get_payments, mock_get_summary):
        """Test when summary has no obligation"""
        mock_summary = MagicMock(spec=ComplianceSummary)
        mock_summary.obligation = None
        mock_get_summary.return_value = mock_summary

        result = ComplianceDashboardService.get_compliance_summary_payments(self.user_guid, self.summary_id)

        mock_get_summary.assert_called_once_with(self.user_guid, self.summary_id)
        mock_get_payments.assert_not_called()
        self.assertEqual(result.rows, [])
        self.assertEqual(result.row_count, 0)

    @patch("service.compliance.compliance_dashboard_service.ComplianceDashboardService.get_compliance_summary_by_id")
    @patch(
        "service.compliance.elicensing.obligation_elicensing_service.ObligationELicensingService.get_obligation_invoice_payments"
    )
    def test_get_compliance_summary_payments_no_payments(self, mock_get_payments, mock_get_summary):
        """Test when summary has obligation but no payments"""
        mock_summary = MagicMock(spec=ComplianceSummary)
        mock_obligation = MagicMock()
        mock_obligation.id = 1
        mock_summary.obligation = mock_obligation
        mock_get_summary.return_value = mock_summary
        mock_get_payments.return_value = []

        result = ComplianceDashboardService.get_compliance_summary_payments(self.user_guid, self.summary_id)

        mock_get_summary.assert_called_once_with(self.user_guid, self.summary_id)
        mock_get_payments.assert_called_once_with(mock_obligation.id)
        self.assertEqual(result.rows, [])
        self.assertEqual(result.row_count, 0)

    @patch("service.compliance.compliance_dashboard_service.ComplianceDashboardService.get_compliance_summary_by_id")
    @patch(
        "service.compliance.elicensing.obligation_elicensing_service.ObligationELicensingService.get_obligation_invoice_payments"
    )
    def test_get_compliance_summary_payments_with_payments(self, mock_get_payments, mock_get_summary):
        """Test when summary has obligation with payments"""
        mock_summary = MagicMock(spec=ComplianceSummary)
        mock_obligation = MagicMock()
        mock_obligation.id = 1
        mock_summary.obligation = mock_obligation
        mock_get_summary.return_value = mock_summary

        # Mock payment records
        mock_payment1 = MagicMock()
        mock_payment1.id = "payment1"
        mock_payment1.paymentReceivedDate = "2024-01-01"
        mock_payment1.paymentAmountApplied = 100.00
        mock_payment1.paymentMethod = "EFT/Wire - OBPS"
        mock_payment1.transactionType = "Payment"
        mock_payment1.receiptNumber = "R123"

        mock_payment2 = MagicMock()
        mock_payment2.id = "payment2"
        mock_payment2.paymentReceivedDate = "2024-01-02"
        mock_payment2.paymentAmountApplied = 200.00
        mock_payment2.paymentMethod = "EFT/Wire - OBPS"
        mock_payment2.transactionType = "Payment"
        mock_payment2.receiptNumber = "R456"

        mock_get_payments.return_value = [mock_payment1, mock_payment2]

        result = ComplianceDashboardService.get_compliance_summary_payments(self.user_guid, self.summary_id)

        mock_get_summary.assert_called_once_with(self.user_guid, self.summary_id)
        mock_get_payments.assert_called_once_with(mock_obligation.id)

        self.assertEqual(len(result.rows), 2)
        self.assertEqual(result.row_count, 2)

        # Verify first payment
        self.assertEqual(result.rows[0].id, "payment1")
        self.assertEqual(result.rows[0].paymentReceivedDate, "2024-01-01")
        self.assertEqual(result.rows[0].paymentAmountApplied, 100.00)
        self.assertEqual(result.rows[0].paymentMethod, "EFT/Wire - OBPS")
        self.assertEqual(result.rows[0].transactionType, "Payment")
        self.assertEqual(result.rows[0].receiptNumber, "R123")

        # Verify second payment
        self.assertEqual(result.rows[1].id, "payment2")
        self.assertEqual(result.rows[1].paymentReceivedDate, "2024-01-02")
        self.assertEqual(result.rows[1].paymentAmountApplied, 200.00)
        self.assertEqual(result.rows[1].paymentMethod, "EFT/Wire - OBPS")
        self.assertEqual(result.rows[1].transactionType, "Payment")
        self.assertEqual(result.rows[1].receiptNumber, "R456")
