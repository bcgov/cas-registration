from decimal import Decimal
from compliance.service.compliance_report_version_service import ComplianceReportVersionService
import pytest
from unittest.mock import patch
from compliance.models import ComplianceReportVersion, ComplianceEarnedCredit, ComplianceChargeRate
from compliance.tests.utils.compliance_test_helper import ComplianceTestHelper
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
            compliance_report.id, report_compliance_summary.report_version.id
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
            compliance_report.id, report_compliance_summary.report_version.id
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
            compliance_report.id, report_compliance_summary.report_version.id
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
            compliance_report.id, report_compliance_summary.report_version.id
        )

        # Assert
        assert result.status == ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS
        assert result.report_compliance_summary_id == report_compliance_summary.id
        assert result.compliance_report_id == compliance_report.id
        mock_send_email.execute.assert_called_once_with(result.id)

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

    def test_calculate_outstanding_balance_tco2e_with_existing_invoice(self):
        # Arrange
        test_data = ComplianceTestHelper.build_test_data(
            crv_status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET,
            create_invoice_data=True,
        )

        reporting_year = test_data.compliance_report.compliance_period.reporting_year
        ComplianceChargeRate.objects.update_or_create(
            reporting_year=reporting_year,
            defaults={"rate": Decimal("50.00")},
        )

        test_data.invoice.outstanding_balance = Decimal("105.00")
        test_data.invoice.invoice_fee_balance = Decimal("100.00")
        test_data.invoice.save()

        # Act
        result = ComplianceReportVersionService.calculate_outstanding_balance_tco2e(test_data.compliance_report_version)

        # Assert
        assert result == Decimal("2.0000")  # 100.00 / 50.00

    def test_calculate_outstanding_balance_tco2e_zero_balance_invoice_returns_0_00(self):
        # Arrange
        test_data = ComplianceTestHelper.build_test_data(
            crv_status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET,
            create_invoice_data=True,
        )

        reporting_year = test_data.compliance_report.compliance_period.reporting_year
        charge_rate = Decimal("50.00")
        ComplianceChargeRate.objects.update_or_create(
            reporting_year=reporting_year,
            defaults={"rate": charge_rate},
        )

        test_data.invoice.outstanding_balance = Decimal("2.00")
        test_data.invoice.invoice_fee_balance = Decimal("0.00")
        test_data.invoice.save()

        # Act
        result = ComplianceReportVersionService.calculate_outstanding_balance_tco2e(test_data.compliance_report_version)

        # Assert
        assert result == Decimal("0.0000")  # Not "0E+2"
        assert str(result) == "0.0000"

    def test_calculate_outstanding_balance_tco2e_no_existing_invoice_initial_report(self):
        # Arrange
        test_data = ComplianceTestHelper.build_test_data(
            crv_status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET,
        )
        test_data.report_compliance_summary.excess_emissions = Decimal("888")
        test_data.report_compliance_summary.save()

        # Act
        result = ComplianceReportVersionService.calculate_outstanding_balance_tco2e(test_data.compliance_report_version)

        # Assert
        assert result == Decimal("888.0000")

    def test_calculate_outstanding_balance_tco2e_superceded(self):
        # Arrange
        previous_data = ComplianceTestHelper.build_test_data(
            crv_status=ComplianceReportVersion.ComplianceStatus.SUPERCEDED,
        )
        previous_data.report_compliance_summary.excess_emissions = Decimal("888")
        previous_data.report_compliance_summary.save()

        test_data = ComplianceTestHelper.build_test_data(
            crv_status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET,
            previous_data=previous_data,
        )
        test_data.report_compliance_summary.excess_emissions = Decimal("999")
        test_data.report_compliance_summary.save()

        # Act
        result = ComplianceReportVersionService.calculate_outstanding_balance_tco2e(test_data.compliance_report_version)

        # Assert
        assert result == Decimal("999.0000")

    def test_calculate_computed_value_excess_emissions(self):
        version_1_data = ComplianceTestHelper.build_test_data(
            crv_status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET,
        )
        version_1_data.report_compliance_summary.excess_emissions = Decimal("100.00")
        version_1_data.report_compliance_summary.save()

        version_2_data = ComplianceTestHelper.build_test_data(
            crv_status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET,
            previous_data=version_1_data,
        )
        version_2_data.compliance_report_version.excess_emissions_delta_from_previous = Decimal("2.0")
        version_2_data.compliance_report_version.save()

        version_3_data = ComplianceTestHelper.build_test_data(previous_data=version_2_data)
        version_3_data.compliance_report_version.excess_emissions_delta_from_previous = Decimal("-2.0")
        version_3_data.compliance_report_version.save()
        # Act
        assert ComplianceReportVersionService.calculate_computed_value_excess_emissions(
            version_1_data.compliance_report_version
        ) == Decimal("100.00")
        assert ComplianceReportVersionService.calculate_computed_value_excess_emissions(
            version_2_data.compliance_report_version
        ) == Decimal("2.0")
        assert ComplianceReportVersionService.calculate_computed_value_excess_emissions(
            version_3_data.compliance_report_version
        ) == Decimal("0")

    def test_get_operator_by_compliance_report_version(self):
        # Arrange
        test_data = ComplianceTestHelper.build_test_data()

        # Act
        result = ComplianceReportVersionService.get_operator_by_compliance_report_version(
            test_data.compliance_report_version.id
        )

        # Assert
        assert isinstance(result, Operator)
        assert result.id == test_data.operation.operator.id

    def test_get_operator_by_compliance_report_version_nonexistent_id(self):
        # Arrange
        nonexistent_id = 99999

        # Act & Assert
        with pytest.raises(ComplianceReportVersion.DoesNotExist):
            ComplianceReportVersionService.get_operator_by_compliance_report_version(nonexistent_id)

    def test_get_report_operation_by_compliance_report_version(self):
        # Arrange
        test_data = ComplianceTestHelper.build_test_data()

        # Act
        result = ComplianceReportVersionService.get_report_operation_by_compliance_report_version(
            test_data.compliance_report_version.id
        )

        # Assert
        assert isinstance(result, ReportOperation)
        assert result.id == test_data.report_operation.id
        assert result.operation_name == test_data.report_operation.operation_name

    def test_get_report_operation_by_compliance_report_version_nonexistent_id(self):
        # Arrange
        nonexistent_id = 99999

        # Act & Assert
        with pytest.raises(ComplianceReportVersion.DoesNotExist):
            ComplianceReportVersionService.get_report_operation_by_compliance_report_version(nonexistent_id)

    def test_update_compliance_status(self):
        test_data = ComplianceTestHelper.build_test_data()
        test_data.report_compliance_summary.excess_emissions = Decimal('10')
        test_data.report_compliance_summary.credited_emissions = Decimal('5')
        test_data.report_compliance_summary.save()
        test_data.compliance_report_version.status = ComplianceReportVersion.ComplianceStatus.EARNED_CREDITS
        test_data.compliance_report_version.save()

        ComplianceReportVersionService.update_compliance_status(test_data.compliance_report_version)
        test_data.compliance_report_version.refresh_from_db()

        # Verify the status was updated based on the current emissions data
        # The status should be determined by _determine_compliance_status method
        expected_status = ComplianceReportVersionService._determine_compliance_status(
            test_data.compliance_report_version.report_compliance_summary.excess_emissions,
            test_data.compliance_report_version.report_compliance_summary.credited_emissions,
        )
        assert test_data.compliance_report_version.status == expected_status
        assert test_data.compliance_report_version.status == ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET
