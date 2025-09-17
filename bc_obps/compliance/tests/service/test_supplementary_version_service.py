from decimal import Decimal
from compliance.models import ComplianceReportVersion
from compliance.models.compliance_earned_credit import ComplianceEarnedCredit
from reporting.models import ReportVersion
from compliance.models.elicensing_adjustment import ElicensingAdjustment
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

ZERO_DECIMAL = Decimal('0')


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

    def test_invoice_unpaid_decrease_but_still_above_zero(
        self, mock_get_rate, mock_create_adjustment, mock_create_credits
    ):
        """
        Invoice is unpaid and obligation decreases, but remains > 0:
        - partial refund posted: min(|(new - prev) * rate|, outstanding)
        - reason: SUPPLEMENTARY_REPORT_ADJUSTMENT
        - previous CRV status stays OBLIGATION_NOT_MET
        - invoice is NOT voided
        - NO earned credits created
        """
        # Arrange
        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            prev_sum = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('500'),
                credited_emissions=Decimal('0'),
                report_version=self.report_version_1,
            )
            new_sum = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('300'),  # decreased, but still > 0
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

        # Unpaid invoice with ample outstanding so net_after > 0
        # refund = (300 - 500) * 25 = -200 * 25 = -5000
        invoice = baker.make_recipe(
            'compliance.tests.utils.elicensing_invoice',
            is_void=False,
            outstanding_balance=Decimal('20000.00'),
        )
        baker.make_recipe(
            'compliance.tests.utils.compliance_obligation',
            compliance_report_version=prev_crv,
            elicensing_invoice=invoice,
        )

        mock_get_rate.return_value = Decimal('25.00')

        # Act: fixture forces on_commit to run so side-effects are visible in assertions
        result = DecreasedObligationHandler.handle(
            compliance_report=report,
            new_summary=new_sum,
            previous_summary=prev_sum,
            version_count=2,
        )

        # Assert — partial refund up to outstanding (here |refund| < outstanding, so use full |refund|)
        expected_applied = Decimal('-5000.00')
        mock_create_adjustment.assert_called_once_with(
            target_compliance_report_version_id=prev_crv.id,
            adjustment_total=expected_applied,
            supplementary_compliance_report_version_id=result.id,
            reason=ElicensingAdjustment.Reason.SUPPLEMENTARY_REPORT_ADJUSTMENT,
        )

        # No credits when new_excess > 0
        mock_create_credits.assert_not_called()

        # Previous CRV remains NOT_MET
        prev_crv.refresh_from_db()
        assert prev_crv.status == ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET

        # Invoice is not voided
        invoice.refresh_from_db()
        assert invoice.is_void is False

    def test_invoice_unpaid_decrease_to_exactly_zero(self, mock_get_rate, mock_create_adjustment, mock_create_credits):
        """
        Invoice is unpaid and obligation decreases to exactly 0:
        - full refund posted up to outstanding (net zero): |(new - prev) * rate| == outstanding, signed negative
        - reason: SUPPLEMENTARY_REPORT_ADJUSTMENT_TO_VOID_INVOICE
        - previous CRV status flips to OBLIGATION_FULLY_MET
        - invoice IS voided
        - NO earned credits created (no surplus beyond outstanding)
        """
        # Arrange
        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            prev_sum = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('500'),
                credited_emissions=Decimal('0'),
                report_version=self.report_version_1,
            )
            new_sum = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=ZERO_DECIMAL,  # decreased to exactly 0
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

        # Unpaid invoice where |refund| == outstanding: (0 - 500) * 25 = -12500
        invoice = baker.make_recipe(
            'compliance.tests.utils.elicensing_invoice',
            is_void=False,
            outstanding_balance=Decimal('12500.00'),
        )
        baker.make_recipe(
            'compliance.tests.utils.compliance_obligation',
            compliance_report_version=prev_crv,
            elicensing_invoice=invoice,
        )

        mock_get_rate.return_value = Decimal('25.00')

        # Act — fixture forces on_commit callbacks to run immediately
        result = DecreasedObligationHandler.handle(
            compliance_report=report,
            new_summary=new_sum,
            previous_summary=prev_sum,
            version_count=2,
        )

        # Assert — full refund up to outstanding (no surplus → no credits)
        expected_applied = Decimal('-12500.00')
        mock_create_adjustment.assert_called_once_with(
            target_compliance_report_version_id=prev_crv.id,
            adjustment_total=expected_applied,
            supplementary_compliance_report_version_id=result.id,
            reason=ElicensingAdjustment.Reason.SUPPLEMENTARY_REPORT_ADJUSTMENT_TO_VOID_INVOICE,
        )
        mock_create_credits.assert_not_called()

        # Previous CRV becomes FULLY_MET
        prev_crv.refresh_from_db()
        assert prev_crv.status == ComplianceReportVersion.ComplianceStatus.OBLIGATION_FULLY_MET

        # Invoice is voided
        invoice.refresh_from_db()
        assert invoice.is_void is True

    def test_invoice_with_partial_payments_decrease_but_still_above_zero_applies_refund_no_credits_no_void(
        self, mock_get_rate, mock_create_adjustment, mock_create_credits
    ):
        """
        Partial payments exist; obligation decreases but stays > 0:
        - refund applied to outstanding (refund < outstanding)
        - NO credits
        - previous CRV remains NOT_MET (outstanding still > 0 after refund)
        - invoice NOT voided (prior payments exist)
        """
        # Arrange
        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            prev_sum = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('500'),
                credited_emissions=Decimal('0'),
                report_version=self.report_version_1,
            )
            new_sum = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('300'),  # decreased, but still > 0
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

        # Billed = 500 * 25 = 12500
        # Refund = (300 - 500) * 25 = -200 * 25 = -5000
        # Choose outstanding so refund < outstanding → outstanding stays > 0 afterward
        invoice = baker.make_recipe(
            'compliance.tests.utils.elicensing_invoice',
            is_void=False,
            outstanding_balance=Decimal('7000.00'),  # prior payments = 12500 - 7000 = 5500
        )
        baker.make_recipe(
            'compliance.tests.utils.compliance_obligation',
            compliance_report_version=prev_crv,
            elicensing_invoice=invoice,
        )

        mock_get_rate.return_value = Decimal('25.00')

        # Act — on_commit forced to run by fixture
        result = DecreasedObligationHandler.handle(
            compliance_report=report,
            new_summary=new_sum,
            previous_summary=prev_sum,
            version_count=2,
        )

        # Assert — refund up to outstanding (generic reason), no credits, not voided
        mock_create_adjustment.assert_called_once_with(
            target_compliance_report_version_id=prev_crv.id,
            adjustment_total=Decimal('-5000.00'),
            supplementary_compliance_report_version_id=result.id,
            reason=ElicensingAdjustment.Reason.SUPPLEMENTARY_REPORT_ADJUSTMENT,
        )
        mock_create_credits.assert_not_called()

        # Previous CRV remains NOT_MET (net outstanding after = 7000 - 5000 = 2000)
        prev_crv.refresh_from_db()
        assert prev_crv.status == ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET

        # Invoice not voided (prior payments exist)
        invoice.refresh_from_db()
        assert invoice.is_void is False

    def test_invoice_unpaid_decrease_below_zero_creates_credits_and_voids_invoice(
        self, mock_get_rate, mock_create_adjustment, mock_create_credits
    ):
        """
        Invoice is unpaid and obligation decreases below 0:
        - refund magnitude exceeds outstanding; apply up to outstanding (negative adjustment)
        - surplus refund converts to earned credits (tonnes)
        - reason: SUPPLEMENTARY_REPORT_ADJUSTMENT_TO_VOID_INVOICE (no prior payments, invoice fully met)
        - previous CRV status flips to OBLIGATION_FULLY_MET
        - invoice IS voided
        """
        # Arrange
        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            prev_sum = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('500'),
                credited_emissions=Decimal('0'),
                report_version=self.report_version_1,
            )
            new_sum = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('-100'),  # below zero (over-compliance by 100t)
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

        # Refund = (-100 - 500) * 25 = -600 * 25 = -15000
        # Ensure "no previous payments": outstanding == billed (500 * 25 = 12500)
        invoice = baker.make_recipe(
            'compliance.tests.utils.elicensing_invoice',
            is_void=False,
            outstanding_balance=Decimal('12500.00'),
        )
        baker.make_recipe(
            'compliance.tests.utils.compliance_obligation',
            compliance_report_version=prev_crv,
            elicensing_invoice=invoice,
        )

        mock_get_rate.return_value = Decimal('25.00')

        # Act — test fixture forces on_commit callbacks to run immediately
        result = DecreasedObligationHandler.handle(
            compliance_report=report,
            new_summary=new_sum,
            previous_summary=prev_sum,
            version_count=2,
        )

        # Assert — adjustment up to outstanding (negative to reduce invoice)
        expected_applied = Decimal('-12500.00')
        mock_create_adjustment.assert_called_once_with(
            target_compliance_report_version_id=prev_crv.id,
            adjustment_total=expected_applied,
            supplementary_compliance_report_version_id=result.id,
            reason=ElicensingAdjustment.Reason.SUPPLEMENTARY_REPORT_ADJUSTMENT_TO_VOID_INVOICE,
        )

        # Surplus = 15000 - 12500 = 2500 -> 2500/25 = 100t; plus over-compliance 100t => 200t total
        # calls ComplianceEarnedCreditsService.create_earned_credits_record
        # with KWARGS: compliance_report_version=<CRV obj>, amount=int(tonnes)
        mock_create_credits.assert_called_once()
        _, kwargs = mock_create_credits.call_args
        assert kwargs["amount"] == 200
        assert kwargs["compliance_report_version"].id == result.id

        # Previous CRV becomes FULLY_MET
        prev_crv.refresh_from_db()
        assert prev_crv.status == ComplianceReportVersion.ComplianceStatus.OBLIGATION_FULLY_MET

        # Invoice is voided (fully met & no prior payments)
        invoice.refresh_from_db()
        assert invoice.is_void is True

    def test_invoice_with_partial_payments_decrease_below_zero_creates_credits_no_void(
        self, mock_get_rate, mock_create_adjustment, mock_create_credits
    ):
        """
        Partial payments exist; obligation decreases below 0:
        - refund exceeds outstanding; apply up to outstanding (generic reason)
        - surplus refund converts to credits (surplus $/rate + over-compliance tonnes)
        - previous CRV -> FULLY_MET (outstanding becomes 0)
        - invoice NOT voided (prior payments exist)
        """
        # Arrange
        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            prev_sum = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('500'),
                credited_emissions=Decimal('0'),
                report_version=self.report_version_1,
            )
            new_sum = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('-100'),  # below zero (over-compliance by 100t)
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

        # Billed = 500 * 25 = 12500
        # Refund = (-100 - 500) * 25 = -600 * 25 = -15000
        # Partial payments exist: choose outstanding 12000 (previous payments = 500)
        # Apply 12000 to invoice, surplus 3000 → 3000/25 = 120t; over-compliance 100t → total 220t
        invoice = baker.make_recipe(
            'compliance.tests.utils.elicensing_invoice',
            is_void=False,
            outstanding_balance=Decimal('12000.00'),
        )
        baker.make_recipe(
            'compliance.tests.utils.compliance_obligation',
            compliance_report_version=prev_crv,
            elicensing_invoice=invoice,
        )

        mock_get_rate.return_value = Decimal('25.00')

        # Act — on_commit forced to run by fixture
        result = DecreasedObligationHandler.handle(
            compliance_report=report,
            new_summary=new_sum,
            previous_summary=prev_sum,
            version_count=2,
        )

        # Assert — apply up to outstanding (generic reason since prior payments exist)
        mock_create_adjustment.assert_called_once_with(
            target_compliance_report_version_id=prev_crv.id,
            adjustment_total=Decimal('-12000.00'),
            supplementary_compliance_report_version_id=result.id,
            reason=ElicensingAdjustment.Reason.SUPPLEMENTARY_REPORT_ADJUSTMENT,
        )

        # Surplus credits: 3000/25 = 120 + over-compliance 100 = 220
        mock_create_credits.assert_called_once()
        _, kwargs = mock_create_credits.call_args
        assert kwargs["amount"] == 220
        assert kwargs["compliance_report_version"].id == result.id

        # Previous CRV becomes FULLY_MET (outstanding zeroed)
        prev_crv.refresh_from_db()
        assert prev_crv.status == ComplianceReportVersion.ComplianceStatus.OBLIGATION_FULLY_MET

        # Invoice NOT voided (prior payments exist)
        invoice.refresh_from_db()
        assert invoice.is_void is False

    def test_invoice_with_partial_payments_decrease_to_zero_applies_refund_creates_credits_no_void(
        self, mock_get_rate, mock_create_adjustment, mock_create_credits
    ):
        """
        Partial payments exist; obligation decreases to exactly 0:
        - apply refund up to outstanding (generic reason)
        - surplus converts to credits
        - previous CRV -> FULLY_MET
        - invoice NOT voided (previous payments > 0)
        """
        # Arrange
        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            prev_sum = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('500'),
                credited_emissions=Decimal('0'),
                report_version=self.report_version_1,
            )
            new_sum = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('0'),  # exactly zero
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

        # Billed = 500*25 = 12500; outstanding 5000 => previous payments 7500
        invoice = baker.make_recipe(
            'compliance.tests.utils.elicensing_invoice',
            is_void=False,
            outstanding_balance=Decimal('5000.00'),
        )
        baker.make_recipe(
            'compliance.tests.utils.compliance_obligation',
            compliance_report_version=prev_crv,
            elicensing_invoice=invoice,
        )

        mock_get_rate.return_value = Decimal('25.00')

        # Act — on_commit forced to run by fixture
        result = DecreasedObligationHandler.handle(
            compliance_report=report,
            new_summary=new_sum,
            previous_summary=prev_sum,
            version_count=2,
        )

        # Assert — refund up to outstanding, generic reason (not "to void")
        mock_create_adjustment.assert_called_once_with(
            target_compliance_report_version_id=prev_crv.id,
            adjustment_total=Decimal('-5000.00'),
            supplementary_compliance_report_version_id=result.id,
            reason=ElicensingAdjustment.Reason.SUPPLEMENTARY_REPORT_ADJUSTMENT,
        )

        # Surplus = 12500 - 5000 = 7500 -> 7500/25 = 300 t; (no over-compliance)
        mock_create_credits.assert_called_once()
        _, k = mock_create_credits.call_args
        assert k["amount"] == 300
        assert k["compliance_report_version"].id == result.id

        prev_crv.refresh_from_db()
        assert prev_crv.status == ComplianceReportVersion.ComplianceStatus.OBLIGATION_FULLY_MET

        invoice.refresh_from_db()
        assert invoice.is_void is False

    def test_invoice_fully_paid_decrease_but_still_above_zero_all_refund_to_credits_no_adjustment_no_void(
        self, mock_get_rate, mock_create_adjustment, mock_create_credits
    ):
        """
        Invoice is fully paid (outstanding = 0) and obligation decreases but stays > 0:
        - no adjustment to invoice
        - entire refund converts to credits (equal to the tonnage decrease)
        - previous CRV -> FULLY_MET
        - invoice NOT voided (previous payments exist)
        """
        # Arrange
        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            prev_sum = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('500'),
                credited_emissions=Decimal('0'),
                report_version=self.report_version_1,
            )
            new_sum = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('300'),  # decreased, but still > 0
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

        # Fully paid: outstanding = 0 (previous payments equal billed: 500 * 25 = 12500)
        invoice = baker.make_recipe(
            'compliance.tests.utils.elicensing_invoice',
            is_void=False,
            outstanding_balance=Decimal('0.00'),
        )
        baker.make_recipe(
            'compliance.tests.utils.compliance_obligation',
            compliance_report_version=prev_crv,
            elicensing_invoice=invoice,
        )

        mock_get_rate.return_value = Decimal('25.00')  # refund = (300-500)*25 = -5000 -> all to credits

        # Act — on_commit forced to run immediately by fixture
        result = DecreasedObligationHandler.handle(
            compliance_report=report,
            new_summary=new_sum,
            previous_summary=prev_sum,
            version_count=2,
        )

        # Assert — NO adjustment (nothing to apply to invoice)
        mock_create_adjustment.assert_not_called()

        # Entire refund -> credits: tonnage decrease = 500 - 300 = 200 t
        mock_create_credits.assert_called_once()
        _, kwargs = mock_create_credits.call_args
        assert kwargs["amount"] == 200
        assert kwargs["compliance_report_version"].id == result.id

        # Previous CRV becomes FULLY_MET (net outstanding after = 0)
        prev_crv.refresh_from_db()
        assert prev_crv.status == ComplianceReportVersion.ComplianceStatus.OBLIGATION_FULLY_MET

        # Invoice is NOT voided (there were prior payments)
        invoice.refresh_from_db()
        assert invoice.is_void is False

    def test_invoice_fully_paid_decrease_to_zero_creates_credits_no_adjustment_no_void(
        self, mock_get_rate, mock_create_adjustment, mock_create_credits
    ):
        """
        Invoice is fully paid (outstanding 0); obligation decreases to exactly 0:
        - no adjustment to invoice (applied == 0)
        - entire refund becomes credits
        - previous CRV -> FULLY_MET
        - invoice NOT voided (previous payments > 0)
        """
        # Arrange
        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            prev_sum = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('500'),
                credited_emissions=Decimal('0'),
                report_version=self.report_version_1,
            )
            new_sum = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('0'),  # exactly zero
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

        # Fully paid: outstanding 0 (previous payments == billed)
        invoice = baker.make_recipe(
            'compliance.tests.utils.elicensing_invoice',
            is_void=False,
            outstanding_balance=Decimal('0.00'),
        )
        baker.make_recipe(
            'compliance.tests.utils.compliance_obligation',
            compliance_report_version=prev_crv,
            elicensing_invoice=invoice,
        )

        mock_get_rate.return_value = Decimal('25.00')

        # Act — on_commit forced to run by fixture
        result = DecreasedObligationHandler.handle(
            compliance_report=report,
            new_summary=new_sum,
            previous_summary=prev_sum,
            version_count=2,
        )

        # Assert — NO adjustment (nothing to apply to invoice)
        mock_create_adjustment.assert_not_called()

        # Entire refund -> credits: 12500/25 = 500 t
        mock_create_credits.assert_called_once()
        _, k = mock_create_credits.call_args
        assert k["amount"] == 500
        assert k["compliance_report_version"].id == result.id

        prev_crv.refresh_from_db()
        assert prev_crv.status == ComplianceReportVersion.ComplianceStatus.OBLIGATION_FULLY_MET

        invoice.refresh_from_db()
        assert invoice.is_void is False

    def test_invoice_fully_paid_decrease_below_zero_all_refund_to_credits_no_adjustment_no_void(
        self, mock_get_rate, mock_create_adjustment, mock_create_credits
    ):
        """
        Invoice is fully paid (outstanding = 0) and obligation decreases below 0:
        - no adjustment to invoice
        - entire refund converts to credits (plus over-compliance tonnes)
        - previous CRV -> FULLY_MET
        - invoice NOT voided (previous payments exist)
        """
        # Arrange
        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            prev_sum = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('500'),
                credited_emissions=Decimal('0'),
                report_version=self.report_version_1,
            )
            new_sum = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('-100'),  # below zero (over-compliance by 100t)
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

        # Fully paid: outstanding = 0 (previous payments equal billed)
        # Refund = (-100 - 500) * 25 = -600 * 25 = -15000 (all surplus)
        invoice = baker.make_recipe(
            'compliance.tests.utils.elicensing_invoice',
            is_void=False,
            outstanding_balance=Decimal('0.00'),
        )
        baker.make_recipe(
            'compliance.tests.utils.compliance_obligation',
            compliance_report_version=prev_crv,
            elicensing_invoice=invoice,
        )

        mock_get_rate.return_value = Decimal('25.00')

        # Act — on_commit forced to run immediately by your fixture
        result = DecreasedObligationHandler.handle(
            compliance_report=report,
            new_summary=new_sum,
            previous_summary=prev_sum,
            version_count=2,
        )

        # Assert — NO adjustment (outstanding is zero)
        mock_create_adjustment.assert_not_called()

        # Credits:
        #   surplus refund dollars = 15000 -> 15000/25 = 600 t
        #   over-compliance tonnes = 100 t
        #   total credits = 700 t (int in implementation)
        mock_create_credits.assert_called_once()
        _, kwargs = mock_create_credits.call_args
        assert kwargs["amount"] == 700
        assert kwargs["compliance_report_version"].id == result.id

        # Previous CRV becomes FULLY_MET
        prev_crv.refresh_from_db()
        assert prev_crv.status == ComplianceReportVersion.ComplianceStatus.OBLIGATION_FULLY_MET

        # Invoice is NOT voided (there were prior payments)
        invoice.refresh_from_db()
        assert invoice.is_void is False


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
