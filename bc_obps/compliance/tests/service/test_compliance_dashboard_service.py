from decimal import Decimal
from uuid import UUID
from unittest.mock import patch
from compliance.service.compliance_dashboard_service import ComplianceDashboardService
from django.test import TestCase
from compliance.tests.utils.bakers import compliance_summary_baker, compliance_obligation_baker
from datetime import datetime


class TestComplianceDashboardService(TestCase):
    """Tests for the ComplianceDashboardService class"""

    def setUp(self):
        self.user_guid = UUID("e1300fd7-2dee-47d1-b655-2ad3fd10f052")
        self.summary_id = 1

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
        summary = compliance_summary_baker(
            excess_emissions=Decimal("10.0"),
            emission_limit=Decimal("100.0"),
            emissions_attributable_for_compliance=Decimal("110.0"),
        )
        mock_get_summary.return_value = summary

        result = ComplianceDashboardService.get_compliance_summary_issuance_data(self.user_guid, self.summary_id)

        mock_get_summary.assert_called_once_with(self.user_guid, self.summary_id)
        self.assertEqual(result, summary)
        self._assert_default_compliance_fields(result, 100, 110.0)

    @patch("compliance.service.compliance_dashboard_service.ComplianceDashboardService.get_compliance_summary_by_id")
    def test_with_negative_excess_emissions(self, mock_get_summary):
        summary = compliance_summary_baker(
            excess_emissions=Decimal("-15.0"),
            emission_limit=Decimal("100.0"),
            emissions_attributable_for_compliance=Decimal("85.0"),
        )
        mock_get_summary.return_value = summary

        result = ComplianceDashboardService.get_compliance_summary_issuance_data(self.user_guid, self.summary_id)

        mock_get_summary.assert_called_once_with(self.user_guid, self.summary_id)
        self.assertEqual(result, summary)
        self._assert_default_compliance_fields(result, 15, 85.0)

    @patch("compliance.service.compliance_dashboard_service.ComplianceDashboardService.get_compliance_summary_by_id")
    def test_with_zero_emission_limit(self, mock_get_summary):
        summary = compliance_summary_baker(
            excess_emissions=Decimal("10.0"),
            emission_limit=Decimal("0.0"),
            emissions_attributable_for_compliance=Decimal("10.0"),
        )
        mock_get_summary.return_value = summary

        result = ComplianceDashboardService.get_compliance_summary_issuance_data(self.user_guid, self.summary_id)

        mock_get_summary.assert_called_once_with(self.user_guid, self.summary_id)
        self.assertEqual(result, summary)
        self._assert_default_compliance_fields(result, 100, None)

    @patch("compliance.service.compliance_dashboard_service.ComplianceDashboardService.get_compliance_summary_by_id")
    def test_with_none_emission_limit(self, mock_get_summary):
        # Since emission_limit cannot be null, we'll use 0 instead
        summary = compliance_summary_baker(
            excess_emissions=Decimal("10.0"),
            emission_limit=Decimal("0.0"),
            emissions_attributable_for_compliance=Decimal("10.0"),
        )
        # Override the emission_limit after creation to simulate None
        summary.emission_limit = None
        mock_get_summary.return_value = summary

        result = ComplianceDashboardService.get_compliance_summary_issuance_data(self.user_guid, self.summary_id)

        mock_get_summary.assert_called_once_with(self.user_guid, self.summary_id)
        self.assertEqual(result, summary)
        self._assert_default_compliance_fields(result, 100, None)

    @patch("compliance.service.compliance_dashboard_service.ComplianceDashboardService.get_compliance_summary_by_id")
    @patch(
        "compliance.service.elicensing.obligation_elicensing_service.ObligationELicensingService.get_obligation_invoice_payments"
    )
    def test_get_compliance_summary_payments_not_found(self, mock_get_payments, mock_get_summary):
        """Test when summary is not found"""
        mock_get_summary.return_value = None

        result = ComplianceDashboardService.get_compliance_summary_payments(self.user_guid, self.summary_id)

        mock_get_summary.assert_called_once_with(self.user_guid, self.summary_id)
        mock_get_payments.assert_not_called()
        self.assertEqual(result.rows, [])
        self.assertEqual(result.row_count, 0)

    @patch("compliance.service.compliance_dashboard_service.ComplianceDashboardService.get_compliance_summary_by_id")
    @patch(
        "compliance.service.elicensing.obligation_elicensing_service.ObligationELicensingService.get_obligation_invoice_payments"
    )
    def test_get_compliance_summary_payments_no_payments(self, mock_get_payments, mock_get_summary):
        """Test when summary has obligation but no payments"""
        obligation = compliance_obligation_baker()
        summary = compliance_summary_baker(obligation=obligation)
        mock_get_summary.return_value = summary
        mock_get_payments.return_value = []

        result = ComplianceDashboardService.get_compliance_summary_payments(self.user_guid, self.summary_id)

        mock_get_summary.assert_called_once_with(self.user_guid, self.summary_id)
        mock_get_payments.assert_called_once_with(obligation.id)
        self.assertEqual(result.rows, [])
        self.assertEqual(result.row_count, 0)

    @patch("compliance.service.compliance_dashboard_service.ComplianceDashboardService.get_compliance_summary_by_id")
    @patch(
        "compliance.service.elicensing.obligation_elicensing_service.ObligationELicensingService.get_obligation_invoice_payments"
    )
    def test_get_compliance_summary_payments_with_payments(self, mock_get_payments, mock_get_summary):
        """Test when summary has obligation with payments"""
        obligation = compliance_obligation_baker()
        summary = compliance_summary_baker(obligation=obligation)
        mock_get_summary.return_value = summary

        # Mock payment records
        mock_payment1 = type(
            'MockPayment',
            (),
            {
                'id': "payment1",
                'paymentReceivedDate': datetime(2024, 1, 1),
                'paymentAmountApplied': Decimal("100.00"),
                'paymentMethod': "EFT/Wire - OBPS",
                'transactionType': "Payment",
                'receiptNumber': "R123",
            },
        )()

        mock_payment2 = type(
            'MockPayment',
            (),
            {
                'id': "payment2",
                'paymentReceivedDate': datetime(2024, 1, 2),
                'paymentAmountApplied': Decimal("200.00"),
                'paymentMethod': "EFT/Wire - OBPS",
                'transactionType': "Payment",
                'receiptNumber': "R456",
            },
        )()

        mock_get_payments.return_value = [mock_payment1, mock_payment2]

        result = ComplianceDashboardService.get_compliance_summary_payments(self.user_guid, self.summary_id)

        mock_get_summary.assert_called_once_with(self.user_guid, self.summary_id)
        mock_get_payments.assert_called_once_with(obligation.id)

        self.assertEqual(len(result.rows), 2)
        self.assertEqual(result.row_count, 2)

        # Verify first payment
        self.assertEqual(result.rows[0].id, "payment1")
        self.assertEqual(result.rows[0].paymentReceivedDate, datetime(2024, 1, 1))
        self.assertEqual(result.rows[0].paymentAmountApplied, Decimal("100.00"))
        self.assertEqual(result.rows[0].paymentMethod, "EFT/Wire - OBPS")
        self.assertEqual(result.rows[0].transactionType, "Payment")
        self.assertEqual(result.rows[0].receiptNumber, "R123")

        # Verify second payment
        self.assertEqual(result.rows[1].id, "payment2")
        self.assertEqual(result.rows[1].paymentReceivedDate, datetime(2024, 1, 2))
        self.assertEqual(result.rows[1].paymentAmountApplied, Decimal("200.00"))
        self.assertEqual(result.rows[1].paymentMethod, "EFT/Wire - OBPS")
        self.assertEqual(result.rows[1].transactionType, "Payment")
        self.assertEqual(result.rows[1].receiptNumber, "R456")
