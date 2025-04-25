from decimal import Decimal
from uuid import UUID
from unittest.mock import patch, MagicMock
from django.test import SimpleTestCase
from compliance.models.compliance_summary import ComplianceSummary
from service.compliance.compliance_dashboard_service import ComplianceDashboardService


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

    @patch("service.compliance.compliance_dashboard_service.ComplianceDashboardService.get_compliance_summary_by_id")
    def test_get_compliance_summary_issuance_data_not_found(self, mock_get_summary):
        mock_get_summary.return_value = None

        result = ComplianceDashboardService.get_compliance_summary_issuance_data(self.user_guid, self.summary_id)

        self.assertIsNone(result)
        mock_get_summary.assert_called_once_with(self.user_guid, self.summary_id)

    @patch("service.compliance.compliance_dashboard_service.ComplianceDashboardService.get_compliance_summary_by_id")
    def test_with_positive_excess_emissions(self, mock_get_summary):
        mock_summary = self._patch_summary(mock_get_summary, "10.0", "100.0", "110.0")

        result = ComplianceDashboardService.get_compliance_summary_issuance_data(self.user_guid, self.summary_id)

        mock_get_summary.assert_called_once_with(self.user_guid, self.summary_id)
        self.assertEqual(result, mock_summary)
        self._assert_default_compliance_fields(result, 100, 110.0)

    @patch("service.compliance.compliance_dashboard_service.ComplianceDashboardService.get_compliance_summary_by_id")
    def test_with_negative_excess_emissions(self, mock_get_summary):
        mock_summary = self._patch_summary(mock_get_summary, "-15.0", "100.0", "85.0")

        result = ComplianceDashboardService.get_compliance_summary_issuance_data(self.user_guid, self.summary_id)

        mock_get_summary.assert_called_once_with(self.user_guid, self.summary_id)
        self.assertEqual(result, mock_summary)
        self._assert_default_compliance_fields(result, 15, 85.0)

    @patch("service.compliance.compliance_dashboard_service.ComplianceDashboardService.get_compliance_summary_by_id")
    def test_with_zero_emission_limit(self, mock_get_summary):
        mock_summary = self._patch_summary(mock_get_summary, "10.0", "0.0", "10.0")

        result = ComplianceDashboardService.get_compliance_summary_issuance_data(self.user_guid, self.summary_id)

        mock_get_summary.assert_called_once_with(self.user_guid, self.summary_id)
        self.assertEqual(result, mock_summary)
        self._assert_default_compliance_fields(result, 100, None)

    @patch("service.compliance.compliance_dashboard_service.ComplianceDashboardService.get_compliance_summary_by_id")
    def test_with_none_emission_limit(self, mock_get_summary):
        mock_summary = self._patch_summary(mock_get_summary, "10.0", None, "10.0")

        result = ComplianceDashboardService.get_compliance_summary_issuance_data(self.user_guid, self.summary_id)

        mock_get_summary.assert_called_once_with(self.user_guid, self.summary_id)
        self.assertEqual(result, mock_summary)
        self._assert_default_compliance_fields(result, 100, None)
