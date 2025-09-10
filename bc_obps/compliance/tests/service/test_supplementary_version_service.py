from decimal import Decimal
from compliance.models import ComplianceReportVersion
from compliance.models.compliance_earned_credit import ComplianceEarnedCredit
from reporting.models import ReportVersion
from compliance.models.compliance_obligation import ComplianceObligation
from compliance.service.supplementary_version_service import (
    NoChangeHandler,
    SupplementaryVersionService,
    IncreasedObligationHandler,
    DecreasedObligationHandler,
    IncreasedCreditHandler,
    DecreasedCreditHandler,
)
import pytest
from unittest.mock import patch, MagicMock
from model_bakery import baker
import common.lib.pgtrigger as pgtrigger
from registration.models import Operation

pytestmark = pytest.mark.django_db(transaction=True)

SUPPLEMENTARY_VERSION_SERVICE_PATH = "compliance.service.supplementary_version_service"

LOGGER_PATH = f"{SUPPLEMENTARY_VERSION_SERVICE_PATH}.logger"
INCREASED_CREDIT_HANDLER_PATH = f"{SUPPLEMENTARY_VERSION_SERVICE_PATH}.IncreasedCreditHandler.handle"
DECREASED_CREDIT_HANDLER_PATH = f"{SUPPLEMENTARY_VERSION_SERVICE_PATH}.DecreasedCreditHandler.handle"
INCREASED_OBLIGATION_HANDLER_PATH = f"{SUPPLEMENTARY_VERSION_SERVICE_PATH}.IncreasedObligationHandler.handle"
DECREASED_OBLIGATION_HANDLER_PATH = f"{SUPPLEMENTARY_VERSION_SERVICE_PATH}.DecreasedObligationHandler.handle"
NO_OBLIGATION_HANDLER_PATH = f"{SUPPLEMENTARY_VERSION_SERVICE_PATH}.NoChangeHandler.handle"
HANDLE_OBLIGATION_INTEGRATION_PATH = (
    f"{SUPPLEMENTARY_VERSION_SERVICE_PATH}.ElicensingObligationService.handle_obligation_integration"
)
CREATE_COMPLIANCE_OBLIGATION_PATH = (
    f"{SUPPLEMENTARY_VERSION_SERVICE_PATH}.ComplianceObligationService.create_compliance_obligation"
)

CREATE_EARNED_CREDIT_PATH = (
    'compliance.service.earned_credits_service.ComplianceEarnedCreditsService.create_earned_credits_record'
)

CREATE_ADJUSTMENT_PATH = (
    'compliance.service.compliance_adjustment_service.ComplianceAdjustmentService.create_adjustment_for_target_version'
)
GET_RATE_PATH = 'compliance.service.compliance_charge_rate_service.ComplianceChargeRateService.get_rate_for_year'


@pytest.fixture
def mock_logger():
    with patch(LOGGER_PATH) as mock:
        yield mock


@pytest.fixture
def mock_increased_credit_handler():
    with patch(INCREASED_CREDIT_HANDLER_PATH) as mock:
        yield mock


@pytest.fixture
def mock_decreased_credit_handler():
    with patch(DECREASED_CREDIT_HANDLER_PATH) as mock:
        yield mock


@pytest.fixture
def mock_increased_handler():
    with patch(INCREASED_OBLIGATION_HANDLER_PATH) as mock:
        yield mock


@pytest.fixture
def mock_decreased_handler():
    with patch(DECREASED_OBLIGATION_HANDLER_PATH) as mock:
        yield mock


@pytest.fixture
def mock_no_change_handler():
    with patch(NO_OBLIGATION_HANDLER_PATH) as mock:
        yield mock


@pytest.fixture
def mock_handle_integration():
    with patch(HANDLE_OBLIGATION_INTEGRATION_PATH) as mock:
        yield mock


@pytest.fixture
def mock_create_obligation():
    with patch(CREATE_COMPLIANCE_OBLIGATION_PATH) as mock:
        yield mock


@pytest.fixture
def mock_create_adjustment():
    with patch(CREATE_ADJUSTMENT_PATH) as mock:
        yield mock


@pytest.fixture
def mock_get_rate():
    with patch(GET_RATE_PATH) as mock:
        yield mock


@pytest.fixture
def mock_create_credits():
    with patch(CREATE_EARNED_CREDIT_PATH) as mock:
        yield mock


class BaseSupplementaryVersionServiceTest:
    def setup_method(self):
        operator = baker.make_recipe('registration.tests.utils.operator')

        operation = baker.make_recipe(
            'registration.tests.utils.operation',
            bc_obps_regulated_operation=baker.make_recipe("registration.tests.utils.boro_id"),
            status=Operation.Statuses.REGISTERED,
            operator=operator,
        )
        self.report = baker.make_recipe(
            'reporting.tests.utils.report', reporting_year_id=2025, operation=operation, operator=operator
        )
        self.report_version_1 = baker.make_recipe(
            'reporting.tests.utils.report_version',
            report=self.report,
            status=ReportVersion.ReportVersionStatus.Submitted,
        )
        self.report_version_2 = baker.make_recipe('reporting.tests.utils.report_version', report=self.report)


class TestSupplementaryVersionService(BaseSupplementaryVersionServiceTest):
    def test_handle_increased_obligation_success(
        self,
        mock_increased_handler,
        mock_decreased_handler,
        mock_no_change_handler,
        mock_increased_credit_handler,
        mock_decreased_credit_handler,
    ):
        # Arrange
        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            self.previous_summary = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('500'),
                credited_emissions=0,
                report_version=self.report_version_1,
            )
        self.new_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('800'),
            credited_emissions=0,
            report_version=self.report_version_2,
        )
        self.compliance_report = baker.make_recipe(
            'compliance.tests.utils.compliance_report', report=self.report, compliance_period_id=1
        )
        mock_result = MagicMock(spec=ComplianceReportVersion)
        mock_increased_handler.return_value = mock_result

        # Act
        result = SupplementaryVersionService().handle_supplementary_version(
            self.compliance_report, self.report_version_2, 2
        )

        # Assert
        mock_increased_handler.assert_called_once_with(
            compliance_report=self.compliance_report,
            new_summary=self.new_summary,
            previous_summary=self.previous_summary,
            version_count=2,
        )
        assert result == mock_result
        mock_decreased_handler.assert_not_called()
        mock_no_change_handler.assert_not_called()
        mock_increased_credit_handler.assert_not_called()
        mock_decreased_credit_handler.assert_not_called()

    def test_handle_decreased_obligation_success(
        self,
        mock_increased_handler,
        mock_decreased_handler,
        mock_no_change_handler,
        mock_increased_credit_handler,
        mock_decreased_credit_handler,
    ):
        # Arrange
        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            self.previous_summary = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('800'),
                credited_emissions=0,
                report_version=self.report_version_1,
            )
        self.new_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('500'),
            credited_emissions=0,
            report_version=self.report_version_2,
        )
        self.compliance_report = baker.make_recipe(
            'compliance.tests.utils.compliance_report', report=self.report, compliance_period_id=1
        )
        mock_result = MagicMock(spec=ComplianceReportVersion)
        mock_decreased_handler.return_value = mock_result

        # Act
        result = SupplementaryVersionService().handle_supplementary_version(
            self.compliance_report, self.report_version_2, 2
        )

        # Assert
        mock_decreased_handler.assert_called_once_with(
            compliance_report=self.compliance_report,
            new_summary=self.new_summary,
            previous_summary=self.previous_summary,
            version_count=2,
        )
        assert result == mock_result
        mock_increased_handler.assert_not_called()
        mock_no_change_handler.assert_not_called()
        mock_increased_credit_handler.assert_not_called()
        mock_decreased_credit_handler.assert_not_called()

    def test_handle_supplementary_version_no_handler_found(
        self,
        mock_increased_handler,
        mock_decreased_handler,
        mock_no_change_handler,
        mock_increased_credit_handler,
        mock_decreased_credit_handler,
        mock_logger,
    ):
        # Arrange
        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            self.previous_summary = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('500'),
                credited_emissions=0,
                report_version=self.report_version_1,
            )
        self.new_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('500'),
            credited_emissions=7,
            report_version=self.report_version_2,
        )
        self.compliance_report = baker.make_recipe(
            'compliance.tests.utils.compliance_report', report=self.report, compliance_period_id=1
        )

        self.compliance_report_version_1 = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=self.compliance_report,
            report_compliance_summary=self.previous_summary,
        )
        baker.make_recipe(
            'compliance.tests.utils.compliance_earned_credit',
            compliance_report_version=self.compliance_report_version_1,
            earned_credits_amount=500,
            issuance_status=ComplianceEarnedCredit.IssuanceStatus.APPROVED,
            bccr_trading_name='Test Trading Name',
            bccr_holding_account_id='123',
        )

        # Act
        result = SupplementaryVersionService().handle_supplementary_version(
            self.compliance_report, self.report_version_2, 2
        )

        # Assert
        assert result is None
        mock_logger.error.assert_called_once_with(
            f"No handler found for report version {self.report_version_2.id} and compliance report {self.compliance_report.id}"
        )
        mock_increased_handler.assert_not_called()
        mock_decreased_handler.assert_not_called()
        mock_no_change_handler.assert_not_called()
        mock_increased_credit_handler.assert_not_called()
        mock_decreased_credit_handler.assert_not_called()

    def test_handle_supplementary_version_no_previous_version(
        self,
        mock_increased_handler,
        mock_decreased_handler,
        mock_no_change_handler,
        mock_increased_credit_handler,
        mock_decreased_credit_handler,
        mock_logger,
    ):
        # Arrange
        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            self.previous_summary = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('500'),
                credited_emissions=0,
                report_version=self.report_version_1,
            )
        self.compliance_report = baker.make_recipe(
            'compliance.tests.utils.compliance_report', report=self.report, compliance_period_id=1
        )

        # Act
        result = SupplementaryVersionService().handle_supplementary_version(
            self.compliance_report, self.report_version_1, 1
        )

        # Assert
        assert result is None
        mock_logger.error.assert_called_once_with(
            f"No previous version found for report version {self.report_version_1.id}"
        )
        mock_increased_handler.assert_not_called()
        mock_decreased_handler.assert_not_called()
        mock_no_change_handler.assert_not_called()
        mock_increased_credit_handler.assert_not_called()
        mock_decreased_credit_handler.assert_not_called()

    def test_handle_increased_credit_success(
        self,
        mock_increased_handler,
        mock_decreased_handler,
        mock_no_change_handler,
        mock_increased_credit_handler,
        mock_decreased_credit_handler,
    ):
        # Arrange
        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            self.previous_summary = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=0,
                credited_emissions=Decimal('500'),
                report_version=self.report_version_1,
            )
        self.new_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=0,
            credited_emissions=Decimal('600'),
            report_version=self.report_version_2,
        )
        self.compliance_report = baker.make_recipe(
            'compliance.tests.utils.compliance_report', report=self.report, compliance_period_id=1
        )
        self.previous_compliance_report_version = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=self.compliance_report,
            report_compliance_summary=self.previous_summary,
            is_supplementary=False,
        )
        baker.make_recipe(
            'compliance.tests.utils.compliance_earned_credit',
            compliance_report_version=self.previous_compliance_report_version,
            earned_credits_amount=500,
            issuance_status=ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED,
        )
        mock_result = MagicMock(spec=ComplianceReportVersion)
        mock_increased_credit_handler.return_value = mock_result

        # Act
        result = SupplementaryVersionService().handle_supplementary_version(
            self.compliance_report, self.report_version_2, 2
        )

        # Assert
        mock_increased_credit_handler.assert_called_once_with(
            compliance_report=self.compliance_report,
            new_summary=self.new_summary,
            previous_summary=self.previous_summary,
            version_count=2,
        )
        assert result == mock_result
        mock_increased_handler.assert_not_called()
        mock_decreased_handler.assert_not_called()
        mock_no_change_handler.assert_not_called()
        mock_decreased_credit_handler.assert_not_called()

    def test_handle_decreased_credit_success(
        self,
        mock_increased_handler,
        mock_decreased_handler,
        mock_no_change_handler,
        mock_increased_credit_handler,
        mock_decreased_credit_handler,
    ):
        # Arrange
        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            self.previous_summary = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=0,
                credited_emissions=Decimal('800'),
                report_version=self.report_version_1,
            )
        self.new_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=0,
            credited_emissions=Decimal('500'),
            report_version=self.report_version_2,
        )
        self.compliance_report = baker.make_recipe(
            'compliance.tests.utils.compliance_report', report=self.report, compliance_period_id=1
        )
        self.previous_compliance_report_version = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=self.compliance_report,
            report_compliance_summary=self.previous_summary,
            is_supplementary=False,
        )
        baker.make_recipe(
            'compliance.tests.utils.compliance_earned_credit',
            compliance_report_version=self.previous_compliance_report_version,
            earned_credits_amount=800,
            issuance_status=ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED,
        )
        mock_result = MagicMock(spec=ComplianceReportVersion)
        mock_decreased_credit_handler.return_value = mock_result

        # Act
        result = SupplementaryVersionService().handle_supplementary_version(
            self.compliance_report, self.report_version_2, 2
        )

        # Assert
        mock_decreased_credit_handler.assert_called_once_with(
            compliance_report=self.compliance_report,
            new_summary=self.new_summary,
            previous_summary=self.previous_summary,
            version_count=2,
        )
        assert result == mock_result
        mock_increased_handler.assert_not_called()
        mock_decreased_handler.assert_not_called()
        mock_no_change_handler.assert_not_called()
        mock_increased_credit_handler.assert_not_called()


class TestIncreasedObligationHandler(BaseSupplementaryVersionServiceTest):
    def test_can_handle_increased_obligation(self):
        # Arrange
        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            self.previous_summary = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('500'),
                credited_emissions=0,
                report_version=self.report_version_1,
            )
        self.new_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('800'),
            credited_emissions=0,
            report_version=self.report_version_2,
        )
        # Act
        result = IncreasedObligationHandler.can_handle(self.new_summary, self.previous_summary)
        # Assert
        assert result is True

    def test_can_handle_zero_to_positive(self):
        # Arrange
        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            self.previous_summary = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('0'),
                credited_emissions=0,
                report_version=self.report_version_1,
            )
        self.new_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('300'),
            credited_emissions=0,
            report_version=self.report_version_2,
        )

        # Act
        result = IncreasedObligationHandler.can_handle(self.new_summary, self.previous_summary)

        # Assert
        assert result is True

    def test_handle_creates_compliance_report_version_and_obligation_integration_runs(
        self, mock_create_obligation, mock_handle_integration
    ):
        # Arrange
        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            self.previous_summary = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('500'),
                credited_emissions=0,
                report_version=self.report_version_1,
            )
        self.new_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('800'),
            credited_emissions=0,
            report_version=self.report_version_2,
        )
        self.compliance_report = baker.make_recipe(
            'compliance.tests.utils.compliance_report', report=self.report, compliance_period_id=1
        )
        self.previous_compliance_report_version = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=self.compliance_report,
            report_compliance_summary=self.previous_summary,
        )
        version_count = 2

        # Mock the obligation creation
        mock_obligation = baker.make_recipe('compliance.tests.utils.compliance_obligation')
        mock_create_obligation.return_value = mock_obligation

        # Act
        result = IncreasedObligationHandler.handle(
            compliance_report=self.compliance_report,
            new_summary=self.new_summary,
            previous_summary=self.previous_summary,
            version_count=version_count,
        )

        # Assert
        # Verify ComplianceReportVersion was created with correct data
        assert isinstance(result, ComplianceReportVersion)
        assert result.compliance_report == self.compliance_report
        assert result.report_compliance_summary == self.new_summary
        assert result.status == ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET
        assert result.excess_emissions_delta_from_previous == Decimal('300')
        assert result.is_supplementary is True
        assert result.previous_version == self.previous_compliance_report_version

        mock_create_obligation.assert_called_once_with(result.id, Decimal('300'))
        mock_handle_integration.assert_called_once_with(mock_obligation.id, self.compliance_report.compliance_period)

    def test_handle_creates_compliance_report_version_and_obligation_integration_skipped(
        self, mock_create_obligation, mock_handle_integration
    ):
        # Arrange
        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            self.previous_summary = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('500'),
                credited_emissions=0,
                report_version=self.report_version_1,
            )
        self.new_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('800'),
            credited_emissions=0,
            report_version=self.report_version_2,
        )
        self.compliance_report = baker.make_recipe(
            'compliance.tests.utils.compliance_report', report=self.report, compliance_period_id=1
        )
        self.previous_compliance_report_version = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=self.compliance_report,
            report_compliance_summary=self.previous_summary,
        )
        version_count = 2

        # Mock the obligation creation
        mock_obligation = baker.make_recipe('compliance.tests.utils.compliance_obligation')
        mock_create_obligation.return_value = mock_obligation

        # Act
        result = IncreasedObligationHandler.handle(
            compliance_report=self.compliance_report,
            new_summary=self.new_summary,
            previous_summary=self.previous_summary,
            version_count=version_count,
        )

        # Assert
        assert isinstance(result, ComplianceReportVersion)
        assert result.compliance_report == self.compliance_report
        assert result.report_compliance_summary == self.new_summary
        assert result.status == ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET
        assert result.excess_emissions_delta_from_previous == Decimal('300')
        assert result.is_supplementary is True
        assert result.previous_version == self.previous_compliance_report_version

        mock_create_obligation.assert_called_once_with(result.id, Decimal('300'))
        mock_handle_integration.assert_called_once_with(mock_obligation.id, self.compliance_report.compliance_period)

    def test_handle_calculates_correct_excess_emission_delta(self, mock_create_obligation, mock_handle_integration):
        # Arrange
        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            self.previous_summary = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('200'),
                credited_emissions=0,
                report_version=self.report_version_1,
            )
        self.new_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('750'),
            credited_emissions=0,
            report_version=self.report_version_2,
        )
        self.compliance_report = baker.make_recipe(
            'compliance.tests.utils.compliance_report', report=self.report, compliance_period_id=1
        )
        self.previous_compliance_report_version = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=self.compliance_report,
            report_compliance_summary=self.previous_summary,
        )
        version_count = 3

        # Mock the obligation creation
        mock_obligation = baker.make_recipe('compliance.tests.utils.compliance_obligation')
        mock_create_obligation.return_value = mock_obligation

        # Act
        result = IncreasedObligationHandler.handle(
            compliance_report=self.compliance_report,
            new_summary=self.new_summary,
            previous_summary=self.previous_summary,
            version_count=version_count,
        )

        # Assert
        expected_delta = Decimal('550')  # 750 - 200
        assert result.excess_emissions_delta_from_previous == expected_delta
        mock_create_obligation.assert_called_once_with(result.id, expected_delta)
        mock_handle_integration.assert_called_once_with(mock_obligation.id, self.compliance_report.compliance_period)


class TestDecreasedObligationHandler(BaseSupplementaryVersionServiceTest):
    def test_can_handle_decreased_obligation(self):
        # Arrange
        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            self.previous_summary = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('800'),
                credited_emissions=0,
                report_version=self.report_version_1,
            )
        self.new_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('500'),
            credited_emissions=0,
            report_version=self.report_version_2,
        )

        # Act
        result = DecreasedObligationHandler.can_handle(self.new_summary, self.previous_summary)

        # Assert
        assert result is True

    def test_can_handle_positive_to_zero(self):
        # Arrange
        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            self.previous_summary = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('300'),
                credited_emissions=0,
                report_version=self.report_version_1,
            )
        self.new_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('0'),
            credited_emissions=0,
            report_version=self.report_version_2,
        )

        # Act
        result = DecreasedObligationHandler.can_handle(self.new_summary, self.previous_summary)

        # Assert
        assert result is True

    def test_can_handle_zero_to_zero(self):
        # Arrange
        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            self.previous_summary = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('0'),
                credited_emissions=0,
                report_version=self.report_version_1,
            )
        self.new_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('0'),
            credited_emissions=0,
            report_version=self.report_version_2,
        )

        # Act
        result = DecreasedObligationHandler.can_handle(self.new_summary, self.previous_summary)

        # Assert
        assert result is False

    def test_handle_creates_compliance_report_version_and_adjustment(self, mock_get_rate, mock_create_adjustment):
        # Arrange
        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            self.previous_summary = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('800'),
                credited_emissions=0,
                report_version=self.report_version_1,
            )
        self.new_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('500'),
            credited_emissions=0,
            report_version=self.report_version_2,
        )
        self.compliance_report = baker.make_recipe(
            'compliance.tests.utils.compliance_report', report=self.report, compliance_period_id=1
        )
        # Create the previous compliance report version that the adjustment will target
        self.previous_compliance_report_version = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=self.compliance_report,
            report_compliance_summary=self.previous_summary,
        )
        version_count = 2

        # Mock the charge rate
        mock_charge_rate = Decimal('50.00')
        mock_get_rate.return_value = mock_charge_rate

        # Act
        result = DecreasedObligationHandler.handle(
            compliance_report=self.compliance_report,
            new_summary=self.new_summary,
            previous_summary=self.previous_summary,
            version_count=version_count,
        )

        # Assert
        # Verify ComplianceReportVersion was created with correct data
        assert isinstance(result, ComplianceReportVersion)
        assert result.compliance_report == self.compliance_report
        assert result.report_compliance_summary == self.new_summary
        assert result.status == ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS
        assert result.excess_emissions_delta_from_previous == Decimal('-300')
        assert result.is_supplementary is True
        assert result.previous_version == self.previous_compliance_report_version

        # Verify ComplianceChargeRateService.get_rate_for_year was called
        mock_get_rate.assert_called_once_with(self.new_summary.report_version.report.reporting_year)

        # Verify ComplianceAdjustmentService.create_adjustment_for_target_version was called with correct parameters
        expected_adjustment_amount = (Decimal('-300') * mock_charge_rate).quantize(
            Decimal('0.01')
        )  # -300 * 50.00 = -15000.00
        mock_create_adjustment.assert_called_once_with(
            target_compliance_report_version_id=self.previous_compliance_report_version.id,  # The previous version to adjust
            adjustment_total=expected_adjustment_amount,
            supplementary_compliance_report_version_id=result.id,  # The new supplementary version that triggered this
        )

    def test_handle_calculates_correct_excess_emission_delta(self):
        # Arrange
        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            self.previous_summary = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('1000'),
                credited_emissions=0,
                report_version=self.report_version_1,
            )
        self.new_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('250'),
            credited_emissions=0,
            report_version=self.report_version_2,
        )
        self.compliance_report = baker.make_recipe(
            'compliance.tests.utils.compliance_report', report=self.report, compliance_period_id=1
        )
        # Create the previous compliance report version that the adjustment will target
        self.previous_compliance_report_version = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=self.compliance_report,
            report_compliance_summary=self.previous_summary,
        )
        version_count = 3

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
                    compliance_report=self.compliance_report,
                    new_summary=self.new_summary,
                    previous_summary=self.previous_summary,
                    version_count=version_count,
                )

                # Assert
                expected_delta = Decimal('-750')  # 250 - 1000
                assert result.excess_emissions_delta_from_previous == expected_delta

    def test_handle_calculates_correct_adjustment_amount(self):
        # Arrange
        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            self.previous_summary = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('600'),
                credited_emissions=0,
                report_version=self.report_version_1,
            )
        self.new_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('200'),
            credited_emissions=0,
            report_version=self.report_version_2,
        )
        self.compliance_report = baker.make_recipe(
            'compliance.tests.utils.compliance_report', report=self.report, compliance_period_id=1
        )
        # Create the previous compliance report version that the adjustment will target
        self.previous_compliance_report_version = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=self.compliance_report,
            report_compliance_summary=self.previous_summary,
        )
        version_count = 2

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
                    compliance_report=self.compliance_report,
                    new_summary=self.new_summary,
                    previous_summary=self.previous_summary,
                    version_count=version_count,
                )

                # Assert
                # Expected adjustment amount: -400 * 100.00 = -40000.00
                expected_adjustment_amount = Decimal('-40000.00')
                mock_create_adjustment.assert_called_once_with(
                    target_compliance_report_version_id=self.previous_compliance_report_version.id,
                    adjustment_total=expected_adjustment_amount,
                    supplementary_compliance_report_version_id=result.id,
                )

    def test_handle_to_zero_marks_previous_fully_met_and_voids_invoice(self, mock_get_rate, mock_create_adjustment):
        """
        When new excess == 0:
          - refund = -previous_excess * rate
          - previous CRV status -> OBLIGATION_FULLY_MET
          - related invoice is_void becomes True (unless penalty PAID)
        """
        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            prev_sum = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('300'),
                credited_emissions=Decimal('0'),
                report_version=self.report_version_1,
            )
            new_sum = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('0'),
                credited_emissions=Decimal('0'),
                report_version=self.report_version_2,
            )

        report = baker.make_recipe(
            'compliance.tests.utils.compliance_report', report=self.report, compliance_period_id=1
        )
        prev_crv = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=report,
            report_compliance_summary=prev_sum,
            status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET,
        )

        # invoice + obligation linked to previous CRV (not paid; should be voided)
        invoice = baker.make_recipe('compliance.tests.utils.elicensing_invoice', is_void=False)
        _obligation = baker.make_recipe(
            'compliance.tests.utils.compliance_obligation',
            compliance_report_version=prev_crv,
            elicensing_invoice=invoice,
            penalty_status=ComplianceObligation.PenaltyStatus.NONE,
        )

        mock_get_rate.return_value = Decimal('50.00')

        result = DecreasedObligationHandler.handle(
            compliance_report=report,
            new_summary=new_sum,
            previous_summary=prev_sum,
            version_count=2,
        )

        # Adjustment posted with full refund
        expected_adjustment_amount = (Decimal('-300') * Decimal('50.00')).quantize(Decimal('0.01'))
        mock_create_adjustment.assert_called_once_with(
            target_compliance_report_version_id=prev_crv.id,
            adjustment_total=expected_adjustment_amount,
            supplementary_compliance_report_version_id=result.id,
        )

        # Previous CRV status updated
        prev_crv.refresh_from_db()
        assert prev_crv.status == ComplianceReportVersion.ComplianceStatus.OBLIGATION_FULLY_MET

        # Invoice voided
        invoice.refresh_from_db()
        assert invoice.is_void is True

    def test_handle_to_zero_does_not_void_invoice_if_penalty_paid(self, mock_get_rate, mock_create_adjustment):
        """
        When penalty_status == PAID, the invoice should not be voided by the flow.
        """
        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            prev_sum = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('150'),
                credited_emissions=Decimal('0'),
                report_version=self.report_version_1,
            )
            new_sum = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('0'),
                credited_emissions=Decimal('0'),
                report_version=self.report_version_2,
            )

        report = baker.make_recipe(
            'compliance.tests.utils.compliance_report', report=self.report, compliance_period_id=1
        )
        prev_crv = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=report,
            report_compliance_summary=prev_sum,
            status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET,
        )

        invoice = baker.make_recipe('compliance.tests.utils.elicensing_invoice', is_void=False)
        _obligation = baker.make_recipe(
            'compliance.tests.utils.compliance_obligation',
            compliance_report_version=prev_crv,
            elicensing_invoice=invoice,
            penalty_status=ComplianceObligation.PenaltyStatus.PAID,  # <- should prevent voiding
        )

        mock_get_rate.return_value = Decimal('40.00')

        _result = DecreasedObligationHandler.handle(
            compliance_report=report,
            new_summary=new_sum,
            previous_summary=prev_sum,
            version_count=2,
        )

        # Adjustment posted
        mock_create_adjustment.assert_called_once()

        # Previous CRV becomes fully met
        prev_crv.refresh_from_db()
        assert prev_crv.status == ComplianceReportVersion.ComplianceStatus.OBLIGATION_FULLY_MET

        # Invoice NOT voided due to penalty PAID
        invoice.refresh_from_db()
        assert invoice.is_void is False

    def test_handle_below_zero_creates_earned_credits_and_voids_invoice_and_marks_fully_met(
        self, mock_get_rate, mock_create_adjustment, mock_create_credits
    ):
        """
        When new excess < 0 (below limit):
          - refund = -previous_excess * rate
          - previous CRV status -> OBLIGATION_FULLY_MET
          - invoice is_void=True
          - earned credits record is created via service (service reads credited_emissions)
        """
        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            prev_sum = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('300'),
                credited_emissions=Decimal('0'),
                report_version=self.report_version_1,
            )
            # Below-limit: negative excess (if your RCS canonicalizes, you can set excess=0 and credited_emissions>0 instead)
            new_sum = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('-10'),
                credited_emissions=Decimal('10'),
                report_version=self.report_version_2,
            )

        report = baker.make_recipe(
            'compliance.tests.utils.compliance_report', report=self.report, compliance_period_id=1
        )
        prev_crv = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=report,
            report_compliance_summary=prev_sum,
            status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET,
        )

        invoice = baker.make_recipe('compliance.tests.utils.elicensing_invoice', is_void=False)
        _obligation = baker.make_recipe(
            'compliance.tests.utils.compliance_obligation',
            compliance_report_version=prev_crv,
            elicensing_invoice=invoice,
            penalty_status=ComplianceObligation.PenaltyStatus.NONE,
        )

        mock_get_rate.return_value = Decimal('20.00')

        result = DecreasedObligationHandler.handle(
            compliance_report=report,
            new_summary=new_sum,
            previous_summary=prev_sum,
            version_count=3,
        )

        # Refund only up to zero: -previous_excess * rate
        expected_adjustment_amount = (Decimal('-300') * Decimal('20.00')).quantize(Decimal('0.01'))
        mock_create_adjustment.assert_called_once_with(
            target_compliance_report_version_id=prev_crv.id,
            adjustment_total=expected_adjustment_amount,
            supplementary_compliance_report_version_id=result.id,
        )

        # Previous CRV status updated and invoice voided
        prev_crv.refresh_from_db()
        assert prev_crv.status == ComplianceReportVersion.ComplianceStatus.OBLIGATION_FULLY_MET
        invoice.refresh_from_db()
        assert invoice.is_void is True

        # Earned credits created for the new supplementary CRV
        mock_create_credits.assert_called_once_with(compliance_report_version=result)

    def test_handle_partial_refund_does_not_void_or_mark_or_create_credits(
        self, mock_get_rate, mock_create_adjustment, mock_create_credits
    ):
        """
        When new excess > 0 (still above limit, but reduced):
          - partial refund = (new - previous) * rate (negative)
          - DO NOT mark previous CRV fully met
          - DO NOT void invoice
          - DO NOT create earned credits
        """
        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            prev_sum = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('600'),
                credited_emissions=Decimal('0'),
                report_version=self.report_version_1,
            )
            new_sum = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('400'),
                credited_emissions=Decimal('0'),
                report_version=self.report_version_2,
            )

        report = baker.make_recipe(
            'compliance.tests.utils.compliance_report', report=self.report, compliance_period_id=1
        )
        prev_crv = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=report,
            report_compliance_summary=prev_sum,
            status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET,
        )

        invoice = baker.make_recipe('compliance.tests.utils.elicensing_invoice', is_void=False)
        _obligation = baker.make_recipe(
            'compliance.tests.utils.compliance_obligation',
            compliance_report_version=prev_crv,
            elicensing_invoice=invoice,
            penalty_status=ComplianceObligation.PenaltyStatus.NONE,
        )

        mock_get_rate.return_value = Decimal('10.00')

        result = DecreasedObligationHandler.handle(
            compliance_report=report,
            new_summary=new_sum,
            previous_summary=prev_sum,
            version_count=2,
        )

        # Partial refund amount = (400 - 600) * 10 = -2000.00
        expected_adjustment_amount = (Decimal('-200') * Decimal('10.00')).quantize(Decimal('0.01'))
        mock_create_adjustment.assert_called_once_with(
            target_compliance_report_version_id=prev_crv.id,
            adjustment_total=expected_adjustment_amount,
            supplementary_compliance_report_version_id=result.id,
        )

        # No status flip to fully met
        prev_crv.refresh_from_db()
        assert prev_crv.status == ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET

        # Invoice remains not void
        invoice.refresh_from_db()
        assert invoice.is_void is False

        # No earned credits created
        mock_create_credits.assert_not_called()


class TestNoChangeHandler(BaseSupplementaryVersionServiceTest):
    def test_handle_no_change_success(self):
        # Arrange
        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            self.previous_summary = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('500'),
                credited_emissions=0,
                report_version=self.report_version_1,
            )
        self.new_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('500'),
            credited_emissions=0,
            report_version=self.report_version_2,
        )
        self.compliance_report = baker.make_recipe(
            'compliance.tests.utils.compliance_report', report=self.report, compliance_period_id=1
        )
        self.previous_compliance_report_version = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=self.compliance_report,
            report_compliance_summary=self.previous_summary,
        )

        # Act
        result = SupplementaryVersionService().handle_supplementary_version(
            self.compliance_report, self.report_version_2, 2
        )

        # Assert
        assert result.status == ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS
        assert result.report_compliance_summary_id == self.new_summary.id
        assert result.compliance_report_id == self.compliance_report.id
        assert result.excess_emissions_delta_from_previous == Decimal('0')
        assert result.is_supplementary is True
        assert result.previous_version == self.previous_compliance_report_version

    def test_can_handle_no_change_handler_unchanged_credited_emissions(self):
        # Arrange
        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            self.previous_summary = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=0,
                credited_emissions=Decimal('100'),
                report_version=self.report_version_1,
            )
        self.new_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=0,
            credited_emissions=Decimal('100'),
            report_version=self.report_version_2,
        )
        # Act
        result = NoChangeHandler.can_handle(self.new_summary, self.previous_summary)
        # Assert
        assert result is True

    def test_can_handle_no_change_handler_unchanged_excess_emissions(self):
        # Arrange
        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            self.previous_summary = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('100'),
                credited_emissions=0,
                report_version=self.report_version_1,
            )
        self.new_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('100'),
            credited_emissions=0,
            report_version=self.report_version_2,
        )
        # Act
        result = NoChangeHandler.can_handle(self.new_summary, self.previous_summary)
        # Assert
        assert result is True


class TestIncreasedCreditHandler(BaseSupplementaryVersionServiceTest):
    def test_can_handle_increased_credits(self):
        # Arrange
        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            self.previous_summary = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=0,
                credited_emissions=Decimal('500'),
                report_version=self.report_version_1,
            )
            self.new_summary = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=0,
                credited_emissions=Decimal('600'),
                report_version=self.report_version_2,
            )
        self.compliance_report = baker.make_recipe(
            'compliance.tests.utils.compliance_report', report=self.report, compliance_period_id=1
        )
        self.original_report_version = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            report_compliance_summary=self.previous_summary,
            is_supplementary=False,
        )
        baker.make_recipe(
            'compliance.tests.utils.compliance_earned_credit',
            compliance_report_version=self.original_report_version,
            earned_credits_amount=500,
            issuance_status=ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED,
        )

        # Act
        result = IncreasedCreditHandler.can_handle(self.new_summary, self.previous_summary)

        # Assert
        assert result is True

    def test_can_handle_credits_already_applied(self):
        # Arrange
        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            self.previous_summary = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=0,
                credited_emissions=Decimal('500'),
                report_version=self.report_version_1,
            )
        self.new_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=0,
            credited_emissions=Decimal('600'),
            report_version=self.report_version_2,
        )
        self.compliance_report = baker.make_recipe(
            'compliance.tests.utils.compliance_report', report=self.report, compliance_period_id=1
        )
        self.original_report_version = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version', report_compliance_summary=self.previous_summary
        )
        baker.make_recipe(
            'compliance.tests.utils.compliance_earned_credit',
            compliance_report_version=self.original_report_version,
            earned_credits_amount=500,
            issuance_status=ComplianceEarnedCredit.IssuanceStatus.APPROVED,
            bccr_trading_name='Test Trading Name',
            bccr_holding_account_id='123',
        )

        # Act
        result = IncreasedCreditHandler.can_handle(self.new_summary, self.previous_summary)

        # Assert
        assert result is False

    def test_handle_increased_credits_success(self):
        # Arrange
        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            self.previous_summary = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=0,
                credited_emissions=Decimal('100'),
                report_version=self.report_version_1,
            )
        self.new_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=0,
            credited_emissions=Decimal('250'),
            report_version=self.report_version_2,
        )
        self.compliance_report = baker.make_recipe(
            'compliance.tests.utils.compliance_report', report=self.report, compliance_period_id=1
        )
        self.previous_compliance_report_version = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            report_compliance_summary=self.previous_summary,
            is_supplementary=False,
            compliance_report=self.compliance_report,
        )
        earned_credit = baker.make_recipe(
            'compliance.tests.utils.compliance_earned_credit',
            compliance_report_version=self.previous_compliance_report_version,
            compliance_report_version__compliance_report=self.compliance_report,
            earned_credits_amount=Decimal('100'),
        )
        # Act
        result = IncreasedCreditHandler.handle(self.compliance_report, self.new_summary, self.previous_summary, 2)

        # Assert result
        assert result.status == ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS
        assert result.report_compliance_summary_id == self.new_summary.id
        assert result.compliance_report_id == self.compliance_report.id
        assert result.credited_emissions_delta_from_previous == Decimal('150')
        assert result.is_supplementary is True
        assert result.previous_version == self.previous_compliance_report_version
        # Assert the earned credits were updated correctly
        earned_credit.refresh_from_db()
        assert earned_credit.earned_credits_amount == Decimal('250')


class TestDecreasedCreditHandler(BaseSupplementaryVersionServiceTest):
    def test_can_handle_decreased_credits(self):
        # Arrange
        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            self.previous_summary = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=0,
                credited_emissions=Decimal('600'),
                report_version=self.report_version_1,
            )
            self.new_summary = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=0,
                credited_emissions=Decimal('500'),
                report_version=self.report_version_2,
            )
        self.compliance_report = baker.make_recipe(
            'compliance.tests.utils.compliance_report', report=self.report, compliance_period_id=1
        )
        self.original_report_version = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            report_compliance_summary=self.previous_summary,
            is_supplementary=False,
        )
        baker.make_recipe(
            'compliance.tests.utils.compliance_earned_credit',
            compliance_report_version=self.original_report_version,
            earned_credits_amount=500,
            issuance_status=ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED,
        )

        # Act
        result = DecreasedCreditHandler.can_handle(self.new_summary, self.previous_summary)

        # Assert
        assert result is True

    def test_handle_decreased_credits_success(self):
        # Arrange
        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            self.previous_summary = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=0,
                credited_emissions=Decimal('800'),
                report_version=self.report_version_1,
            )
            self.new_summary = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=0,
                credited_emissions=Decimal('500'),
                report_version=self.report_version_2,
            )
        self.original_report_version = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            report_compliance_summary=self.previous_summary,
            is_supplementary=False,
        )
        baker.make_recipe(
            'compliance.tests.utils.compliance_earned_credit',
            compliance_report_version=self.original_report_version,
            earned_credits_amount=800,
            issuance_status=ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED,
        )
        # Act
        new_compliance_version = DecreasedCreditHandler.handle(
            self.original_report_version.compliance_report, self.new_summary, self.previous_summary, 2
        )
        credit_record = ComplianceEarnedCredit.objects.get(compliance_report_version=self.original_report_version)

        # Assert
        assert new_compliance_version.status == ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS
        assert new_compliance_version.credited_emissions_delta_from_previous == Decimal("-300")
        assert new_compliance_version.report_compliance_summary_id == self.new_summary.id
        assert new_compliance_version.is_supplementary is True
        assert new_compliance_version.previous_version == self.original_report_version
        assert credit_record.earned_credits_amount == Decimal('500')
        assert credit_record.issuance_status == ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED
