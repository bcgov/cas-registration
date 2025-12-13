from unittest.mock import patch
from decimal import Decimal
from datetime import date
from compliance.service.compliance_obligation_service import ComplianceObligationService
from compliance.models import ComplianceObligation, ComplianceReportVersion
from compliance.dataclass import ObligationData
from django.core.exceptions import ValidationError
from compliance.tests.utils.compliance_test_helper import ComplianceTestHelper
import pytest
from model_bakery import baker

pytestmark = pytest.mark.django_db


class TestComplianceObligationService:
    """Tests for the ComplianceObligationService class"""

    def test_get_obligation_id_success(self):
        """Test successful generation of obligation ID"""
        test_data = ComplianceTestHelper.build_initial_compliance_report()
        # Call the method
        obligation_id = ComplianceObligationService._get_obligation_id(test_data.initial_report_version)

        # Verify results - format should be YY-OOOO-R-V (year-operation-report-version)
        assert isinstance(obligation_id, str)
        assert len(obligation_id.split('-')) == 4  # Should have 4 parts separated by dashes

    def test_get_obligation_id_unregulated_operation(self):
        """Test ValidationError is raised when operation is not regulated by BC OBPS"""
        test_data = ComplianceTestHelper.build_initial_compliance_report()
        test_data.operation.bc_obps_regulated_operation = None
        test_data.operation.save()
        # Call the method and expect ValidationError
        with pytest.raises(ValidationError) as excinfo:
            ComplianceObligationService._get_obligation_id(test_data.initial_report_version)

        # Verify error message
        error_msg = str(excinfo.value)
        assert "Cannot create a compliance obligation for an operation not regulated by BC OBPS" in error_msg
        assert "Operation ID:" in error_msg

    @patch('compliance.tasks.retryable_send_notice_of_obligation_email')
    @patch('compliance.service.compliance_obligation_service.ComplianceChargeRateService.get_rate_for_year')
    def test_create_compliance_obligation_success(
        self,
        mock_get_rate,
        mock_send_email,
    ):
        """Test successful creation of a compliance obligation"""
        # Set up mocks
        test_data = ComplianceTestHelper.build_initial_compliance_report()
        test_data.initial_report_compliance_summary.excess_emissions = Decimal('100')
        test_data.initial_report_compliance_summary.save()
        mock_get_rate.return_value = Decimal('50.00')

        result = ComplianceObligationService.create_compliance_obligation(
            compliance_report_version_id=test_data.initial_compliance_report_version.id,
            emissions_amount=Decimal('100.0'),
        )
        # Verify results
        assert result.fee_amount_dollars == (Decimal('100.0') * Decimal('50.00')).quantize(Decimal('0.01'))
        assert result.compliance_report_version_id == test_data.initial_compliance_report_version.id
        assert result.penalty_status == ComplianceObligation.PenaltyStatus.NONE
        assert result.fee_date == date.today()
        mock_get_rate.assert_called_once_with(test_data.reporting_year)
        mock_send_email.execute.assert_called_once_with(test_data.initial_compliance_report_version.id)

    @patch('compliance.service.compliance_obligation_service.ComplianceObligation.objects.create')
    @patch('compliance.service.compliance_obligation_service.ComplianceChargeRateService.get_rate_for_year')
    def test_create_compliance_obligation_unregulated_operation(
        self,
        mock_get_rate,
        mock_create,
    ):
        """Test compliance obligation creation fails when operation is not regulated by BC OBPS"""
        # Set up mocks
        test_data = ComplianceTestHelper.build_initial_compliance_report()
        test_data.operation.bc_obps_regulated_operation = None
        test_data.operation.save()
        test_data.initial_report_compliance_summary.excess_emissions = Decimal('100')
        test_data.initial_report_compliance_summary.save()

        mock_get_rate.return_value = Decimal('50.00')

        # Call the method and expect ValidationError
        with pytest.raises(ValidationError) as excinfo:
            ComplianceObligationService.create_compliance_obligation(
                compliance_report_version_id=test_data.initial_compliance_report_version.id,
                emissions_amount=Decimal('100.0'),
            )

        # Verify error message
        error_msg = str(excinfo.value)
        assert "Cannot create a compliance obligation for an operation not regulated by BC OBPS" in error_msg

        # Verify ComplianceObligation.objects.create was not called
        mock_create.assert_not_called()
        mock_get_rate.assert_called_once_with(test_data.report.reporting_year)

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
            'compliance.tests.utils.elicensing_invoice', invoice_fee_balance=Decimal('1500.00')
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
        test_data = ComplianceTestHelper.build_initial_compliance_report(
            crv_status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET
        )

        # Create elicensing invoice with outstanding balance
        elicensing_invoice = baker.make_recipe(
            'compliance.tests.utils.elicensing_invoice', invoice_fee_balance=Decimal('2000.00')
        )

        test_data.initial_compliance_obligation.obligation_id = "23-0001-1-1"
        test_data.initial_compliance_obligation.elicensing_invoice = elicensing_invoice
        test_data.initial_compliance_obligation.save()

        # Set up the refresh mock to return the created invoice
        mock_refresh_data.return_value = RefreshWrapperReturn(data_is_fresh=True, invoice=elicensing_invoice)

        # Call method
        result = ComplianceObligationService.get_obligation_data_by_report_version(
            test_data.initial_compliance_report_version.id
        )

        # Verify results
        assert isinstance(result, ObligationData)
        assert result.reporting_year == test_data.reporting_year.reporting_year
        assert result.equivalent_value == Decimal('2000.00')  # This is the outstanding balance in dollars
        assert result.obligation_id == "23-0001-1-1"

        # Verify refresh was called
        mock_refresh_data.assert_called_once_with(
            compliance_report_version_id=test_data.initial_compliance_report_version.id
        )

        # Verify calculate outstanding balance service was called
        mock_calculate_outstanding_balance_tco2e.assert_called_once_with(test_data.initial_compliance_report_version)

    @patch('compliance.service.compliance_obligation_service.ComplianceChargeRateService.get_rate_for_year')
    def test_create_compliance_obligation_calculates_correct_fee(self, mock_get_rate):
        """Test that create_compliance_obligation calculates fee correctly with rounding"""
        # Setup
        mock_get_rate.return_value = Decimal('45.33')  # Odd rate to test rounding
        test_data = ComplianceTestHelper.build_initial_compliance_report()

        # Call method with emissions that will require rounding
        emissions_amount = Decimal('123.456')
        result = ComplianceObligationService.create_compliance_obligation(
            compliance_report_version_id=test_data.initial_compliance_report_version.id,
            emissions_amount=emissions_amount,
        )

        assert result.fee_amount_dollars == Decimal('5596.26')

    @patch('compliance.service.compliance_obligation_service.ComplianceChargeRateService.get_rate_for_year')
    def test_create_compliance_obligation_sets_correct_deadline(self, mock_get_rate):
        """Test that create_compliance_obligation sets the correct obligation deadline"""
        # Setup
        mock_get_rate.return_value = Decimal('40.00')
        test_data = ComplianceTestHelper.build_initial_compliance_report(reporting_year=2023)

        result = ComplianceObligationService.create_compliance_obligation(
            compliance_report_version_id=test_data.initial_compliance_report_version.id,
            emissions_amount=Decimal('100.0'),
        )

        # Verify deadline is November 30 of the following year (2024)
        assert result.obligation_deadline == date(2024, 11, 30)
