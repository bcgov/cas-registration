from decimal import Decimal
from compliance.service.compliance_report_version_service import ComplianceReportVersionService
import pytest
from unittest.mock import patch
from compliance.models import ComplianceReportVersion, ComplianceEarnedCredit
from model_bakery import baker
from registration.models import Operation
from registration.models.operator import Operator
from reporting.models.report_operation import ReportOperation

pytestmark = pytest.mark.django_db


class TestComplianceReportVersionService:
    @patch(
        'compliance.service.compliance_report_version_service.ComplianceObligationService.create_compliance_obligation'
    )
    @patch(
        'compliance.service.compliance_report_version_service.ElicensingObligationService.handle_obligation_integration'
    )
    def test_create_compliance_report_version_with_excess_emissions_integration_runs(
        self, mock_handle_integration, mock_create_obligation
    ):
        # Arrange
        report_compliance_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary', excess_emissions=Decimal('10'), credited_emissions=0
        )
        compliance_report = baker.make_recipe(
            'compliance.tests.utils.compliance_report', report_id=report_compliance_summary.report_version.report_id
        )

        mock_obligation = baker.make_recipe('compliance.tests.utils.compliance_obligation')
        mock_create_obligation.return_value = mock_obligation

        # Act
        result = ComplianceReportVersionService.create_compliance_report_version(
            compliance_report, report_compliance_summary.report_version.id
        )

        # Assert
        mock_create_obligation.assert_called_once_with(result.id, Decimal('10'))
        mock_handle_integration.assert_called_once_with(mock_obligation.id, compliance_report.compliance_period)

        assert result.status == ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET
        assert result.report_compliance_summary_id == report_compliance_summary.id
        assert result.compliance_report_id == compliance_report.id

    @patch(
        'compliance.service.compliance_report_version_service.ComplianceObligationService.create_compliance_obligation'
    )
    @patch(
        'compliance.service.compliance_report_version_service.ElicensingObligationService.handle_obligation_integration'
    )
    def test_create_compliance_report_version_with_excess_emissions_integration_skipped(
        self, mock_handle_integration, mock_create_obligation
    ):
        # Arrange
        report_compliance_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary', excess_emissions=Decimal('10'), credited_emissions=0
        )
        compliance_report = baker.make_recipe(
            'compliance.tests.utils.compliance_report', report_id=report_compliance_summary.report_version.report_id
        )

        mock_obligation = baker.make_recipe('compliance.tests.utils.compliance_obligation')
        mock_create_obligation.return_value = mock_obligation

        # Act
        result = ComplianceReportVersionService.create_compliance_report_version(
            compliance_report, report_compliance_summary.report_version.id
        )

        # Assert
        mock_create_obligation.assert_called_once_with(result.id, Decimal('10'))
        mock_handle_integration.assert_called_once_with(mock_obligation.id, compliance_report.compliance_period)

        assert result.status == ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET
        assert result.report_compliance_summary_id == report_compliance_summary.id
        assert result.compliance_report_id == compliance_report.id

    def test_determine_compliance_status(self):
        # Test OBLIGATION_NOT_MET
        status = ComplianceReportVersionService._determine_compliance_status(Decimal('10.0'), Decimal('0.0'))
        assert status == ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET

        # Test EARNED_CREDITS
        status = ComplianceReportVersionService._determine_compliance_status(Decimal('0.0'), Decimal('10.0'))
        assert status == ComplianceReportVersion.ComplianceStatus.EARNED_CREDITS

        # Test NO_OBLIGATION_OR_EARNED_CREDITS
        status = ComplianceReportVersionService._determine_compliance_status(Decimal('0.0'), Decimal('0.0'))
        assert status == ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS

        # OBLIGATION_FULLY_MET is not tested here anymore since it's only after outstanding balance calculations

    def test_create_compliance_report_version_with_credited_emissions(self):
        # Arrange
        report_compliance_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary', credited_emissions=Decimal('10.6'), excess_emissions=0
        )
        compliance_report = baker.make_recipe(
            'compliance.tests.utils.compliance_report', report_id=report_compliance_summary.report_version.report_id
        )

        # Act
        result = ComplianceReportVersionService.create_compliance_report_version(
            compliance_report, report_compliance_summary.report_version.id
        )
        earned_credits_record = ComplianceEarnedCredit.objects.get(compliance_report_version_id=result.id)

        # Assert
        assert result.status == ComplianceReportVersion.ComplianceStatus.EARNED_CREDITS
        assert result.report_compliance_summary_id == report_compliance_summary.id
        assert result.compliance_report_id == compliance_report.id
        assert earned_credits_record.earned_credits_amount == 10

    @patch(
        'compliance.service.compliance_report_version_service.retryable_send_notice_of_no_obligation_no_earned_credits_email'
    )
    def test_create_compliance_report_version_with_no_obligation_and_no_credited_emissions(self, mock_send_email):
        # Arrange
        report_compliance_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary', credited_emissions=0, excess_emissions=0
        )
        compliance_report = baker.make_recipe(
            'compliance.tests.utils.compliance_report', report_id=report_compliance_summary.report_version.report_id
        )

        # Act
        result = ComplianceReportVersionService.create_compliance_report_version(
            compliance_report, report_compliance_summary.report_version.id
        )

        # Assert
        assert result.status == ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS
        assert result.report_compliance_summary_id == report_compliance_summary.id
        assert result.compliance_report_id == compliance_report.id
        # failing
        mock_send_email.execute.assert_called_once_with(compliance_report.report)

    def test_get_compliance_report_versions_for_previously_owned_operations(self):
        # Arrange
        operator = baker.make_recipe('registration.tests.utils.operator')
        user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator', operator=operator)
        baker.make_recipe(
            'compliance.tests.utils.compliance_period',
            id=2025,
            reporting_year_id=2025,
            start_date='2025-01-01',
            end_date='2025-12-31',
        )
        baker.make_recipe(
            'compliance.tests.utils.compliance_period',
            id=2026,
            reporting_year_id=2026,
            start_date='2026-01-01',
            end_date='2026-12-31',
        )

        # TRANSFERRED DATA
        xferred_operation = baker.make_recipe(
            'registration.tests.utils.operation_designated_operator_timeline',
            operation=baker.make_recipe('registration.tests.utils.operation', status=Operation.Statuses.REGISTERED),
            start_date="2024-01-01 01:46:20.789146",
            end_date="2026-02-27 01:46:20.789146",
            operator=operator,
        )

        xferred_emissions_report = baker.make_recipe(
            'reporting.tests.utils.report', reporting_year_id=2025, operation=xferred_operation.operation
        )

        xferred_compliance_report = baker.make_recipe(
            'compliance.tests.utils.compliance_report', compliance_period_id=2025, report=xferred_emissions_report
        )

        xferred_compliance_report_version = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version', compliance_report=xferred_compliance_report
        )

        xferred_operation_2 = baker.make_recipe(
            'registration.tests.utils.operation_designated_operator_timeline',
            operation=baker.make_recipe('registration.tests.utils.operation', status=Operation.Statuses.REGISTERED),
            start_date="2024-01-01 01:46:20.789146",
            end_date="2026-02-27 01:46:20.789146",
            operator=operator,
        )

        xferred_emissions_report_2 = baker.make_recipe(
            'reporting.tests.utils.report', reporting_year_id=2025, operation=xferred_operation_2.operation
        )

        xferred_compliance_report_2 = baker.make_recipe(
            'compliance.tests.utils.compliance_report', compliance_period_id=2025, report=xferred_emissions_report_2
        )

        xferred_compliance_report_version_2 = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version', compliance_report=xferred_compliance_report_2
        )

        # OUT OF BOUNDS REPORTS
        # Report date is out of bounds for the transfer date. Should not be returned.
        ob_emissions_report = baker.make_recipe(
            'reporting.tests.utils.report', reporting_year_id=2026, operation=xferred_operation.operation
        )

        ob_compliance_report = baker.make_recipe(
            'compliance.tests.utils.compliance_report', compliance_period_id=2026, report=ob_emissions_report
        )

        baker.make_recipe('compliance.tests.utils.compliance_report_version', compliance_report=ob_compliance_report)

        # ACTIVE DATA
        # Reports from active operations should not be returned
        active_operation = baker.make_recipe(
            'registration.tests.utils.operation_designated_operator_timeline',
            operation=baker.make_recipe(
                'registration.tests.utils.operation', status=Operation.Statuses.REGISTERED, operator=operator
            ),
            end_date=None,
        )

        active_emissions_report = baker.make_recipe(
            'reporting.tests.utils.report', reporting_year_id=2025, operation=active_operation.operation
        )

        active_compliance_report = baker.make_recipe(
            'compliance.tests.utils.compliance_report', compliance_period_id=2025, report=active_emissions_report
        )

        baker.make_recipe(
            'compliance.tests.utils.compliance_report_version', compliance_report=active_compliance_report
        )

        result = ComplianceReportVersionService.get_compliance_report_versions_for_previously_owned_operations(
            user_guid=user_operator.user_id
        )

        # Assert
        assert result.count() == 2
        assert result.first() == xferred_compliance_report_version
        assert result.last() == xferred_compliance_report_version_2

    def test_calculate_outstanding_balance_tco2e(self):
        # Arrange
        # Create compliance report version with a linked compliance period and reporting year
        compliance_report_version = baker.make_recipe('compliance.tests.utils.compliance_report_version')

        # Create a ComplianceChargeRate for the same reporting year
        reporting_year = compliance_report_version.compliance_report.compliance_period.reporting_year
        baker.make_recipe(
            'compliance.tests.utils.compliance_charge_rate',
            reporting_year=reporting_year,
            rate=Decimal("50.00"),
        )

        # Create a ComplianceObligation linked to the compliance_report_version
        obligation = baker.make_recipe(
            'compliance.tests.utils.compliance_obligation',
            compliance_report_version=compliance_report_version,
        )

        # Link an ElicensingInvoice with an outstanding balance
        invoice = baker.make_recipe(
            'compliance.tests.utils.elicensing_invoice',
            outstanding_balance=Decimal("100.00"),
        )
        obligation.elicensing_invoice = invoice
        obligation.save()

        # Act
        result = ComplianceReportVersionService.calculate_outstanding_balance_tco2e(compliance_report_version)

        # Assert
        assert result == Decimal("2.0000")  # 100.00 / 50.00

    def test_calculate_outstanding_balance_tco2e_zero_balance_returns_0_00(self):
        # Arrange
        compliance_report_version = baker.make_recipe('compliance.tests.utils.compliance_report_version')

        reporting_year = compliance_report_version.compliance_report.compliance_period.reporting_year
        charge_rate = Decimal("50.00")
        baker.make_recipe(
            'compliance.tests.utils.compliance_charge_rate',
            reporting_year=reporting_year,
            rate=charge_rate,
        )

        obligation = baker.make_recipe(
            'compliance.tests.utils.compliance_obligation',
            compliance_report_version=compliance_report_version,
        )

        invoice = baker.make_recipe(
            'compliance.tests.utils.elicensing_invoice',
            outstanding_balance=Decimal("0.00"),
        )
        obligation.elicensing_invoice = invoice
        obligation.save()

        # Act
        result = ComplianceReportVersionService.calculate_outstanding_balance_tco2e(compliance_report_version)

        # Assert
        assert result == Decimal("0.0000")  # Not "0E+2"
        assert str(result) == "0.0000"

    def test_calculate_computed_value_excess_emissions(self):
        version_1 = baker.make_recipe('compliance.tests.utils.compliance_report_version')
        version_1.report_compliance_summary.excess_emissions = Decimal("100.00")
        version_1.report_compliance_summary.save()

        version_2 = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            is_supplementary=True,
            excess_emissions_delta_from_previous=Decimal("2.0"),
        )
        version_3 = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            is_supplementary=True,
            excess_emissions_delta_from_previous=Decimal("-2.0"),
        )

        # Act
        assert ComplianceReportVersionService.calculate_computed_value_excess_emissions(version_1) == Decimal("100.00")
        assert ComplianceReportVersionService.calculate_computed_value_excess_emissions(version_2) == Decimal("2.0")
        assert ComplianceReportVersionService.calculate_computed_value_excess_emissions(version_3) == Decimal("0")

    def test_get_operator_by_compliance_report_version(self):
        # Arrange
        operator = baker.make_recipe('registration.tests.utils.operator')
        operation = baker.make_recipe('registration.tests.utils.operation', operator=operator)
        report = baker.make_recipe('reporting.tests.utils.report', operation=operation)
        compliance_report = baker.make_recipe('compliance.tests.utils.compliance_report', report=report)
        compliance_report_version = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version', compliance_report=compliance_report
        )

        # Act
        result = ComplianceReportVersionService.get_operator_by_compliance_report_version(compliance_report_version.id)

        # Assert
        assert isinstance(result, Operator)
        assert result.id == operator.id

    def test_get_operator_by_compliance_report_version_nonexistent_id(self):
        # Arrange
        nonexistent_id = 99999

        # Act & Assert
        with pytest.raises(ComplianceReportVersion.DoesNotExist):
            ComplianceReportVersionService.get_operator_by_compliance_report_version(nonexistent_id)

    def test_get_report_operation_by_compliance_report_version(self):
        # Arrange
        operation = baker.make_recipe('registration.tests.utils.operation', name='admin name')
        report = baker.make_recipe('reporting.tests.utils.report', operation=operation)
        report_version = baker.make_recipe('reporting.tests.utils.report_version', report=report)

        # create the report_operation linked to the report_version
        report_operation = baker.make_recipe(
            'reporting.tests.utils.report_operation',
            report_version=report_version,
            operation_name='reporting name',
        )

        report_compliance_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary', report_version=report_version
        )
        compliance_report = baker.make_recipe('compliance.tests.utils.compliance_report', report=report)
        compliance_report_version = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=compliance_report,
            report_compliance_summary=report_compliance_summary,
        )

        # Act
        result = ComplianceReportVersionService.get_report_operation_by_compliance_report_version(
            compliance_report_version.id
        )

        # Assert
        assert isinstance(result, ReportOperation)
        assert result.id == report_operation.id
        assert result.operation_name == 'reporting name'

    def test_get_report_operation_by_compliance_report_version_nonexistent_id(self):
        # Arrange
        nonexistent_id = 99999

        # Act & Assert
        with pytest.raises(ComplianceReportVersion.DoesNotExist):
            ComplianceReportVersionService.get_report_operation_by_compliance_report_version(nonexistent_id)

    def test_update_compliance_status(self):
        report_compliance_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('10'),
            credited_emissions=Decimal('5'),
        )
        compliance_report = baker.make_recipe(
            'compliance.tests.utils.compliance_report', report_id=report_compliance_summary.report_version.report_id
        )
        compliance_report_version = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=compliance_report,
            report_compliance_summary=report_compliance_summary,
            status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET,
        )
        ComplianceReportVersionService.update_compliance_status(compliance_report_version)
        compliance_report_version.refresh_from_db()

        # Verify the status was updated based on the current emissions data
        # The status should be determined by _determine_compliance_status method
        expected_status = ComplianceReportVersionService._determine_compliance_status(
            compliance_report_version.report_compliance_summary.excess_emissions,
            compliance_report_version.report_compliance_summary.credited_emissions,
        )
        assert compliance_report_version.status == expected_status
        assert compliance_report_version.status == ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET
