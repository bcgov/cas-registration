import uuid
from unittest.mock import patch, MagicMock
from decimal import Decimal
from datetime import date

import pytest
import requests

from service.compliance_obligation_service import ComplianceObligationService
from compliance.models import ComplianceObligation, ComplianceSummary
from reporting.models import Report


@pytest.fixture
def mock_compliance_summary():
    """Create a mock compliance summary with required attributes"""
    summary = MagicMock(spec=ComplianceSummary)
    summary.id = 1
    summary.report = MagicMock(spec=Report)
    summary.report.operator = MagicMock()
    summary.report.operator.id = uuid.uuid4()
    summary.report.reporting_year_id = 2023
    return summary


@pytest.fixture
def mock_compliance_obligation():
    """Create a mock compliance obligation"""
    obligation = MagicMock(spec=ComplianceObligation)
    obligation.id = 1
    obligation.status = ComplianceObligation.ObligationStatus.OBLIGATION_NOT_MET
    return obligation


@pytest.fixture
def mock_compliance_fee():
    """Create a mock compliance fee"""
    fee = MagicMock()
    fee.id = 1
    return fee


class TestComplianceObligationService:
    """Tests for the ComplianceObligationService class"""

    @pytest.mark.django_db
    @patch('service.compliance_obligation_service.ComplianceSummary.objects.get')
    @patch('service.compliance_obligation_service.ComplianceObligation.objects.create')
    @patch('service.compliance_obligation_service.ComplianceFeeService.create_compliance_fee')
    def test_create_compliance_obligation_success(
        self, mock_create_fee, mock_create, mock_get_summary, mock_compliance_summary, mock_compliance_obligation, mock_compliance_fee
    ):
        """Test successful creation of a compliance obligation"""
        # Set up mocks
        mock_get_summary.return_value = mock_compliance_summary
        mock_create.return_value = mock_compliance_obligation
        mock_create_fee.return_value = mock_compliance_fee

        # Call the method
        result = ComplianceObligationService.create_compliance_obligation(
            compliance_summary_id=1, emissions_amount=Decimal('100.0'), reporting_year=2023
        )

        # Verify results
        assert result == mock_compliance_obligation
        mock_get_summary.assert_called_once_with(id=1)
        mock_create.assert_called_once()
        mock_create_fee.assert_called_once_with(mock_compliance_obligation.id)

    @pytest.mark.django_db
    @patch('service.compliance_obligation_service.ComplianceSummary.objects.get')
    @patch('service.compliance_obligation_service.ComplianceObligation.objects.create')
    @patch('service.compliance_obligation_service.ComplianceFeeService.create_compliance_fee')
    def test_create_compliance_obligation_fee_creation_fails(
        self, mock_create_fee, mock_create, mock_get_summary, mock_compliance_summary, mock_compliance_obligation
    ):
        """Test compliance obligation creation when fee creation fails"""
        # Set up mocks
        mock_get_summary.return_value = mock_compliance_summary
        mock_create.return_value = mock_compliance_obligation
        
        # Mock fee creation failure
        mock_create_fee.return_value = None

        # Call the method
        result = ComplianceObligationService.create_compliance_obligation(
            compliance_summary_id=1, emissions_amount=Decimal('100.0'), reporting_year=2023
        )

        # Verify results - obligation should still be created even if fee creation fails
        assert result == mock_compliance_obligation
        mock_get_summary.assert_called_once_with(id=1)
        mock_create.assert_called_once()
        mock_create_fee.assert_called_once_with(mock_compliance_obligation.id)

    @pytest.mark.django_db
    @patch('service.compliance_obligation_service.ComplianceSummary.objects.get')
    @patch('service.compliance_obligation_service.ComplianceObligation.objects.create')
    @patch('service.compliance_obligation_service.ComplianceFeeService.create_compliance_fee')
    def test_create_compliance_obligation_fee_creation_exception(
        self, mock_create_fee, mock_create, mock_get_summary, mock_compliance_summary, mock_compliance_obligation
    ):
        """Test compliance obligation creation handling exception during fee creation"""
        # Set up mocks
        mock_get_summary.return_value = mock_compliance_summary
        mock_create.return_value = mock_compliance_obligation
        
        # Mock exception during fee creation
        mock_create_fee.side_effect = Exception("Error creating fee")

        # Call the method
        result = ComplianceObligationService.create_compliance_obligation(
            compliance_summary_id=1, emissions_amount=Decimal('100.0'), reporting_year=2023
        )

        # Verify results - obligation should still be created despite fee creation error
        assert result == mock_compliance_obligation
        mock_get_summary.assert_called_once_with(id=1)
        mock_create.assert_called_once()
        mock_create_fee.assert_called_once_with(mock_compliance_obligation.id)

    def test_get_obligation_deadline(self):
        """Test get_obligation_deadline returns the correct date"""
        # Test for year 2023
        deadline = ComplianceObligationService.get_obligation_deadline(2023)
        assert deadline == date(2024, 11, 30)

        # Test for year 2022
        deadline = ComplianceObligationService.get_obligation_deadline(2022)
        assert deadline == date(2023, 11, 30)
