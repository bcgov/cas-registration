from decimal import Decimal
from uuid import UUID
from unittest.mock import patch, MagicMock
from unittest import TestCase
from compliance.models.compliance_summary import ComplianceSummary
from service.compliance.compliance_dashboard_service import ComplianceDashboardService


class TestComplianceDashboardService(TestCase):
    """Tests for the ComplianceDashboardService class"""

    def setUp(self):
        """Set up test data before each test"""
        self.user_guid = UUID("e1300fd7-2dee-47d1-b655-2ad3fd10f052")
        self.summary_id = 1

    @patch("service.compliance.compliance_dashboard_service.ComplianceDashboardService.get_compliance_summary_by_id")
    def test_get_compliance_summary_issuance_data_not_found(self, mock_get_summary):
        """Test get_compliance_summary_issuance_data when summary is not found"""
        # Arrange
        mock_get_summary.return_value = None

        # Act
        result = ComplianceDashboardService.get_compliance_summary_issuance_data(self.user_guid, self.summary_id)

        # Assert
        self.assertIsNone(result)
        mock_get_summary.assert_called_once_with(self.user_guid, self.summary_id)

    @patch("service.compliance.compliance_dashboard_service.ComplianceDashboardService.get_compliance_summary_by_id")
    def test_get_compliance_summary_issuance_data_with_positive_excess_emissions(self, mock_get_summary):
        """Test get_compliance_summary_issuance_data with positive excess emissions"""
        # Arrange
        mock_summary = MagicMock(spec=ComplianceSummary)
        mock_summary.excess_emissions = Decimal("10.0")  # Positive excess emissions
        mock_summary.emission_limit = Decimal("100.0")
        mock_summary.emissions_attributable_for_compliance = Decimal("110.0")
        mock_get_summary.return_value = mock_summary

        # Act
        result = ComplianceDashboardService.get_compliance_summary_issuance_data(self.user_guid, self.summary_id)

        # Assert
        mock_get_summary.assert_called_once_with(self.user_guid, self.summary_id)
        self.assertEqual(result, mock_summary)
        self.assertEqual(result.earned_credits, 100)  # Default value
        self.assertEqual(result.earned_credits_issued, False)
        self.assertEqual(result.issuance_status, "Issuance not requested")
        self.assertEqual(result.excess_emissions_percentage, 110.0)  # (110/100)*100

    @patch("service.compliance.compliance_dashboard_service.ComplianceDashboardService.get_compliance_summary_by_id")
    def test_get_compliance_summary_issuance_data_with_negative_excess_emissions(self, mock_get_summary):
        """Test get_compliance_summary_issuance_data with negative excess emissions (earned credits)"""
        # Arrange
        mock_summary = MagicMock(spec=ComplianceSummary)
        mock_summary.excess_emissions = Decimal("-15.0")  # Negative excess emissions (earned credits)
        mock_summary.emission_limit = Decimal("100.0")
        mock_summary.emissions_attributable_for_compliance = Decimal("85.0")
        mock_get_summary.return_value = mock_summary

        # Act
        result = ComplianceDashboardService.get_compliance_summary_issuance_data(self.user_guid, self.summary_id)

        # Assert
        mock_get_summary.assert_called_once_with(self.user_guid, self.summary_id)
        self.assertEqual(result, mock_summary)
        self.assertEqual(result.earned_credits, 15)  # abs(-15) = 15
        self.assertEqual(result.earned_credits_issued, False)
        self.assertEqual(result.issuance_status, "Issuance not requested")
        self.assertEqual(result.excess_emissions_percentage, 85.0)  # (85/100)*100

    @patch("service.compliance.compliance_dashboard_service.ComplianceDashboardService.get_compliance_summary_by_id")
    def test_get_compliance_summary_issuance_data_with_zero_emission_limit(self, mock_get_summary):
        """Test get_compliance_summary_issuance_data with zero emission limit"""
        # Arrange
        mock_summary = MagicMock(spec=ComplianceSummary)
        mock_summary.excess_emissions = Decimal("10.0")
        mock_summary.emission_limit = Decimal("0.0")  # Zero emission limit
        mock_summary.emissions_attributable_for_compliance = Decimal("10.0")
        mock_get_summary.return_value = mock_summary

        # Act
        result = ComplianceDashboardService.get_compliance_summary_issuance_data(self.user_guid, self.summary_id)

        # Assert
        mock_get_summary.assert_called_once_with(self.user_guid, self.summary_id)
        self.assertEqual(result, mock_summary)
        self.assertEqual(result.earned_credits, 100)  # Default value
        self.assertEqual(result.earned_credits_issued, False)
        self.assertEqual(result.issuance_status, "Issuance not requested")
        self.assertIsNone(result.excess_emissions_percentage)  # Should be None when emission_limit is zero

    @patch("service.compliance.compliance_dashboard_service.ComplianceDashboardService.get_compliance_summary_by_id")
    def test_get_compliance_summary_issuance_data_with_none_emission_limit(self, mock_get_summary):
        """Test get_compliance_summary_issuance_data with None emission limit"""
        # Arrange
        mock_summary = MagicMock(spec=ComplianceSummary)
        mock_summary.excess_emissions = Decimal("10.0")
        mock_summary.emission_limit = None  # None emission limit
        mock_summary.emissions_attributable_for_compliance = Decimal("10.0")
        mock_get_summary.return_value = mock_summary

        # Act
        result = ComplianceDashboardService.get_compliance_summary_issuance_data(self.user_guid, self.summary_id)

        # Assert
        mock_get_summary.assert_called_once_with(self.user_guid, self.summary_id)
        self.assertEqual(result, mock_summary)
        self.assertEqual(result.earned_credits, 100)  # Default value
        self.assertEqual(result.earned_credits_issued, False)
        self.assertEqual(result.issuance_status, "Issuance not requested")
        self.assertIsNone(result.excess_emissions_percentage)  # Should be None when emission_limit is None
