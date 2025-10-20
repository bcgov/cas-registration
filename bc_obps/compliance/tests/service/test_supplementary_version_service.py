from decimal import Decimal
from compliance.models import (
    ComplianceReportVersion,
    ComplianceEarnedCredit,
)
from reporting.models import ReportVersion
from compliance.service.supplementary_version_service import (
    NoChangeHandler,
    SupplementaryVersionService,
    IncreasedObligationHandler,
    DecreasedObligationHandler,
    IncreasedCreditHandler,
    DecreasedCreditHandler,
    SupercedeVersionHandler,
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
FIND_NEWEST_UNPAID_ANCHOR_PATH = (
    f"{SUPPLEMENTARY_VERSION_SERVICE_PATH}.DecreasedObligationHandler._find_newest_unpaid_anchor_along_chain"
)
NO_OBLIGATION_HANDLER_PATH = f"{SUPPLEMENTARY_VERSION_SERVICE_PATH}.NoChangeHandler.handle"
SUPERCEDED_VERSION_HANDLER_PATH = f"{SUPPLEMENTARY_VERSION_SERVICE_PATH}.SupercedeVersionHandler.can_handle"
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
def mock_superceded_can_handle():
    with patch(SUPERCEDED_VERSION_HANDLER_PATH) as mock:
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


@pytest.fixture
def mock_find_newest_unpaid_anchor():
    with patch(FIND_NEWEST_UNPAID_ANCHOR_PATH) as mock:
        yield mock


@pytest.mark.django_db
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
        self.compliance_report_version = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=self.compliance_report,
            report_compliance_summary=self.previous_summary,
        )
        self.compliance_obligation = baker.make_recipe(
            'compliance.tests.utils.compliance_obligation', compliance_report_version=self.compliance_report_version
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
        self.compliance_report_version = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=self.compliance_report,
            report_compliance_summary=self.previous_summary,
        )
        self.compliance_obligation = baker.make_recipe(
            'compliance.tests.utils.compliance_obligation', compliance_report_version=self.compliance_report_version
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
                excess_emissions=Decimal('0'),
                credited_emissions=Decimal('10'),
                report_version=self.report_version_1,
            )
        self.new_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('0'),
            credited_emissions=Decimal('5'),
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

    # THE FOLLOWING TWO TESTS WILL NEED REWRITING AFTER HANDLING SCENARIOS WHERE CREDITS HAVE BEEN ISSUED/REQUESTED


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
        self.previous_compliance_obligation = baker.make_recipe(
            'compliance.tests.utils.compliance_obligation',
            compliance_report_version=self.previous_compliance_report_version,
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
    @pytest.mark.parametrize(
        "issuance_status",
        [
            ComplianceEarnedCredit.IssuanceStatus.APPROVED,
            ComplianceEarnedCredit.IssuanceStatus.DECLINED,
            ComplianceEarnedCredit.IssuanceStatus.ISSUANCE_REQUESTED,
            ComplianceEarnedCredit.IssuanceStatus.CHANGES_REQUIRED,
            ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED,
        ],
    )
    def test_can_handle_all_statuses(self, issuance_status):
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
            issuance_status=issuance_status,
            bccr_trading_name='Test Trading Name',
            bccr_holding_account_id='123',
        )

        # Act
        result = IncreasedCreditHandler.can_handle(self.new_summary, self.previous_summary)

        # Assert
        assert result is True

    def test_can_handle_multiple_supplementary_reports(self):
        # Arrange
        # first supp report
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

        self.report_version_2.status = ReportVersion.ReportVersionStatus.Submitted
        self.report_version_2.save()

        # additional supp report
        self.report_version_3 = baker.make_recipe('reporting.tests.utils.report_version', report=self.report)
        summary_3 = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=0,
            credited_emissions=Decimal('600'),
            report_version=self.report_version_3,
        )

        # Act
        result = IncreasedCreditHandler.can_handle(summary_3, self.previous_summary)

        # Assert
        assert result is True

    @pytest.mark.parametrize(
        "issuance_status",
        [
            ComplianceEarnedCredit.IssuanceStatus.APPROVED,
            ComplianceEarnedCredit.IssuanceStatus.DECLINED,
            ComplianceEarnedCredit.IssuanceStatus.ISSUANCE_REQUESTED,
            ComplianceEarnedCredit.IssuanceStatus.CHANGES_REQUIRED,
            ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED,
        ],
    )
    def test_calls_correct_handler(
        self,
        mock_increased_handler,
        mock_decreased_handler,
        mock_no_change_handler,
        mock_increased_credit_handler,
        mock_decreased_credit_handler,
        mock_superceded_can_handle,
        issuance_status,
    ):
        mock_superceded_can_handle.return_value = (
            False  # otherwise, the CREDITS_NOT_ISSUED status will be caught by the superceded handler
        )
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
            issuance_status=issuance_status,
            bccr_trading_name='Test Trading Name',
            bccr_holding_account_id='1234',
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

    def test_handle_increased_credits_success_when_credits_approved(self):
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
            credited_emissions=Decimal('800'),
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
            earned_credits_amount=Decimal('600'),
            issuance_status=ComplianceEarnedCredit.IssuanceStatus.APPROVED,
            bccr_trading_name='Test Trading Name',
            bccr_holding_account_id='1234',
        )
        # Act
        result = IncreasedCreditHandler.handle(self.compliance_report, self.new_summary, self.previous_summary, 2)

        # Assert result
        assert result.status == ComplianceReportVersion.ComplianceStatus.EARNED_CREDITS
        assert result.report_compliance_summary_id == self.new_summary.id
        assert result.compliance_report_id == self.compliance_report.id
        assert result.credited_emissions_delta_from_previous == Decimal('200')
        assert result.is_supplementary is True
        assert result.previous_version == self.previous_compliance_report_version
        # Assert the original earned credits report is untouched and we have a new one
        earned_credit.refresh_from_db()
        assert earned_credit.issuance_status == ComplianceEarnedCredit.IssuanceStatus.APPROVED
        assert earned_credit.earned_credits_amount == Decimal('600')
        assert ComplianceEarnedCredit.objects.last().earned_credits_amount == Decimal('200')

    @pytest.mark.parametrize(
        "issuance_status",
        [
            ComplianceEarnedCredit.IssuanceStatus.DECLINED,
            ComplianceEarnedCredit.IssuanceStatus.ISSUANCE_REQUESTED,
            ComplianceEarnedCredit.IssuanceStatus.CHANGES_REQUIRED,
        ],
    )
    def test_handle_increased_credits_success_when_credits_not_approved(self, issuance_status):
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
            credited_emissions=Decimal('800'),
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
            earned_credits_amount=Decimal('600'),
            issuance_status=issuance_status,
            bccr_trading_name='Test Trading Name',
            bccr_holding_account_id='1234',
        )
        # Act
        result = IncreasedCreditHandler.handle(self.compliance_report, self.new_summary, self.previous_summary, 2)

        # Assert result
        assert result.status == ComplianceReportVersion.ComplianceStatus.EARNED_CREDITS
        assert result.report_compliance_summary_id == self.new_summary.id
        assert result.compliance_report_id == self.compliance_report.id
        assert result.credited_emissions_delta_from_previous == Decimal('200')
        assert result.is_supplementary is True
        assert result.previous_version == self.previous_compliance_report_version
        # Assert the original earned credits report is untouched and we have a new one
        earned_credit.refresh_from_db()
        assert earned_credit.issuance_status == ComplianceEarnedCredit.IssuanceStatus.DECLINED
        assert earned_credit.earned_credits_amount == Decimal('600')
        assert ComplianceEarnedCredit.objects.last().earned_credits_amount == Decimal('800')

    def test_handle_increased_credits_success_when_credits_not_requested(self):
        # Arrange
        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            self.previous_summary = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=0,
                credited_emissions=Decimal('400'),
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
            earned_credits_amount=400,
            issuance_status=ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED,
            bccr_trading_name='Test Trading Name',
            bccr_holding_account_id='123',
        )
        # Act
        new_compliance_version = IncreasedCreditHandler.handle(
            self.original_report_version.compliance_report, self.new_summary, self.previous_summary, 2
        )
        original_credit_record = ComplianceEarnedCredit.objects.get(
            compliance_report_version=self.original_report_version
        )

        # Assert
        assert new_compliance_version.status == ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS
        assert new_compliance_version.credited_emissions_delta_from_previous == Decimal("100")
        assert new_compliance_version.report_compliance_summary_id == self.new_summary.id
        assert new_compliance_version.is_supplementary is True
        assert new_compliance_version.previous_version == self.original_report_version

        # assert that the original record was updated and nothing new was created
        assert ComplianceEarnedCredit.objects.count() == 1
        assert original_credit_record.earned_credits_amount == Decimal('500')
        assert original_credit_record.issuance_status == ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED


class TestDecreasedCreditHandler(BaseSupplementaryVersionServiceTest):
    @pytest.mark.parametrize(
        "issuance_status",
        [
            ComplianceEarnedCredit.IssuanceStatus.DECLINED,
            ComplianceEarnedCredit.IssuanceStatus.ISSUANCE_REQUESTED,
            ComplianceEarnedCredit.IssuanceStatus.CHANGES_REQUIRED,
        ],
    )
    def test_can_handle_decreased_credits_no_previous_approval(self, issuance_status):
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
            issuance_status=issuance_status,
            bccr_trading_name='Test Trading Name',
            bccr_holding_account_id='123',
        )

        # Act
        result = DecreasedCreditHandler.can_handle(self.new_summary, self.previous_summary)

        # Assert
        assert result is True

    def test_cannot_handle_decreased_credits_already_approved(self):
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
            issuance_status=ComplianceEarnedCredit.IssuanceStatus.APPROVED,
            bccr_trading_name='Test Trading Name',
            bccr_holding_account_id='123',
        )

        # Act
        result = DecreasedCreditHandler.can_handle(self.new_summary, self.previous_summary)

        # Assert
        assert result is False

    @pytest.mark.parametrize(
        "issuance_status",
        [
            ComplianceEarnedCredit.IssuanceStatus.DECLINED,
            ComplianceEarnedCredit.IssuanceStatus.ISSUANCE_REQUESTED,
            ComplianceEarnedCredit.IssuanceStatus.CHANGES_REQUIRED,
        ],
    )
    @patch('compliance.service.supplementary_version_service.DecreasedCreditHandler.handle')
    @patch('compliance.service.supplementary_version_service.IncreasedCreditHandler.handle')
    @patch('compliance.service.supplementary_version_service.NoChangeHandler.handle')
    @patch('compliance.service.supplementary_version_service.DecreasedObligationHandler.handle')
    @patch('compliance.service.supplementary_version_service.IncreasedObligationHandler.handle')
    def test_correctly_calls_decreased_credit_handler(
        self,
        mock_increased_handler,
        mock_decreased_handler,
        mock_no_change_handler,
        mock_increased_credit_handler,
        mock_decreased_credit_handler,
        issuance_status,
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
            issuance_status=issuance_status,
            bccr_trading_name='Test Trading Name',
            bccr_holding_account_id='123',
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

    @pytest.mark.parametrize(
        "issuance_status",
        [
            ComplianceEarnedCredit.IssuanceStatus.DECLINED,
            ComplianceEarnedCredit.IssuanceStatus.ISSUANCE_REQUESTED,
            ComplianceEarnedCredit.IssuanceStatus.CHANGES_REQUIRED,
        ],
    )
    def test_handle_decreased_credits_success(self, issuance_status):
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
            issuance_status=issuance_status,
            bccr_trading_name='Test Trading Name',
            bccr_holding_account_id='123',
        )
        # Act
        new_compliance_version = DecreasedCreditHandler.handle(
            self.original_report_version.compliance_report, self.new_summary, self.previous_summary, 2
        )
        original_credit_record = ComplianceEarnedCredit.objects.get(
            compliance_report_version=self.original_report_version
        )
        new_credit_record = ComplianceEarnedCredit.objects.get(compliance_report_version=new_compliance_version)

        # Assert
        assert new_compliance_version.status == ComplianceReportVersion.ComplianceStatus.EARNED_CREDITS
        assert new_compliance_version.credited_emissions_delta_from_previous == Decimal("-300")
        assert new_compliance_version.report_compliance_summary_id == self.new_summary.id
        assert new_compliance_version.is_supplementary is True
        assert new_compliance_version.previous_version == self.original_report_version
        assert original_credit_record.earned_credits_amount == Decimal('800')

        assert new_credit_record.earned_credits_amount == Decimal('500')
        assert new_credit_record.issuance_status == ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED
        assert original_credit_record.issuance_status == ComplianceEarnedCredit.IssuanceStatus.DECLINED


class TestSupercededHandler(BaseSupplementaryVersionServiceTest):
    def test_can_handle_superceded_credits(self):
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
            status=ComplianceReportVersion.ComplianceStatus.EARNED_CREDITS,
        )
        baker.make_recipe(
            'compliance.tests.utils.compliance_earned_credit',
            compliance_report_version=self.original_report_version,
            earned_credits_amount=500,
            issuance_status=ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED,
        )

        # Act
        result = SupercedeVersionHandler.can_handle(self.new_summary, self.previous_summary)

        # Assert
        assert result is True

    def test_does_not_handle_issued_requested_credits(self):
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
            status=ComplianceReportVersion.ComplianceStatus.EARNED_CREDITS,
        )
        baker.make_recipe(
            'compliance.tests.utils.compliance_earned_credit',
            compliance_report_version=self.original_report_version,
            earned_credits_amount=500,
            bccr_trading_name='test',
            bccr_holding_account_id='1234',
            issuance_status=ComplianceEarnedCredit.IssuanceStatus.ISSUANCE_REQUESTED,
        )

        # Act
        result = SupercedeVersionHandler.can_handle(self.new_summary, self.previous_summary)

        # Assert
        assert result is False

    def test_can_handle_superceded_obligation(self):
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
                excess_emissions=Decimal('500'),
                credited_emissions=0,
                report_version=self.report_version_2,
            )
        self.compliance_report = baker.make_recipe(
            'compliance.tests.utils.compliance_report', report=self.report, compliance_period_id=1
        )
        self.original_report_version = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            report_compliance_summary=self.previous_summary,
            is_supplementary=False,
            status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_PENDING_INVOICE_CREATION,
        )
        baker.make_recipe(
            'compliance.tests.utils.compliance_obligation',
            compliance_report_version=self.original_report_version,
        )

        # Act
        result = SupercedeVersionHandler.can_handle(self.new_summary, self.previous_summary)

        # Assert
        assert result is True

    def test_does_not_handle_obligations_with_invoices(self):
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
                excess_emissions=Decimal('500'),
                credited_emissions=0,
                report_version=self.report_version_2,
            )
        self.compliance_report = baker.make_recipe(
            'compliance.tests.utils.compliance_report', report=self.report, compliance_period_id=1
        )
        self.original_report_version = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            report_compliance_summary=self.previous_summary,
            is_supplementary=False,
            status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET,
        )
        inv = baker.make_recipe(
            'compliance.tests.utils.elicensing_invoice',
        )
        baker.make_recipe(
            'compliance.tests.utils.compliance_obligation',
            compliance_report_version=self.original_report_version,
            elicensing_invoice=inv,
        )

        # Act
        result = SupercedeVersionHandler.can_handle(self.new_summary, self.previous_summary)

        # Assert
        assert result is False

    def test_does_not_handle_unclean_history(self):
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
            'reporting.tests.utils.report_version',
            report=report,
            status=ReportVersion.ReportVersionStatus.Submitted,
        )
        report_version_2 = baker.make_recipe(
            'reporting.tests.utils.report_version', report=report, status=ReportVersion.ReportVersionStatus.Submitted
        )
        report_version_3 = baker.make_recipe('reporting.tests.utils.report_version', report=report)

        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            initial_summary = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('600'),
                credited_emissions=0,
                report_version=report_version_1,
            )
            second_summary = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('500'),
                credited_emissions=0,
                report_version=report_version_2,
            )
            third_summary = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('400'),
                credited_emissions=0,
                report_version=report_version_3,
            )
        compliance_report = baker.make_recipe(
            'compliance.tests.utils.compliance_report', report=report, compliance_period_id=1
        )
        initial_compliance_report_version = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            report_compliance_summary=initial_summary,
            compliance_report=compliance_report,
            is_supplementary=False,
            status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_FULLY_MET,
        )
        second_compliance_report_version = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            report_compliance_summary=second_summary,
            compliance_report=compliance_report,
            is_supplementary=True,
            status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_PENDING_INVOICE_CREATION,
        )
        inv = baker.make_recipe(
            'compliance.tests.utils.elicensing_invoice',
        )
        baker.make_recipe(
            'compliance.tests.utils.compliance_obligation',
            compliance_report_version=initial_compliance_report_version,
            elicensing_invoice=inv,
        )
        baker.make_recipe(
            'compliance.tests.utils.compliance_obligation',
            compliance_report_version=second_compliance_report_version,
        )

        # Act
        result = SupercedeVersionHandler.can_handle(third_summary, second_summary)

        # Assert
        # Should return false because the first compliance_report_version was not superceded & the history is therefore not clean
        assert result is False

    def test_handle_supercede_credits_success(self):
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
            status=ComplianceReportVersion.ComplianceStatus.EARNED_CREDITS,
        )
        baker.make_recipe(
            'compliance.tests.utils.compliance_earned_credit',
            compliance_report_version=self.original_report_version,
            earned_credits_amount=800,
            issuance_status=ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED,
        )
        # Act
        new_compliance_version = SupercedeVersionHandler.handle(
            self.original_report_version.compliance_report, self.new_summary, self.previous_summary, 2
        )
        credit_record = ComplianceEarnedCredit.objects.get(compliance_report_version=new_compliance_version)
        self.original_report_version.refresh_from_db()

        # Assert
        assert new_compliance_version.status == ComplianceReportVersion.ComplianceStatus.EARNED_CREDITS
        assert self.original_report_version.status == ComplianceReportVersion.ComplianceStatus.SUPERCEDED
        assert new_compliance_version.report_compliance_summary_id == self.new_summary.id
        assert new_compliance_version.is_supplementary is True
        assert new_compliance_version.previous_version == self.original_report_version
        assert credit_record.earned_credits_amount == Decimal('500')
        assert credit_record.issuance_status == ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED

    def test_handle_supercede_obligation_success(self):
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
        self.original_report_version = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            report_compliance_summary=self.previous_summary,
            is_supplementary=False,
            status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_PENDING_INVOICE_CREATION,
        )
        baker.make_recipe(
            'compliance.tests.utils.compliance_obligation',
            compliance_report_version=self.original_report_version,
        )
        # Act
        new_compliance_version = SupercedeVersionHandler.handle(
            self.original_report_version.compliance_report, self.new_summary, self.previous_summary, 2
        )
        self.original_report_version.refresh_from_db()
        new_compliance_version.refresh_from_db()

        # Assert
        assert (
            new_compliance_version.status
            == ComplianceReportVersion.ComplianceStatus.OBLIGATION_PENDING_INVOICE_CREATION
        )
        assert self.original_report_version.status == ComplianceReportVersion.ComplianceStatus.SUPERCEDED
        assert new_compliance_version.report_compliance_summary_id == self.new_summary.id
        assert new_compliance_version.is_supplementary is True
        assert new_compliance_version.previous_version == self.original_report_version
