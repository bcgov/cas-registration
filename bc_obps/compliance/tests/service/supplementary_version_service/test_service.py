from decimal import Decimal
from unittest.mock import MagicMock, patch
import pytest
import common.lib.pgtrigger as pgtrigger
from model_bakery import baker
from compliance.models import ComplianceEarnedCredit, ComplianceReportVersion, ComplianceReportVersionManualHandling
from compliance.service.supplementary_version_service.service import SupplementaryVersionService
from compliance.tests.service.supplementary_version_service.utils import BaseSupplementaryVersionServiceTest

pytestmark = pytest.mark.django_db(transaction=True)

_SVC = "compliance.service.supplementary_version_service.service"
_INC_OBL = "compliance.service.supplementary_version_service.increased_obligation_handler"
_DEC_OBL = "compliance.service.supplementary_version_service.decreased_obligation_handler"
_NO_CHG = "compliance.service.supplementary_version_service.no_change_handler"
_INC_CRD = "compliance.service.supplementary_version_service.increased_credit_handler"
_DEC_CRD = "compliance.service.supplementary_version_service.decreased_credit_handler"
_NEW_CRD = "compliance.service.supplementary_version_service.new_earned_credits_handler"
_MANUAL = "compliance.service.supplementary_version_service.manual_handler"
_SUPERCEDE = "compliance.service.supplementary_version_service.supercede_version_handler"


@pytest.fixture
def mock_increased_handler():
    with patch(f"{_INC_OBL}.IncreasedObligationHandler.handle") as mock:
        yield mock


@pytest.fixture
def mock_decreased_handler():
    with patch(f"{_DEC_OBL}.DecreasedObligationHandler.handle") as mock:
        yield mock


@pytest.fixture
def mock_no_change_handler():
    with patch(f"{_NO_CHG}.NoChangeHandler.handle") as mock:
        yield mock


@pytest.fixture
def mock_increased_credit_handler():
    with patch(f"{_INC_CRD}.IncreasedCreditHandler.handle") as mock:
        yield mock


@pytest.fixture
def mock_decreased_credit_handler():
    with patch(f"{_DEC_CRD}.DecreasedCreditHandler.handle") as mock:
        yield mock


@pytest.fixture
def mock_new_earned_credits_handler():
    with patch(f"{_NEW_CRD}.NewEarnedCreditsHandler.handle") as mock:
        yield mock


@pytest.fixture
def mock_manual_handler():
    with patch(f"{_MANUAL}.ManualHandler.handle") as mock:
        yield mock


@pytest.fixture
def mock_capture_sentry_exception():
    with patch(f"{_SVC}.ExceptionHandler.capture_sentry_exception") as mock:
        yield mock


@pytest.fixture
def mock_logger():
    with patch(f"{_SVC}.logger") as mock:
        yield mock


class TestSupplementaryVersionService(BaseSupplementaryVersionServiceTest):
    def test_handle_manual_handling_success(
        self,
        mock_increased_handler,
        mock_decreased_handler,
        mock_no_change_handler,
        mock_increased_credit_handler,
        mock_decreased_credit_handler,
        mock_manual_handler,
        mock_capture_sentry_exception,
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

        # Base compliance report/versions
        self.compliance_report = baker.make_recipe(
            'compliance.tests.utils.compliance_report',
            report=self.report,
            compliance_period_id=1,
        )
        # Previous CRV for the supplementary chain
        self.compliance_report_version = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=self.compliance_report,
            report_compliance_summary=self.previous_summary,
        )

        # Explicitly create a manual-handling record so that
        # ManualHandler.can_handle(previous_summary) will be true
        baker.make_recipe(
            'compliance.tests.utils.compliance_report_version_manual_handling',
            compliance_report_version=self.compliance_report_version,
            # optional: make the intent explicit
            handling_type=ComplianceReportVersionManualHandling.HandlingType.OBLIGATION,
            context=ComplianceReportVersionManualHandling.Context.OBLIGATION_REFUND_POOL_CASH,
        )

        mock_result = MagicMock(spec=ComplianceReportVersion)
        mock_manual_handler.return_value = mock_result

        # Act
        result = SupplementaryVersionService().handle_supplementary_version(
            self.compliance_report,
            self.report_version_2,
            2,
        )

        # Assert – we should route to ManualHandler only
        mock_manual_handler.assert_called_once_with(
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
        mock_decreased_credit_handler.assert_not_called()
        mock_capture_sentry_exception.assert_not_called()

    def test_handle_increased_obligation_success(
        self,
        mock_increased_handler,
        mock_decreased_handler,
        mock_no_change_handler,
        mock_increased_credit_handler,
        mock_decreased_credit_handler,
        mock_capture_sentry_exception,
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
        mock_capture_sentry_exception.assert_not_called()

    def test_handle_decreased_obligation_success(
        self,
        mock_increased_handler,
        mock_decreased_handler,
        mock_no_change_handler,
        mock_increased_credit_handler,
        mock_decreased_credit_handler,
        mock_capture_sentry_exception,
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
        mock_capture_sentry_exception.assert_not_called()

    @patch('compliance.service.supplementary_version_service.service.ExceptionHandler.capture_sentry_exception')
    @patch(
        'compliance.service.supplementary_version_service.increased_obligation_handler.IncreasedObligationHandler.can_handle'
    )
    @patch(
        'compliance.service.supplementary_version_service.decreased_obligation_handler.DecreasedObligationHandler.can_handle'
    )
    @patch('compliance.service.supplementary_version_service.no_change_handler.NoChangeHandler.can_handle')
    @patch(
        'compliance.service.supplementary_version_service.new_earned_credits_handler.NewEarnedCreditsHandler.can_handle'
    )
    @patch(
        'compliance.service.supplementary_version_service.increased_credit_handler.IncreasedCreditHandler.can_handle'
    )
    @patch(
        'compliance.service.supplementary_version_service.decreased_credit_handler.DecreasedCreditHandler.can_handle'
    )
    @patch(
        'compliance.service.supplementary_version_service.supercede_version_handler.SupercedeVersionHandler.can_handle'
    )
    def test_handle_supplementary_version_no_handler_found(
        self,
        mock_supercede_can_handle,
        mock_decreased_credit_can_handle,
        mock_increased_credit_can_handle,
        mock_new_earned_credits_can_handle,
        mock_no_change_can_handle,
        mock_decreased_obligation_can_handle,
        mock_increased_obligation_can_handle,
        mock_capture_sentry_exception,
        mock_increased_handler,
        mock_decreased_handler,
        mock_no_change_handler,
        mock_increased_credit_handler,
        mock_decreased_credit_handler,
        mock_new_earned_credits_handler,
        mock_logger,
    ):
        # Arrange
        # Mock all handlers' can_handle to return False to test the "no handler found" error case
        mock_supercede_can_handle.return_value = False
        mock_increased_obligation_can_handle.return_value = False
        mock_decreased_obligation_can_handle.return_value = False
        mock_no_change_can_handle.return_value = False
        mock_new_earned_credits_can_handle.return_value = False
        mock_increased_credit_can_handle.return_value = False
        mock_decreased_credit_can_handle.return_value = False

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
        expected_message = f"No handler found for report version {self.report_version_2.id} and compliance report {self.compliance_report.id}"

        # Verify capture_sentry_exception was called with the correct exception and tag
        from unittest.mock import ANY

        mock_capture_sentry_exception.assert_called_once_with(ANY, "no_handler_found")
        # Verify the exception message separately since Exception objects are compared by identity
        exception_arg = mock_capture_sentry_exception.call_args[0][0]
        assert isinstance(exception_arg, Exception)
        assert str(exception_arg) == expected_message
        mock_increased_handler.assert_not_called()
        mock_decreased_handler.assert_not_called()
        mock_no_change_handler.assert_not_called()
        mock_increased_credit_handler.assert_not_called()
        mock_decreased_credit_handler.assert_not_called()
        mock_new_earned_credits_handler.assert_not_called()

    def test_handle_supplementary_version_no_previous_version(
        self,
        mock_increased_handler,
        mock_decreased_handler,
        mock_no_change_handler,
        mock_increased_credit_handler,
        mock_decreased_credit_handler,
        mock_new_earned_credits_handler,
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
        mock_new_earned_credits_handler.assert_not_called()

    # THE FOLLOWING TWO TESTS WILL NEED REWRITING AFTER HANDLING SCENARIOS WHERE CREDITS HAVE BEEN ISSUED/REQUESTED
