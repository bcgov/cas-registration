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
    return summary


@pytest.fixture
def mock_compliance_obligation():
    """Create a mock compliance obligation"""
    obligation = MagicMock(spec=ComplianceObligation)
    obligation.id = 1
    obligation.status = ComplianceObligation.ObligationStatus.OBLIGATION_NOT_MET
    return obligation


class TestComplianceObligationService:
    """Tests for the ComplianceObligationService class"""

    @pytest.mark.django_db
    @patch('service.compliance_obligation_service.ComplianceSummary.objects.get')
    @patch('service.compliance_obligation_service.ComplianceObligation.objects.create')
    @patch('service.compliance_obligation_service.OperatorELicensingService.ensure_client_exists')
    def test_create_compliance_obligation_success(
        self, mock_ensure_client, mock_create, mock_get_summary, mock_compliance_summary, mock_compliance_obligation
    ):
        """Test successful creation of a compliance obligation with eLicensing client"""
        # Set up mocks
        mock_get_summary.return_value = mock_compliance_summary
        mock_create.return_value = mock_compliance_obligation

        # Mock successful eLicensing client creation
        mock_elicensing_link = MagicMock()
        mock_elicensing_link.elicensing_object_id = 'test-client-id'
        mock_ensure_client.return_value = mock_elicensing_link

        # Call the method
        result = ComplianceObligationService.create_compliance_obligation(
            compliance_summary_id=1, emissions_amount=Decimal('100.0'), reporting_year=2023
        )

        # Verify results
        assert result == mock_compliance_obligation
        mock_get_summary.assert_called_once_with(id=1)
        mock_create.assert_called_once()
        mock_ensure_client.assert_called_once_with(mock_compliance_summary.report.operator.id)

    @pytest.mark.django_db
    @patch('service.compliance_obligation_service.ComplianceSummary.objects.get')
    @patch('service.compliance_obligation_service.ComplianceObligation.objects.create')
    @patch('service.compliance_obligation_service.OperatorELicensingService.ensure_client_exists')
    def test_create_compliance_obligation_client_not_created(
        self, mock_ensure_client, mock_create, mock_get_summary, mock_compliance_summary, mock_compliance_obligation
    ):
        """Test compliance obligation creation when eLicensing client creation fails"""
        # Set up mocks
        mock_get_summary.return_value = mock_compliance_summary
        mock_create.return_value = mock_compliance_obligation

        # Mock failed eLicensing client creation
        mock_ensure_client.return_value = None

        # Call the method
        result = ComplianceObligationService.create_compliance_obligation(
            compliance_summary_id=1, emissions_amount=Decimal('100.0'), reporting_year=2023
        )

        # Verify results - obligation should still be created even if client fails
        assert result == mock_compliance_obligation
        mock_get_summary.assert_called_once_with(id=1)
        mock_create.assert_called_once()
        mock_ensure_client.assert_called_once_with(mock_compliance_summary.report.operator.id)

    @pytest.mark.django_db
    @patch('service.compliance_obligation_service.ComplianceSummary.objects.get')
    @patch('service.compliance_obligation_service.ComplianceObligation.objects.create')
    @patch('service.compliance_obligation_service.OperatorELicensingService.ensure_client_exists')
    def test_create_compliance_obligation_attribute_error(
        self, mock_ensure_client, mock_create, mock_get_summary, mock_compliance_summary, mock_compliance_obligation
    ):
        """Test compliance obligation creation handling AttributeError during eLicensing client creation"""
        # Set up mocks
        mock_get_summary.return_value = mock_compliance_summary
        mock_create.return_value = mock_compliance_obligation

        # Remove operator to cause AttributeError
        mock_compliance_summary.report = None

        # Call the method
        result = ComplianceObligationService.create_compliance_obligation(
            compliance_summary_id=1, emissions_amount=Decimal('100.0'), reporting_year=2023
        )

        # Verify results - obligation should still be created despite error
        assert result == mock_compliance_obligation
        mock_get_summary.assert_called_once_with(id=1)
        mock_create.assert_called_once()
        # ensure_client_exists should not be called due to AttributeError
        mock_ensure_client.assert_not_called()

    @pytest.mark.django_db
    @patch('service.compliance_obligation_service.ComplianceSummary.objects.get')
    @patch('service.compliance_obligation_service.ComplianceObligation.objects.create')
    @patch('service.compliance_obligation_service.OperatorELicensingService.ensure_client_exists')
    def test_create_compliance_obligation_request_exception(
        self, mock_ensure_client, mock_create, mock_get_summary, mock_compliance_summary, mock_compliance_obligation
    ):
        """Test compliance obligation creation handling RequestException during eLicensing client creation"""
        # Set up mocks
        mock_get_summary.return_value = mock_compliance_summary
        mock_create.return_value = mock_compliance_obligation

        # Mock RequestException during client creation
        mock_ensure_client.side_effect = requests.RequestException("API connection error")

        # Call the method
        result = ComplianceObligationService.create_compliance_obligation(
            compliance_summary_id=1, emissions_amount=Decimal('100.0'), reporting_year=2023
        )

        # Verify results - obligation should still be created despite API error
        assert result == mock_compliance_obligation
        mock_get_summary.assert_called_once_with(id=1)
        mock_create.assert_called_once()
        mock_ensure_client.assert_called_once_with(mock_compliance_summary.report.operator.id)

    @pytest.mark.django_db
    @patch('service.compliance_obligation_service.ComplianceSummary.objects.get')
    @patch('service.compliance_obligation_service.ComplianceObligation.objects.create')
    @patch('service.compliance_obligation_service.OperatorELicensingService.ensure_client_exists')
    def test_create_compliance_obligation_generic_exception(
        self, mock_ensure_client, mock_create, mock_get_summary, mock_compliance_summary, mock_compliance_obligation
    ):
        """Test compliance obligation creation handling generic Exception during eLicensing client creation"""
        # Set up mocks
        mock_get_summary.return_value = mock_compliance_summary
        mock_create.return_value = mock_compliance_obligation

        # Mock generic Exception during client creation
        mock_ensure_client.side_effect = Exception("Unexpected error")

        # Call the method
        result = ComplianceObligationService.create_compliance_obligation(
            compliance_summary_id=1, emissions_amount=Decimal('100.0'), reporting_year=2023
        )

        # Verify results - obligation should still be created despite error
        assert result == mock_compliance_obligation
        mock_get_summary.assert_called_once_with(id=1)
        mock_create.assert_called_once()
        mock_ensure_client.assert_called_once_with(mock_compliance_summary.report.operator.id)

    def test_get_obligation_deadline(self):
        """Test get_obligation_deadline returns the correct date"""
        # Test for year 2023
        deadline = ComplianceObligationService.get_obligation_deadline(2023)
        assert deadline == date(2024, 11, 30)

        # Test for year 2022
        deadline = ComplianceObligationService.get_obligation_deadline(2022)
        assert deadline == date(2023, 11, 30)
