import pytest
from decimal import Decimal
from unittest.mock import patch, MagicMock
from service.compliance.compliance_charge_rate_service import ComplianceChargeRateService
from compliance.models.compliance_charge_rate import ComplianceChargeRate
from reporting.models.reporting_year import ReportingYear


@pytest.fixture
def mock_reporting_year():
    """Create a mock reporting year"""
    year = MagicMock(spec=ReportingYear)
    year.id = 1
    year.reporting_year = 2023
    return year


@pytest.fixture
def mock_charge_rate():
    """Create a mock compliance charge rate"""
    rate = MagicMock(spec=ComplianceChargeRate)
    rate.id = 1
    rate.reporting_year = MagicMock(spec=ReportingYear)
    rate.reporting_year.id = 1
    rate.reporting_year.reporting_year = 2023
    rate.rate = Decimal('50.00')
    return rate


class TestComplianceChargeRateService:
    """Tests for the ComplianceChargeRateService class"""

    @pytest.mark.django_db
    @patch('compliance.models.compliance_charge_rate.ComplianceChargeRate.objects.get')
    def test_get_rate_for_year_success(self, mock_get, mock_reporting_year, mock_charge_rate):
        """Test successful retrieval of charge rate for a year"""
        # Set up mock
        mock_get.return_value = mock_charge_rate

        # Call the method
        result = ComplianceChargeRateService.get_rate_for_year(mock_reporting_year)

        # Verify results
        assert result == Decimal('50.00')
        mock_get.assert_called_once_with(reporting_year=mock_reporting_year)

    @pytest.mark.django_db
    @patch('compliance.models.compliance_charge_rate.ComplianceChargeRate.objects.get')
    def test_get_rate_for_year_not_found(self, mock_get, mock_reporting_year):
        """Test handling of non-existent charge rate"""
        # Set up mock to raise DoesNotExist
        mock_get.side_effect = ComplianceChargeRate.DoesNotExist

        # Call the method and expect exception
        with pytest.raises(ComplianceChargeRate.DoesNotExist):
            ComplianceChargeRateService.get_rate_for_year(mock_reporting_year)

        # Verify mock was called
        mock_get.assert_called_once_with(reporting_year=mock_reporting_year)
