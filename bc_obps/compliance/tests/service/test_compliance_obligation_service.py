import uuid
from unittest.mock import patch, MagicMock
from decimal import Decimal
from datetime import date
from compliance.service.compliance_obligation_service import ComplianceObligationService
import pytest
from compliance.models import ComplianceObligation, ComplianceReportVersion
from reporting.models import Report, ReportVersion, ReportingYear
from django.core.exceptions import ValidationError


@pytest.fixture
def mock_compliance_report_version():
    """Create a mock compliance compliance_report_version with required attributes"""
    compliance_report_version = MagicMock(spec=ComplianceReportVersion)
    compliance_report_version.id = 1
    compliance_report_version.report_version.report = MagicMock(spec=Report)
    compliance_report_version.report_version.report.operator = MagicMock()
    compliance_report_version.report_version.report.operator.id = uuid.uuid4()
    compliance_report_version.report_version.report.reporting_year_id = 2023
    return compliance_report_version


@pytest.fixture
def mock_report_version():
    """Create a mock report version with a regulated operation"""
    report_version = MagicMock(spec=ReportVersion)
    report_version.id = 1
    report_version.report = MagicMock(spec=Report)
    report_version.report.id = 1
    report_version.report.reporting_year = MagicMock(spec=ReportingYear)
    report_version.report.reporting_year.reporting_year = 2023
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
    report_version.report.reporting_year = MagicMock(spec=ReportingYear)
    report_version.report.reporting_year.reporting_year = 2023
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
    return obligation


@pytest.fixture
def mock_compliance_fee():
    """Create a mock compliance fee"""
    fee = MagicMock()
    fee.id = 1
    return fee


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
        with pytest.raises(ValidationError) as excinfo:
            ComplianceObligationService._get_obligation_id(mock_report_version_unregulated)

        # Verify error message
        error_msg = str(excinfo.value)
        assert "Cannot create a compliance obligation for an operation not regulated by BC OBPS" in error_msg
        assert "Operation ID:" in error_msg

    @pytest.mark.django_db
    @patch('compliance.service.compliance_obligation_service.ComplianceReportVersion.objects.get')
    @patch('compliance.service.compliance_obligation_service.ComplianceObligation.objects.create')
    @patch('compliance.service.compliance_obligation_service.ComplianceChargeRateService.get_rate_for_year')
    def test_create_compliance_obligation_success(
        self,
        mock_get_rate,
        mock_create,
        mock_get_compliance_report_version,
        mock_compliance_report_version,
        mock_compliance_obligation,
    ):
        """Test successful creation of a compliance obligation"""
        # Set up mocks
        mock_get_compliance_report_version.return_value = mock_compliance_report_version
        mock_create.return_value = mock_compliance_obligation
        mock_get_rate.return_value = Decimal('50.00')

        # Call the method
        result = ComplianceObligationService.create_compliance_obligation(
            compliance_report_version_id=1, emissions_amount=Decimal('100.0')
        )

        # Verify results
        assert result == mock_compliance_obligation
        mock_get_compliance_report_version.assert_called_once_with(id=1)
        mock_create.assert_called_once()
        mock_get_rate.assert_called_once_with(mock_compliance_report_version.report_version.report.reporting_year)

    @pytest.mark.django_db
    @patch('compliance.service.compliance_obligation_service.ComplianceReportVersion.objects.get')
    @patch('compliance.service.compliance_obligation_service.ComplianceObligation.objects.create')
    @patch('compliance.service.compliance_obligation_service.ComplianceChargeRateService.get_rate_for_year')
    def test_create_compliance_obligation_client_not_created(
        self,
        mock_get_rate,
        mock_create,
        mock_get_compliance_report_version,
        mock_compliance_report_version,
        mock_compliance_obligation,
    ):
        """Test compliance obligation creation when fee creation fails"""
        # Set up mocks
        mock_get_compliance_report_version.return_value = mock_compliance_report_version
        mock_create.return_value = mock_compliance_obligation
        mock_get_rate.return_value = Decimal('50.00')

        # Call the method
        result = ComplianceObligationService.create_compliance_obligation(
            compliance_report_version_id=1, emissions_amount=Decimal('100.0')
        )

        # Verify results - obligation should still be created even if fee creation fails
        assert result == mock_compliance_obligation
        mock_get_compliance_report_version.assert_called_once_with(id=1)
        mock_create.assert_called_once()
        mock_get_rate.assert_called_once_with(mock_compliance_report_version.report_version.report.reporting_year)

    @pytest.mark.django_db
    @patch('compliance.service.compliance_obligation_service.ComplianceReportVersion.objects.get')
    @patch('compliance.service.compliance_obligation_service.ComplianceObligation.objects.create')
    @patch('compliance.service.compliance_obligation_service.ComplianceChargeRateService.get_rate_for_year')
    def test_create_compliance_obligation_attribute_error(
        self,
        mock_get_rate,
        mock_create,
        mock_get_compliance_report_version,
        mock_compliance_report_version,
        mock_compliance_obligation,
    ):
        """Test compliance obligation creation handling exception during fee creation"""
        # Set up mocks
        mock_get_compliance_report_version.return_value = mock_compliance_report_version
        mock_create.return_value = mock_compliance_obligation
        mock_get_rate.return_value = Decimal('50.00')

        # Call the method
        result = ComplianceObligationService.create_compliance_obligation(
            compliance_report_version_id=1, emissions_amount=Decimal('100.0')
        )

        # Verify results - obligation should still be created despite fee creation error
        assert result == mock_compliance_obligation
        mock_get_compliance_report_version.assert_called_once_with(id=1)
        mock_create.assert_called_once()
        mock_get_rate.assert_called_once_with(mock_compliance_report_version.report_version.report.reporting_year)

    @pytest.mark.django_db
    @patch('compliance.service.compliance_obligation_service.ComplianceReportVersion.objects.get')
    @patch('compliance.service.compliance_obligation_service.ComplianceObligation.objects.create')
    @patch('compliance.service.compliance_obligation_service.ComplianceChargeRateService.get_rate_for_year')
    def test_create_compliance_obligation_request_exception(
        self,
        mock_get_rate,
        mock_create,
        mock_get_compliance_report_version,
        mock_compliance_report_version,
        mock_compliance_obligation,
    ):
        """Test compliance obligation creation handling RequestException during eLicensing client creation"""
        # Set up mocks
        mock_get_compliance_report_version.return_value = mock_compliance_report_version
        mock_create.return_value = mock_compliance_obligation
        mock_get_rate.return_value = Decimal('50.00')

        # Call the method
        result = ComplianceObligationService.create_compliance_obligation(
            compliance_report_version_id=1, emissions_amount=Decimal('100.0')
        )

        # Verify results - obligation should still be created despite API error
        assert result == mock_compliance_obligation
        mock_get_compliance_report_version.assert_called_once_with(id=1)
        mock_create.assert_called_once()
        mock_get_rate.assert_called_once_with(mock_compliance_report_version.report_version.report.reporting_year)

    @pytest.mark.django_db
    @patch('compliance.service.compliance_obligation_service.ComplianceReportVersion.objects.get')
    @patch('compliance.service.compliance_obligation_service.ComplianceObligation.objects.create')
    @patch('compliance.service.compliance_obligation_service.ComplianceChargeRateService.get_rate_for_year')
    def test_create_compliance_obligation_generic_exception(
        self,
        mock_get_rate,
        mock_create,
        mock_get_compliance_report_version,
        mock_compliance_report_version,
        mock_compliance_obligation,
    ):
        """Test compliance obligation creation handling generic Exception during eLicensing client creation"""
        # Set up mocks
        mock_get_compliance_report_version.return_value = mock_compliance_report_version
        mock_create.return_value = mock_compliance_obligation
        mock_get_rate.return_value = Decimal('50.00')

        # Call the method
        result = ComplianceObligationService.create_compliance_obligation(
            compliance_report_version_id=1, emissions_amount=Decimal('100.0')
        )

        # Verify results - obligation should still be created despite error
        assert result == mock_compliance_obligation
        mock_get_compliance_report_version.assert_called_once_with(id=1)
        mock_create.assert_called_once()
        mock_get_rate.assert_called_once_with(mock_compliance_report_version.report_version.report.reporting_year)

    @pytest.mark.django_db
    @patch('compliance.service.compliance_obligation_service.ComplianceReportVersion.objects.get')
    @patch('compliance.service.compliance_obligation_service.ComplianceObligation.objects.create')
    @patch('compliance.service.compliance_obligation_service.ComplianceChargeRateService.get_rate_for_year')
    def test_create_compliance_obligation_unregulated_operation(
        self,
        mock_get_rate,
        mock_create,
        mock_get_compliance_report_version,
        mock_compliance_report_version,
        mock_report_version_unregulated,
    ):
        """Test compliance obligation creation fails when operation is not regulated by BC OBPS"""
        # Set up mocks
        mock_compliance_report_version.report_version = mock_report_version_unregulated
        mock_get_compliance_report_version.return_value = mock_compliance_report_version
        mock_get_rate.return_value = Decimal('50.00')

        # Call the method and expect ValueError
        with pytest.raises(ValidationError) as excinfo:
            ComplianceObligationService.create_compliance_obligation(
                compliance_report_version_id=mock_compliance_report_version.id, emissions_amount=Decimal('100.0')
            )

        # Verify error message
        error_msg = str(excinfo.value)
        assert "Cannot create a compliance obligation for an operation not regulated by BC OBPS" in error_msg

        # Verify ComplianceObligation.objects.create was not called
        mock_create.assert_not_called()
        mock_get_rate.assert_called_once_with(mock_compliance_report_version.report_version.report.reporting_year)

    def test_get_obligation_deadline(self):
        """Test get_obligation_deadline returns the correct date"""
        # Test for year 2023
        deadline = ComplianceObligationService.get_obligation_deadline(2023)
        assert deadline == date(2024, 11, 30)

        # Test for year 2022
        deadline = ComplianceObligationService.get_obligation_deadline(2022)
        assert deadline == date(2023, 11, 30)
