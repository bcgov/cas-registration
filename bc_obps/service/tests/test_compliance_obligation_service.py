import uuid
from unittest.mock import patch, MagicMock
from decimal import Decimal
from datetime import date

import pytest
import requests

from service.compliance_obligation_service import ComplianceObligationService
from compliance.models import ComplianceObligation, ComplianceSummary
from reporting.models import Report, ReportVersion


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
def mock_report_version():
    """Create a mock report version with a regulated operation"""
    report_version = MagicMock(spec=ReportVersion)
    report_version.id = 1
    report_version.report = MagicMock(spec=Report)
    report_version.report.id = 1
    report_version.report.reporting_year_id = 2023
    report_version.report.operation = MagicMock()
    report_version.report.operation.id = uuid.uuid4()
    report_version.report.operation.name = "Test Operation"
    report_version.report.operation.bc_obps_regulated_operation = MagicMock()
    report_version.report.operation.bc_obps_regulated_operation.id = "23-0001"
    return report_version


@pytest.fixture
def mock_report_version_unregulated():
    """Create a mock report version with an unregulated operation (bc_obps_regulated_operation is None)"""
    report_version = MagicMock(spec=ReportVersion)
    report_version.id = 1
    report_version.report = MagicMock(spec=Report)
    report_version.report.id = 1
    report_version.report.reporting_year_id = 2023
    report_version.report.operation = MagicMock()
    report_version.report.operation.id = uuid.uuid4()
    report_version.report.operation.name = "Unregulated Test Operation"
    report_version.report.operation.bc_obps_regulated_operation = None
    return report_version


@pytest.fixture
def mock_compliance_obligation():
    """Create a mock compliance obligation"""
    obligation = MagicMock(spec=ComplianceObligation)
    obligation.id = 1
    obligation.status = ComplianceObligation.ObligationStatus.OBLIGATION_NOT_MET
    return obligation


class TestComplianceObligationService:
    """Tests for the ComplianceObligationService class"""

    def test_get_obligation_id_success(self, mock_report_version):
        """Test successful generation of obligation ID"""
        # Call the method
        obligation_id = ComplianceObligationService._get_obligation_id(mock_report_version)

        # Verify results
        assert obligation_id == "23-0001-1-1"
        assert isinstance(obligation_id, str)

    def test_get_obligation_id_unregulated_operation(self, mock_report_version_unregulated):
        """Test ValueError is raised when operation is not regulated by BC OBPS"""
        # Call the method and expect ValueError
        with pytest.raises(ValueError) as excinfo:
            ComplianceObligationService._get_obligation_id(mock_report_version_unregulated)

        # Verify error message
        error_msg = str(excinfo.value)
        assert "Cannot create a compliance obligation for an operation not regulated by BC OBPS" in error_msg
        assert "Operation ID:" in error_msg
        assert "Operation Name: Unregulated Test Operation" in error_msg

    @pytest.mark.django_db
    @patch('service.compliance_obligation_service.ComplianceSummary.objects.get')
    @patch('service.compliance_obligation_service.ComplianceObligation.objects.create')
    @patch('service.compliance_obligation_service.OperatorELicensingService.ensure_client_exists')
    def test_create_compliance_obligation_success(
        self,
        mock_ensure_client,
        mock_create,
        mock_get_summary,
        mock_compliance_summary,
        mock_compliance_obligation,
        mock_report_version,
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
            compliance_summary_id=1, emissions_amount=Decimal('100.0'), report_version=mock_report_version
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
        self,
        mock_ensure_client,
        mock_create,
        mock_get_summary,
        mock_compliance_summary,
        mock_compliance_obligation,
        mock_report_version,
    ):
        """Test compliance obligation creation when eLicensing client creation fails"""
        # Set up mocks
        mock_get_summary.return_value = mock_compliance_summary
        mock_create.return_value = mock_compliance_obligation

        # Mock failed eLicensing client creation
        mock_ensure_client.return_value = None

        # Call the method
        result = ComplianceObligationService.create_compliance_obligation(
            compliance_summary_id=1, emissions_amount=Decimal('100.0'), report_version=mock_report_version
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
        self,
        mock_ensure_client,
        mock_create,
        mock_get_summary,
        mock_compliance_summary,
        mock_compliance_obligation,
        mock_report_version,
    ):
        """Test compliance obligation creation handling AttributeError during eLicensing client creation"""
        # Set up mocks
        mock_get_summary.return_value = mock_compliance_summary
        mock_create.return_value = mock_compliance_obligation

        # Remove operator to cause AttributeError
        mock_compliance_summary.report = None

        # Call the method
        result = ComplianceObligationService.create_compliance_obligation(
            compliance_summary_id=1, emissions_amount=Decimal('100.0'), report_version=mock_report_version
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
        self,
        mock_ensure_client,
        mock_create,
        mock_get_summary,
        mock_compliance_summary,
        mock_compliance_obligation,
        mock_report_version,
    ):
        """Test compliance obligation creation handling RequestException during eLicensing client creation"""
        # Set up mocks
        mock_get_summary.return_value = mock_compliance_summary
        mock_create.return_value = mock_compliance_obligation

        # Mock RequestException during client creation
        mock_ensure_client.side_effect = requests.RequestException("API connection error")

        # Call the method
        result = ComplianceObligationService.create_compliance_obligation(
            compliance_summary_id=1, emissions_amount=Decimal('100.0'), report_version=mock_report_version
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
        self,
        mock_ensure_client,
        mock_create,
        mock_get_summary,
        mock_compliance_summary,
        mock_compliance_obligation,
        mock_report_version,
    ):
        """Test compliance obligation creation handling generic Exception during eLicensing client creation"""
        # Set up mocks
        mock_get_summary.return_value = mock_compliance_summary
        mock_create.return_value = mock_compliance_obligation

        # Mock generic Exception during client creation
        mock_ensure_client.side_effect = Exception("Unexpected error")

        # Call the method
        result = ComplianceObligationService.create_compliance_obligation(
            compliance_summary_id=1, emissions_amount=Decimal('100.0'), report_version=mock_report_version
        )

        # Verify results - obligation should still be created despite error
        assert result == mock_compliance_obligation
        mock_get_summary.assert_called_once_with(id=1)
        mock_create.assert_called_once()
        mock_ensure_client.assert_called_once_with(mock_compliance_summary.report.operator.id)

    @pytest.mark.django_db
    @patch('service.compliance_obligation_service.ComplianceSummary.objects.get')
    @patch('service.compliance_obligation_service.ComplianceObligation.objects.create')
    def test_create_compliance_obligation_unregulated_operation(
        self,
        mock_create,
        mock_get_summary,
        mock_compliance_summary,
        mock_report_version_unregulated,
    ):
        """Test compliance obligation creation fails when operation is not regulated by BC OBPS"""
        # Set up mocks
        mock_get_summary.return_value = mock_compliance_summary

        # Call the method and expect ValueError
        with pytest.raises(ValueError) as excinfo:
            ComplianceObligationService.create_compliance_obligation(
                compliance_summary_id=1,
                emissions_amount=Decimal('100.0'),
                report_version=mock_report_version_unregulated,
            )

        # Verify error message
        error_msg = str(excinfo.value)
        assert "Cannot create a compliance obligation for an operation not regulated by BC OBPS" in error_msg

        # Verify ComplianceObligation.objects.create was not called
        mock_create.assert_not_called()

    def test_get_obligation_deadline(self):
        """Test get_obligation_deadline returns the correct date"""
        # Test for year 2023
        deadline = ComplianceObligationService.get_obligation_deadline(2023)
        assert deadline == date(2024, 11, 30)

        # Test for year 2022
        deadline = ComplianceObligationService.get_obligation_deadline(2022)
        assert deadline == date(2023, 11, 30)
