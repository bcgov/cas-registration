from unittest.mock import patch
from decimal import Decimal
from datetime import date
from compliance.service.compliance_obligation_service import ComplianceObligationService
import pytest
from compliance.models import ComplianceObligation
from compliance.dataclass import ObligationData
from reporting.models import Report
from registration.models import Operation
from django.core.exceptions import ValidationError
from model_bakery import baker

pytestmark = pytest.mark.django_db


@pytest.fixture
def report_version():
    """Create a report version with a regulated operation"""
    operation = baker.make_recipe(
        "registration.tests.utils.operation",
        bc_obps_regulated_operation=baker.make_recipe("registration.tests.utils.boro_id"),
        status=Operation.Statuses.REGISTERED,
    )

    # Use a unique year for this fixture to avoid conflicts - use a far future year
    reporting_year = baker.make_recipe("reporting.tests.utils.reporting_year", reporting_year=2050)

    return baker.make_recipe(
        "reporting.tests.utils.report_version", report__operation=operation, report__reporting_year=reporting_year
    )


@pytest.fixture
def report_version_unregulated():
    """Create a report version with an unregulated operation (bc_obps_regulated_operation is None)"""
    operation = baker.make_recipe(
        "registration.tests.utils.operation",
        bc_obps_regulated_operation=None,
        status=Operation.Statuses.REGISTERED,
    )

    # Use a different year to avoid conflicts with the other fixture
    reporting_year = baker.make_recipe("reporting.tests.utils.reporting_year", reporting_year=2051)

    return baker.make_recipe(
        "reporting.tests.utils.report_version", report__operation=operation, report__reporting_year=reporting_year
    )


class TestComplianceObligationService:
    """Tests for the ComplianceObligationService class"""

    def test_get_obligation_id_success(self, report_version):
        """Test successful generation of obligation ID"""
        # Call the method
        obligation_id = ComplianceObligationService._get_obligation_id(report_version)

        # Verify results - format should be YY-OOOO-R-V (year-operation-report-version)
        assert isinstance(obligation_id, str)
        assert len(obligation_id.split('-')) == 4  # Should have 4 parts separated by dashes

    def test_get_obligation_id_unregulated_operation(self, report_version_unregulated):
        """Test ValidationError is raised when operation is not regulated by BC OBPS"""
        # Call the method and expect ValidationError
        with pytest.raises(ValidationError) as excinfo:
            ComplianceObligationService._get_obligation_id(report_version_unregulated)

        # Verify error message
        error_msg = str(excinfo.value)
        assert "Cannot create a compliance obligation for an operation not regulated by BC OBPS" in error_msg
        assert "Operation ID:" in error_msg

    @patch('compliance.tasks.retryable_send_notice_of_obligation_email')
    @patch('compliance.service.compliance_obligation_service.ComplianceChargeRateService.get_rate_for_year')
    def test_create_compliance_obligation_success(self, mock_get_rate, mock_send_email):
        """Test successful creation of a compliance obligation"""
        # Set up mocks
        report_compliance_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary', excess_emissions=Decimal('10'), credited_emissions=0
        )
        compliance_report = baker.make_recipe(
            'compliance.tests.utils.compliance_report', report_id=report_compliance_summary.report_version.report_id
        )

        compliance_report_version = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            report_compliance_summary_id=report_compliance_summary.id,
            compliance_report_id=compliance_report.id,
        )
        mock_get_rate.return_value = Decimal('50.00')

        Report.objects.filter(id=compliance_report.report.id).update(reporting_year=2025)
        Operation.objects.filter(id=compliance_report.report.operation_id).update(
            bc_obps_regulated_operation=baker.make_recipe('registration.tests.utils.boro_id'),
            status=Operation.Statuses.REGISTERED,
        )

        result = ComplianceObligationService.create_compliance_obligation(
            compliance_report_version_id=compliance_report_version.id, emissions_amount=Decimal('100.0')
        )

        # Verify results
        assert result.fee_amount_dollars == (Decimal('100.0') * Decimal('50.00')).quantize(Decimal('0.01'))
        assert result.compliance_report_version_id == compliance_report_version.id
        assert result.penalty_status == ComplianceObligation.PenaltyStatus.NONE
        assert result.fee_date == date.today()
        mock_get_rate.assert_called_once_with(
            compliance_report_version.report_compliance_summary.report_version.report.reporting_year
        )
        mock_send_email.execute.assert_called_once_with(compliance_report.report)

    @patch('compliance.service.compliance_obligation_service.ComplianceObligation.objects.create')
    @patch('compliance.service.compliance_obligation_service.ComplianceChargeRateService.get_rate_for_year')
    def test_create_compliance_obligation_unregulated_operation(
        self,
        mock_get_rate,
        mock_create,
    ):
        """Test compliance obligation creation fails when operation is not regulated by BC OBPS"""
        # Set up mocks
        report_compliance_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary', excess_emissions=Decimal('10'), credited_emissions=0
        )
        compliance_report = baker.make_recipe(
            'compliance.tests.utils.compliance_report', report_id=report_compliance_summary.report_version.report_id
        )
        compliance_report.report.reporting_year.reporting_year = 2024
        compliance_report_version = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            report_compliance_summary_id=report_compliance_summary.id,
            compliance_report_id=compliance_report.id,
        )
        mock_get_rate.return_value = Decimal('50.00')

        Report.objects.filter(id=compliance_report.report.id).update(reporting_year=2025)

        # Call the method and expect ValidationError
        with pytest.raises(ValidationError) as excinfo:
            ComplianceObligationService.create_compliance_obligation(
                compliance_report_version_id=compliance_report_version.id, emissions_amount=Decimal('100.0')
            )

        # Verify error message
        error_msg = str(excinfo.value)
        assert "Cannot create a compliance obligation for an operation not regulated by BC OBPS" in error_msg

        # Verify ComplianceObligation.objects.create was not called
        mock_create.assert_not_called()
        mock_get_rate.assert_called_once_with(
            compliance_report_version.report_compliance_summary.report_version.report.reporting_year
        )

    def test_get_obligation_deadline(self):
        """Test get_obligation_deadline returns the correct date"""
        # Test for year 2023
        deadline = ComplianceObligationService.get_obligation_deadline(2023)
        assert deadline == date(2024, 11, 30)

        # Test for year 2022
        deadline = ComplianceObligationService.get_obligation_deadline(2022)
        assert deadline == date(2023, 11, 30)

    def test_get_outstanding_balance_with_elicensing_invoice(self):
        """Test _get_outstanding_balance_dollars returns elicensing invoice balance when available"""
        # Create obligation with elicensing invoice
        elicensing_invoice = baker.make_recipe(
            'compliance.tests.utils.elicensing_invoice', outstanding_balance=Decimal('1500.00')
        )
        obligation = baker.make_recipe(
            'compliance.tests.utils.compliance_obligation',
            elicensing_invoice=elicensing_invoice,
            fee_amount_dollars=Decimal('2000.00'),
        )

        result = ComplianceObligationService._get_outstanding_balance_dollars(obligation)

        assert result == Decimal('1500.00')

    def test_get_outstanding_balance_with_fee_amount_only(self):
        """Test _get_outstanding_balance_dollars returns fee amount when no elicensing invoice"""
        # Create obligation without elicensing invoice
        obligation = baker.make_recipe(
            'compliance.tests.utils.compliance_obligation',
            elicensing_invoice=None,
            fee_amount_dollars=Decimal('2000.00'),
        )

        result = ComplianceObligationService._get_outstanding_balance_dollars(obligation)

        assert result == Decimal('2000.00')

    def test_get_outstanding_balance_with_no_amounts(self):
        """Test _get_outstanding_balance_dollars returns zero when no amounts available"""
        # Create obligation with no amounts
        obligation = baker.make_recipe(
            'compliance.tests.utils.compliance_obligation', elicensing_invoice=None, fee_amount_dollars=None
        )

        result = ComplianceObligationService._get_outstanding_balance_dollars(obligation)

        assert result == Decimal('0.00')

    @patch(
        'compliance.service.compliance_dashboard_service.ComplianceReportVersionService.calculate_outstanding_balance_tco2e'
    )
    @patch(
        'compliance.service.elicensing.elicensing_data_refresh_service.ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id'
    )
    def test_get_obligation_data_by_report_version_success(
        self, mock_refresh_data, mock_calculate_outstanding_balance_tco2e
    ):
        """Test successful retrieval of obligation data"""
        # Setup mocks
        from compliance.dataclass import RefreshWrapperReturn

        mock_calculate_outstanding_balance_tco2e.return_value = Decimal('50.00')

        # Create test data
        report_compliance_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary', excess_emissions=Decimal('10'), credited_emissions=0
        )
        compliance_report = baker.make_recipe(
            'compliance.tests.utils.compliance_report', report_id=report_compliance_summary.report_version.report_id
        )
        compliance_report_version = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            report_compliance_summary_id=report_compliance_summary.id,
            compliance_report_id=compliance_report.id,
        )

        # Create elicensing invoice with outstanding balance
        elicensing_invoice = baker.make_recipe(
            'compliance.tests.utils.elicensing_invoice', outstanding_balance=Decimal('2000.00')
        )

        baker.make_recipe(
            'compliance.tests.utils.compliance_obligation',
            compliance_report_version=compliance_report_version,
            obligation_id="23-0001-1-1",
            elicensing_invoice=elicensing_invoice,
        )

        # Set up the refresh mock to return the created invoice
        mock_refresh_data.return_value = RefreshWrapperReturn(data_is_fresh=True, invoice=elicensing_invoice)

        # Call method
        result = ComplianceObligationService.get_obligation_data_by_report_version(compliance_report_version.id)

        # Verify results
        assert isinstance(result, ObligationData)
        assert (
            result.reporting_year
            == compliance_report_version.report_compliance_summary.report_version.report.reporting_year.reporting_year
        )
        assert result.equivalent_value == Decimal('2000.00')  # This is the outstanding balance in dollars
        assert result.obligation_id == "23-0001-1-1"
        assert result.data_is_fresh

        # Verify refresh was called
        mock_refresh_data.assert_called_once_with(compliance_report_version_id=compliance_report_version.id)

        # Verify calculate outstanding balance service was called
        mock_calculate_outstanding_balance_tco2e.assert_called_once_with(compliance_report_version)

    @patch('compliance.service.compliance_obligation_service.ComplianceChargeRateService.get_rate_for_year')
    def test_create_compliance_obligation_calculates_correct_fee(self, mock_get_rate):
        """Test that create_compliance_obligation calculates fee correctly with rounding"""
        # Setup
        mock_get_rate.return_value = Decimal('45.33')  # Odd rate to test rounding

        report_compliance_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary', excess_emissions=Decimal('10'), credited_emissions=0
        )
        compliance_report = baker.make_recipe(
            'compliance.tests.utils.compliance_report', report_id=report_compliance_summary.report_version.report_id
        )
        compliance_report_version = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            report_compliance_summary_id=report_compliance_summary.id,
            compliance_report_id=compliance_report.id,
        )

        Report.objects.filter(id=compliance_report.report.id).update(reporting_year=2025)
        Operation.objects.filter(id=compliance_report.report.operation_id).update(
            bc_obps_regulated_operation=baker.make_recipe('registration.tests.utils.boro_id'),
            status=Operation.Statuses.REGISTERED,
        )

        # Call method with emissions that will require rounding
        emissions_amount = Decimal('123.456')
        result = ComplianceObligationService.create_compliance_obligation(
            compliance_report_version_id=compliance_report_version.id, emissions_amount=emissions_amount
        )

        assert result.fee_amount_dollars == Decimal('5596.26')

    @patch('compliance.service.compliance_obligation_service.ComplianceChargeRateService.get_rate_for_year')
    def test_create_compliance_obligation_sets_correct_deadline(self, mock_get_rate):
        """Test that create_compliance_obligation sets the correct obligation deadline"""
        # Setup
        mock_get_rate.return_value = Decimal('40.00')

        report_compliance_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary', excess_emissions=Decimal('10'), credited_emissions=0
        )
        compliance_report = baker.make_recipe(
            'compliance.tests.utils.compliance_report', report_id=report_compliance_summary.report_version.report_id
        )
        compliance_report_version = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            report_compliance_summary_id=report_compliance_summary.id,
            compliance_report_id=compliance_report.id,
        )

        # Set reporting year to 2023
        Report.objects.filter(id=compliance_report.report.id).update(reporting_year=2023)
        Operation.objects.filter(id=compliance_report.report.operation_id).update(
            bc_obps_regulated_operation=baker.make_recipe('registration.tests.utils.boro_id'),
            status=Operation.Statuses.REGISTERED,
        )

        result = ComplianceObligationService.create_compliance_obligation(
            compliance_report_version_id=compliance_report_version.id, emissions_amount=Decimal('100.0')
        )

        # Verify deadline is November 30 of the following year (2024)
        assert result.obligation_deadline == date(2024, 11, 30)
