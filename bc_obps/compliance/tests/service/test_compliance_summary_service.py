from decimal import Decimal
import pytest
from unittest.mock import patch, MagicMock
from uuid import UUID
from compliance.models import ComplianceSummary
from compliance.service.compliance_summary_service import ComplianceSummaryService


class TestComplianceSummaryService:
    @pytest.fixture
    def mock_report_version(self):
        report_version = MagicMock()
        report_version.id = 1
        report_version.report.reporting_year_id = 2024
        return report_version

    @pytest.fixture
    def mock_compliance_data(self):
        compliance_data = MagicMock()
        compliance_data.emissions_attributable_for_reporting = Decimal('100.0')
        compliance_data.reporting_only_emissions = Decimal('10.0')
        compliance_data.emissions_attributable_for_compliance = Decimal('90.0')
        compliance_data.emissions_limit = Decimal('80.0')
        compliance_data.excess_emissions = Decimal('10.0')
        compliance_data.credited_emissions = Decimal('0.0')
        compliance_data.regulatory_values.reduction_factor = Decimal('0.95')
        compliance_data.regulatory_values.tightening_rate = Decimal('0.01')

        product = MagicMock()
        product.name = "Test Product"
        product.annual_production = Decimal('1000.0')
        product.apr_dec_production = Decimal('750.0')
        product.emission_intensity = Decimal('0.1')
        product.allocated_industrial_process_emissions = Decimal('50.0')
        product.allocated_compliance_emissions = Decimal('40.0')
        compliance_data.products = [product]

        return compliance_data

    @patch('compliance.service.compliance_summary_service.ReportVersion.objects.select_related')
    @patch('compliance.service.compliance_summary_service.ReportComplianceService.get_calculated_compliance_data')
    @patch('compliance.service.compliance_summary_service.ComplianceSummary.objects.create')
    @patch('compliance.service.compliance_summary_service.ComplianceProduct.objects.create')
    @patch('compliance.service.compliance_summary_service.ComplianceObligationService.create_compliance_obligation')
    @patch('compliance.service.compliance_summary_service.ReportProduct.objects.select_related')
    def test_create_compliance_summary_with_excess_emissions(
        self,
        mock_report_products,
        mock_create_obligation,
        mock_create_product,
        mock_create_summary,
        mock_get_compliance_data,
        mock_get_report_version,
        mock_report_version,
        mock_compliance_data,
    ):
        # Arrange
        user_guid = UUID('12345678-1234-5678-1234-567812345678')
        mock_get_report_version.return_value.get.return_value = mock_report_version
        mock_get_compliance_data.return_value = mock_compliance_data
        mock_summary = MagicMock()
        mock_create_summary.return_value = mock_summary

        # Mock report products
        mock_report_product = MagicMock()
        mock_report_product.product.name = "Test Product"
        mock_report_products.return_value.filter.return_value = [mock_report_product]

        # Act
        result = ComplianceSummaryService.create_compliance_summary(1, user_guid)

        # Assert
        mock_create_summary.assert_called_once()
        mock_create_product.assert_called_once()
        mock_create_obligation.assert_called_once()
        assert result == mock_summary

    def test_determine_compliance_status(self):
        # Test OBLIGATION_NOT_MET
        status = ComplianceSummaryService._determine_compliance_status(Decimal('10.0'), Decimal('0.0'))
        assert status == ComplianceSummary.ComplianceStatus.OBLIGATION_NOT_MET

        # Test EARNED_CREDITS
        status = ComplianceSummaryService._determine_compliance_status(Decimal('0.0'), Decimal('10.0'))
        assert status == ComplianceSummary.ComplianceStatus.EARNED_CREDITS

        # Test OBLIGATION_FULLY_MET
        status = ComplianceSummaryService._determine_compliance_status(Decimal('0.0'), Decimal('0.0'))
        assert status == ComplianceSummary.ComplianceStatus.OBLIGATION_FULLY_MET
