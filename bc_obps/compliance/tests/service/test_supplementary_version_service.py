from decimal import Decimal
from compliance.models import ComplianceReportVersion
from reporting.models import ReportVersion
from compliance.service.supplementary_version_service import (
    SupplementaryVersionService,
    IncreasedObligationHandler,
    DecreasedObligationHandler,
)
import pytest
from unittest.mock import patch, MagicMock
from model_bakery import baker
import common.lib.pgtrigger as pgtrigger
from registration.models import Operation

pytestmark = pytest.mark.django_db(transaction=True)  # This is used to mark a test function as requiring the database


class TestSupplementaryVersionService:
    @patch('compliance.service.supplementary_version_service.IncreasedObligationHandler.handle')
    def test_handle_increased_obligation_success(self, mock_increased_handler):
        # Arrange

        operator = baker.make_recipe('registration.tests.utils.operator')

        operation = baker.make_recipe(
            'registration.tests.utils.operation',
            bc_obps_regulated_operation=baker.make_recipe("registration.tests.utils.boro_id"),
            status=Operation.Statuses.REGISTERED,
            operator=operator,
        )

        report = baker.make_recipe(
            'reporting.tests.utils.report', reporting_year_id=2025, operation=operation, operator=operator
        )
        report_version_1 = baker.make_recipe(
            'reporting.tests.utils.report_version', report=report, status=ReportVersion.ReportVersionStatus.Submitted
        )
        report_version_2 = baker.make_recipe('reporting.tests.utils.report_version', report=report)
        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            report_compliance_summary_1 = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('500'),
                credited_emissions=0,
                report_version=report_version_1,
            )
        report_compliance_summary_2 = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('800'),
            credited_emissions=0,
            report_version=report_version_2,
        )
        compliance_report = baker.make_recipe(
            'compliance.tests.utils.compliance_report', report=report, compliance_period_id=1
        )
        baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=compliance_report,
            report_compliance_summary=report_compliance_summary_1,
        )

        mock_result = MagicMock(spec=ComplianceReportVersion)
        mock_increased_handler.return_value = mock_result

        # Act
        result = SupplementaryVersionService().handle_supplementary_version(compliance_report, report_version_2, 2)

        # Assert
        mock_increased_handler.assert_called_once_with(
            compliance_report=compliance_report,
            new_summary=report_compliance_summary_2,
            previous_summary=report_compliance_summary_1,
            version_count=2,
        )
        assert result == mock_result

    @patch('compliance.service.supplementary_version_service.DecreasedObligationHandler.handle')
    def test_handle_decreased_obligation_success(self, mock_decreased_handler):
        # Arrange
        operator = baker.make_recipe('registration.tests.utils.operator')

        operation = baker.make_recipe(
            'registration.tests.utils.operation',
            bc_obps_regulated_operation=baker.make_recipe("registration.tests.utils.boro_id"),
            status=Operation.Statuses.REGISTERED,
            operator=operator,
        )

        report = baker.make_recipe(
            'reporting.tests.utils.report', reporting_year_id=2025, operation=operation, operator=operator
        )
        report_version_1 = baker.make_recipe(
            'reporting.tests.utils.report_version', report=report, status=ReportVersion.ReportVersionStatus.Submitted
        )
        report_version_2 = baker.make_recipe('reporting.tests.utils.report_version', report=report)
        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            report_compliance_summary_1 = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('800'),
                credited_emissions=0,
                report_version=report_version_1,
            )
        report_compliance_summary_2 = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('500'),
            credited_emissions=0,
            report_version=report_version_2,
        )
        compliance_report = baker.make_recipe(
            'compliance.tests.utils.compliance_report', report=report, compliance_period_id=1
        )
        baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=compliance_report,
            report_compliance_summary=report_compliance_summary_1,
        )

        mock_result = MagicMock(spec=ComplianceReportVersion)
        mock_decreased_handler.return_value = mock_result

        # Act
        result = SupplementaryVersionService().handle_supplementary_version(compliance_report, report_version_2, 2)

        # Assert
        mock_decreased_handler.assert_called_once_with(
            compliance_report=compliance_report,
            new_summary=report_compliance_summary_2,
            previous_summary=report_compliance_summary_1,
            version_count=2,
        )
        assert result == mock_result

    @patch('compliance.service.supplementary_version_service.logger')
    def test_handle_supplementary_version_no_handler_found(self, mock_logger):
        # Arrange
        operator = baker.make_recipe('registration.tests.utils.operator')

        operation = baker.make_recipe(
            'registration.tests.utils.operation',
            bc_obps_regulated_operation=baker.make_recipe("registration.tests.utils.boro_id"),
            status=Operation.Statuses.REGISTERED,
            operator=operator,
        )

        report = baker.make_recipe(
            'reporting.tests.utils.report', reporting_year_id=2025, operation=operation, operator=operator
        )
        report_version_1 = baker.make_recipe(
            'reporting.tests.utils.report_version', report=report, status=ReportVersion.ReportVersionStatus.Submitted
        )
        report_version_2 = baker.make_recipe('reporting.tests.utils.report_version', report=report)
        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            report_compliance_summary_1 = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('500'),
                credited_emissions=0,
                report_version=report_version_1,
            )
        # report_compliance_summary_2
        baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('500'),  # Same as previous - no change
            credited_emissions=0,
            report_version=report_version_2,
        )
        compliance_report = baker.make_recipe(
            'compliance.tests.utils.compliance_report', report=report, compliance_period_id=1
        )
        baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=compliance_report,
            report_compliance_summary=report_compliance_summary_1,
        )

        # Act
        result = SupplementaryVersionService().handle_supplementary_version(compliance_report, report_version_2, 2)

        # Assert
        assert result is None
        mock_logger.error.assert_called_once_with(
            f"No handler found for report version {report_version_2.id} and compliance report {compliance_report.id}"
        )

    @patch('compliance.service.supplementary_version_service.logger')
    def test_handle_supplementary_version_no_previous_version(self, mock_logger):
        # Arrange
        operator = baker.make_recipe('registration.tests.utils.operator')

        operation = baker.make_recipe(
            'registration.tests.utils.operation',
            bc_obps_regulated_operation=baker.make_recipe("registration.tests.utils.boro_id"),
            status=Operation.Statuses.REGISTERED,
            operator=operator,
        )

        report = baker.make_recipe(
            'reporting.tests.utils.report', reporting_year_id=2025, operation=operation, operator=operator
        )
        report_version_1 = baker.make_recipe('reporting.tests.utils.report_version', report=report)
        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('500'),
                credited_emissions=0,
                report_version=report_version_1,
            )
        compliance_report = baker.make_recipe(
            'compliance.tests.utils.compliance_report', report=report, compliance_period_id=1
        )

        # Act
        result = SupplementaryVersionService().handle_supplementary_version(compliance_report, report_version_1, 1)

        # Assert
        assert result is None
        mock_logger.error.assert_called_once_with(f"No previous version found for report version {report_version_1.id}")


class TestIncreasedObligationHandler:
    def test_can_handle_increased_obligation(self):
        # Arrange
        previous_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('500'),
            credited_emissions=0,
        )
        new_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('800'),
            credited_emissions=0,
        )

        # Act
        result = IncreasedObligationHandler.can_handle(new_summary, previous_summary)

        # Assert
        assert result is True

    def test_can_handle_decreased_obligation_returns_false(self):
        # Arrange
        previous_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('800'),
            credited_emissions=0,
        )
        new_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('500'),
            credited_emissions=0,
        )

        # Act
        result = IncreasedObligationHandler.can_handle(new_summary, previous_summary)

        # Assert
        assert result is False

    def test_can_handle_no_change(self):
        # Arrange
        previous_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('500'),
            credited_emissions=0,
        )
        new_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('500'),
            credited_emissions=0,
        )

        # Act
        result = IncreasedObligationHandler.can_handle(new_summary, previous_summary)

        # Assert
        assert result is False

    def test_can_handle_zero_to_positive(self):
        # Arrange
        previous_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('0'),
            credited_emissions=0,
        )
        new_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('300'),
            credited_emissions=0,
        )

        # Act
        result = IncreasedObligationHandler.can_handle(new_summary, previous_summary)

        # Assert
        assert result is True

    @patch(
        'compliance.service.elicensing.elicensing_obligation_service.ElicensingObligationService.process_obligation_integration'
    )
    @patch('compliance.service.compliance_obligation_service.ComplianceObligationService.create_compliance_obligation')
    def test_handle_creates_compliance_report_version_and_obligation(self, mock_create_obligation, mock_integration):
        # Arrange
        compliance_report = baker.make_recipe('compliance.tests.utils.compliance_report')
        previous_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('500'),
            credited_emissions=0,
        )
        new_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('800'),
            credited_emissions=0,
        )
        version_count = 2

        # Mock the obligation creation
        mock_obligation = baker.make_recipe('compliance.tests.utils.compliance_obligation')
        mock_create_obligation.return_value = mock_obligation

        # Act
        result = IncreasedObligationHandler.handle(
            compliance_report=compliance_report,
            new_summary=new_summary,
            previous_summary=previous_summary,
            version_count=version_count,
        )

        # Assert
        # Verify ComplianceReportVersion was created with correct data
        assert isinstance(result, ComplianceReportVersion)
        assert result.compliance_report == compliance_report
        assert result.report_compliance_summary == new_summary
        assert result.status == ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET
        assert result.excess_emissions_delta_from_previous == Decimal('300')
        assert result.is_supplementary is True

        # Verify ComplianceObligationService.create_compliance_obligation was called
        mock_create_obligation.assert_called_once_with(result.id, Decimal('300'))

        # Verify ElicensingObligationService.process_obligation_integration was called
        mock_integration.assert_called_once_with(mock_obligation.id)

    def test_handle_calculates_correct_excess_emission_delta(self):
        # Arrange
        compliance_report = baker.make_recipe('compliance.tests.utils.compliance_report')
        previous_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('200'),
            credited_emissions=0,
        )
        new_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('750'),
            credited_emissions=0,
        )
        version_count = 3

        with patch(
            'compliance.service.compliance_obligation_service.ComplianceObligationService.create_compliance_obligation'
        ) as mock_create_obligation:
            with patch(
                'compliance.service.elicensing.elicensing_obligation_service.ElicensingObligationService.process_obligation_integration'
            ):
                # Act
                result = IncreasedObligationHandler.handle(
                    compliance_report=compliance_report,
                    new_summary=new_summary,
                    previous_summary=previous_summary,
                    version_count=version_count,
                )

                # Assert
                expected_delta = Decimal('550')  # 750 - 200
                assert result.excess_emissions_delta_from_previous == expected_delta
                mock_create_obligation.assert_called_once_with(result.id, expected_delta)


class TestDecreasedObligationHandler:
    def test_can_handle_decreased_obligation(self):
        # Arrange
        previous_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('800'),
            credited_emissions=0,
        )
        new_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('500'),
            credited_emissions=0,
        )

        # Act
        result = DecreasedObligationHandler.can_handle(new_summary, previous_summary)

        # Assert
        assert result is True

    def test_can_handle_increased_obligation_returns_false(self):
        # Arrange
        previous_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('500'),
            credited_emissions=0,
        )
        new_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('800'),
            credited_emissions=0,
        )

        # Act
        result = DecreasedObligationHandler.can_handle(new_summary, previous_summary)

        # Assert
        assert result is False

    def test_can_handle_no_change(self):
        # Arrange
        previous_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('500'),
            credited_emissions=0,
        )
        new_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('500'),
            credited_emissions=0,
        )

        # Act
        result = DecreasedObligationHandler.can_handle(new_summary, previous_summary)

        # Assert
        assert result is False

    def test_can_handle_positive_to_zero(self):
        # Arrange
        previous_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('300'),
            credited_emissions=0,
        )
        new_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('0'),
            credited_emissions=0,
        )

        # Act
        result = DecreasedObligationHandler.can_handle(new_summary, previous_summary)

        # Assert
        assert result is True

    def test_can_handle_zero_to_zero(self):
        # Arrange
        previous_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('0'),
            credited_emissions=0,
        )
        new_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('0'),
            credited_emissions=0,
        )

        # Act
        result = DecreasedObligationHandler.can_handle(new_summary, previous_summary)

        # Assert
        assert result is False

    @patch(
        'compliance.service.compliance_adjustment_service.ComplianceAdjustmentService.create_adjustment_for_target_version'
    )
    @patch('compliance.service.compliance_charge_rate_service.ComplianceChargeRateService.get_rate_for_year')
    def test_handle_creates_compliance_report_version_and_adjustment(self, mock_get_rate, mock_create_adjustment):
        # Arrange
        compliance_report = baker.make_recipe('compliance.tests.utils.compliance_report')
        previous_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('800'),
            credited_emissions=0,
        )
        new_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('500'),
            credited_emissions=0,
        )
        version_count = 2

        # Create the previous compliance report version that the adjustment will target
        previous_compliance_report_version = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=compliance_report,
            report_compliance_summary=previous_summary,
        )

        # Mock the charge rate
        mock_charge_rate = Decimal('50.00')
        mock_get_rate.return_value = mock_charge_rate

        # Act
        result = DecreasedObligationHandler.handle(
            compliance_report=compliance_report,
            new_summary=new_summary,
            previous_summary=previous_summary,
            version_count=version_count,
        )

        # Assert
        # Verify ComplianceReportVersion was created with correct data
        assert isinstance(result, ComplianceReportVersion)
        assert result.compliance_report == compliance_report
        assert result.report_compliance_summary == new_summary
        assert result.status == ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS
        assert result.excess_emissions_delta_from_previous == Decimal('-300')
        assert result.is_supplementary is True

        # Verify ComplianceChargeRateService.get_rate_for_year was called
        mock_get_rate.assert_called_once_with(new_summary.report_version.report.reporting_year)

        # Verify ComplianceAdjustmentService.create_adjustment_for_target_version was called with correct parameters
        expected_adjustment_amount = (Decimal('-300') * mock_charge_rate).quantize(
            Decimal('0.01')
        )  # -300 * 50.00 = -15000.00
        mock_create_adjustment.assert_called_once_with(
            target_compliance_report_version_id=previous_compliance_report_version.id,  # The previous version to adjust
            adjustment_total=expected_adjustment_amount,
            supplementary_compliance_report_version_id=result.id,  # The new supplementary version that triggered this
        )

    def test_handle_calculates_correct_excess_emission_delta(self):
        # Arrange
        compliance_report = baker.make_recipe('compliance.tests.utils.compliance_report')
        previous_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('1000'),
            credited_emissions=0,
        )
        new_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('250'),
            credited_emissions=0,
        )
        version_count = 3

        # Create the previous compliance report version that the adjustment will target
        baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=compliance_report,
            report_compliance_summary=previous_summary,
        )

        with patch(
            'compliance.service.compliance_charge_rate_service.ComplianceChargeRateService.get_rate_for_year'
        ) as mock_get_rate:
            with patch(
                'compliance.service.compliance_adjustment_service.ComplianceAdjustmentService.create_adjustment_for_target_version'
            ):
                # Mock the charge rate
                mock_get_rate.return_value = Decimal('75.00')

                # Act
                result = DecreasedObligationHandler.handle(
                    compliance_report=compliance_report,
                    new_summary=new_summary,
                    previous_summary=previous_summary,
                    version_count=version_count,
                )

                # Assert
                expected_delta = Decimal('-750')  # 250 - 1000
                assert result.excess_emissions_delta_from_previous == expected_delta

    def test_handle_calculates_correct_adjustment_amount(self):
        # Arrange
        compliance_report = baker.make_recipe('compliance.tests.utils.compliance_report')
        previous_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('600'),
            credited_emissions=0,
        )
        new_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('200'),
            credited_emissions=0,
        )
        version_count = 2

        # Create the previous compliance report version that the adjustment will target
        previous_compliance_report_version = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=compliance_report,
            report_compliance_summary=previous_summary,
        )

        with patch(
            'compliance.service.compliance_charge_rate_service.ComplianceChargeRateService.get_rate_for_year'
        ) as mock_get_rate:
            with patch(
                'compliance.service.compliance_adjustment_service.ComplianceAdjustmentService.create_adjustment_for_target_version'
            ) as mock_create_adjustment:
                # Mock the charge rate
                mock_get_rate.return_value = Decimal('100.00')

                # Act
                result = DecreasedObligationHandler.handle(
                    compliance_report=compliance_report,
                    new_summary=new_summary,
                    previous_summary=previous_summary,
                    version_count=version_count,
                )

                # Assert
                # Expected adjustment amount: -400 * 100.00 = -40000.00
                expected_adjustment_amount = Decimal('-40000.00')
                mock_create_adjustment.assert_called_once_with(
                    target_compliance_report_version_id=previous_compliance_report_version.id,
                    adjustment_total=expected_adjustment_amount,
                    supplementary_compliance_report_version_id=result.id,
                )
