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

# Base
SUPPLEMENTARY_VERSION_SERVICE_PATH = "compliance.service.supplementary_version_service"


def svc(suffix: str) -> str:
    """Join a suffix onto the supplementary_version_service base."""
    return f"{SUPPLEMENTARY_VERSION_SERVICE_PATH}.{suffix}"


# Local targets
LOGGER_PATH = svc("logger")
INCREASED_CREDIT_HANDLER_PATH = svc("IncreasedCreditHandler.handle")
DECREASED_CREDIT_HANDLER_PATH = svc("DecreasedCreditHandler.handle")
INCREASED_OBLIGATION_HANDLER_PATH = svc("IncreasedObligationHandler.handle")
NO_OBLIGATION_HANDLER_PATH = svc("NoChangeHandler.handle")
DECREASED_OBLIGATION_HANDLER_PATH = svc("DecreasedObligationHandler.handle")

# Sub-base for DecreasedObligationHandler
DEC_OBL = svc("DecreasedObligationHandler")
FIND_NEWEST_UNPAID_ANCHOR_PATH = f"{DEC_OBL}._find_newest_unpaid_anchor_along_chain"
SUPERCEDED_VERSION_HANDLER_PATH = svc("SupercedeVersionHandler.can_handle")
HANDLE_OBLIGATION_INTEGRATION_PATH = svc("ElicensingObligationService.handle_obligation_integration")
CREATE_COMPLIANCE_OBLIGATION_PATH = svc("ComplianceObligationService.create_compliance_obligation")
COLLECT_UNPAID_PATH = f"{DEC_OBL}._collect_unpaid_obligations_for_crv_chain_newest_first"
VOID_PATH = f"{DEC_OBL}._void_unpaid_invoices"
MARK_FULLY_MET_PATH = f"{DEC_OBL}._mark_previous_version_fully_met"
SUM_ALREADY_APPLIED_PATH = f"{DEC_OBL}._sum_already_applied_supplementary_adjustments_since_anchor"

ON_COMMIT_PATH = "django.db.transaction.on_commit"
ZERO_DECIMAL = Decimal("0")

# Cross-service targets
CREATE_EARNED_CREDIT_PATH = (
    "compliance.service.earned_credits_service." "ComplianceEarnedCreditsService.create_earned_credits_record"
)
CREATE_ADJUSTMENT_PATH = (
    "compliance.service.compliance_adjustment_service."
    "ComplianceAdjustmentService.create_adjustment_for_target_version"
)
GET_RATE_PATH = "compliance.service.compliance_charge_rate_service." "ComplianceChargeRateService.get_rate_for_year"
ELICENSING_OBL_BASE = "compliance.service.elicensing.elicensing_obligation_service." "ElicensingObligationService"
IS_INVOICE_DATE_REACHED_PATH = f"{ELICENSING_OBL_BASE}._is_invoice_generation_date_reached"


@pytest.fixture
def before_invoice_date():
    with patch(IS_INVOICE_DATE_REACHED_PATH, return_value=False):
        yield


@pytest.fixture
def after_invoice_date():
    with patch(IS_INVOICE_DATE_REACHED_PATH, return_value=True):
        yield


@pytest.fixture
def mock_sum_already_applied():
    with patch(SUM_ALREADY_APPLIED_PATH) as mock:
        yield mock


@pytest.fixture
def mock_collect_unpaid():
    with patch(COLLECT_UNPAID_PATH) as mock:
        yield mock


@pytest.fixture
def mock_void_invoices():
    with patch(VOID_PATH) as mock:
        yield mock


@pytest.fixture
def mock_mark_fully_met():
    with patch(MARK_FULLY_MET_PATH) as mock:
        yield mock


@pytest.fixture
def run_on_commit_immediately():
    # Ensures post-commit side-effects run during the test
    with patch(ON_COMMIT_PATH, side_effect=lambda fn: fn()):
        yield


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
    """
    Unit tests for DecreasedObligationHandler.

    Grouped by purpose:
      - can_handle_* : Eligibility logic (whether the handler should run)
      - handle_* : Behavioral logic (effects on invoices, refunds, credits)
    """

    # -------------------------------------------------------------------
    # can_handle tests
    # -------------------------------------------------------------------

    def test_can_handle__when_excess_emissions_decrease__returns_true(self):
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

    def test_can_handle__when_excess_emissions_drop_to_zero__returns_true(self):
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

    def test_can_handle__when_excess_emissions_remain_zero_returns__false(self):
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

    # -------------------------------------------------------------------
    # handle tests
    # -------------------------------------------------------------------

    # handle no invoice
    def test_handle__no_unpaid_invoices__credit(
        self,
        mock_find_newest_unpaid_anchor,
        mock_create_credits,
        mock_get_rate,
        run_on_commit_immediately,
    ):
        """
        Test that when excess emissions decrease and no unpaid invoices exist,
        the full refund amount is converted to earned credits.
        """
        # Arrange
        mock_find_newest_unpaid_anchor.return_value = None  # no unpaid invoices → convert refund to credits
        mock_get_rate.return_value = Decimal("80.00")  # $80/t

        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            previous_summary = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('500.0000'),
                credited_emissions=Decimal('0'),
                report_version=self.report_version_1,
            )
        new_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('100.0000'),  # decreased by 400 t
            credited_emissions=Decimal('0'),
            report_version=self.report_version_2,
        )

        compliance_report = baker.make_recipe(
            'compliance.tests.utils.compliance_report',
            report=self.report,
            compliance_period_id=1,
        )

        # Ensure the previous CRV exists/links correctly
        previous_crv = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=compliance_report,
            report_compliance_summary=previous_summary,
        )

        # Act (on_commit side-effects run immediately via fixture)
        result = DecreasedObligationHandler.handle(
            compliance_report=compliance_report,
            new_summary=new_summary,
            previous_summary=previous_summary,
            version_count=2,
        )

        # Assert
        assert isinstance(result, ComplianceReportVersion)
        assert result.compliance_report_id == compliance_report.id
        assert result.report_compliance_summary_id == new_summary.id
        assert result.is_supplementary is True
        assert result.previous_version_id == previous_crv.id
        assert result.excess_emissions_delta_from_previous == Decimal('-400.0000')

        # 400 t @ $80/t => $32,000 refund → 400 t credits
        assert mock_create_credits.call_count == 1
        _, kwargs = mock_create_credits.call_args
        assert kwargs["compliance_report_version"].id == result.id
        assert kwargs["amount"] == 400

        refreshed = ComplianceReportVersion.objects.get(id=result.id)
        assert refreshed.status == ComplianceReportVersion.ComplianceStatus.EARNED_CREDITS

    # handle one invoice\no payment
    def test_handle__partial_refund_invoice_no_payment__adjustment_not_met_no_void_no_credit(
        self,
        mock_find_newest_unpaid_anchor,
        mock_get_rate,
        mock_create_adjustment,
        mock_create_credits,
        mock_collect_unpaid,
        mock_void_invoices,
        mock_mark_fully_met,
        run_on_commit_immediately,
    ):
        """
        When the decreased-obligation refund is smaller than the invoice outstanding:
        - Apply a negative adjustment equal to the refund (partial allocation).
        - Do NOT mark the previous CRV as FULLY_MET and do NOT void the invoice.
        - Do NOT create earned credits (since not all invoices are cleared).
        """
        # Arrange
        mock_get_rate.return_value = Decimal("80.00")  # $80/t

        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            prev_summary = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('800.0000'),
                credited_emissions=Decimal('0'),
                report_version=self.report_version_1,
            )
        new_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('700.0000'),  # ↓ 100 t
            credited_emissions=Decimal('0'),
            report_version=self.report_version_2,
        )

        compliance_report = baker.make_recipe(
            'compliance.tests.utils.compliance_report',
            report=self.report,
            compliance_period_id=1,
        )

        # Anchor is the previous CRV in chain
        prev_crv = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=compliance_report,
            report_compliance_summary=prev_summary,
        )
        mock_find_newest_unpaid_anchor.return_value = prev_crv

        # One unpaid invoice: $12,000 outstanding, $0 paid
        mock_collect_unpaid.return_value = [
            {
                "version_id": prev_crv.id,
                "invoice_id": 9999,
                "outstanding": Decimal("12000.00"),
                "paid": Decimal("0.00"),
                "prev_excess_emissions": Decimal("800.0000"),
            }
        ]

        # Act (post-commit executes inline)
        result = DecreasedObligationHandler.handle(
            compliance_report=compliance_report,
            new_summary=new_summary,
            previous_summary=prev_summary,
            version_count=2,
        )

        # Assert: new supplementary CRV created/linked
        assert isinstance(result, ComplianceReportVersion)
        assert result.previous_version_id == prev_crv.id
        assert result.excess_emissions_delta_from_previous == Decimal("-100.0000")

        # Refund = 100 * 80 = $8,000 → apply to $12,000 outstanding => NOT fully met
        mock_create_adjustment.assert_called_once()
        _, adj_kwargs = mock_create_adjustment.call_args
        assert adj_kwargs["target_compliance_report_version_id"] == prev_crv.id
        assert adj_kwargs["supplementary_compliance_report_version_id"] == result.id
        assert adj_kwargs["adjustment_total"] == Decimal("-8000.00")

        # Not fully met → no mark/void and no credits
        mock_mark_fully_met.assert_not_called()
        mock_void_invoices.assert_not_called()
        mock_create_credits.assert_not_called()

        # New CRV remains at placeholder status (no earned credits created)
        refreshed = ComplianceReportVersion.objects.get(id=result.id)
        assert refreshed.status == ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS

    def test_handle__full_refund_invoice_no_payment__adjustment_fully_met_void_no_credit(
        self,
        mock_find_newest_unpaid_anchor,
        mock_get_rate,
        mock_create_adjustment,
        mock_create_credits,
        mock_collect_unpaid,
        mock_void_invoices,
        mock_mark_fully_met,
        run_on_commit_immediately,
    ):
        """
        When the decreased-obligation refund exactly equals the invoice outstanding:
        - Apply a negative adjustment equal to the full outstanding.
        - Mark the previous CRV as FULLY_MET and void the invoice (no cash payments).
        - Do NOT create any earned credits (no remainder, no over-compliance, no credited_emissions).
        """
        # Arrange
        mock_get_rate.return_value = Decimal("80.00")  # $80/t

        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            prev_summary = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('500.0000'),
                credited_emissions=Decimal('0'),
                report_version=self.report_version_1,
            )
        new_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('300.0000'),  # ↓ 200 t → refund $16,000
            credited_emissions=Decimal('0'),
            report_version=self.report_version_2,
        )

        compliance_report = baker.make_recipe(
            'compliance.tests.utils.compliance_report',
            report=self.report,
            compliance_period_id=1,
        )

        prev_crv = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=compliance_report,
            report_compliance_summary=prev_summary,
        )

        mock_find_newest_unpaid_anchor.return_value = prev_crv
        # Outstanding EXACTLY equals refund (200 * $80 = $16,000)
        mock_collect_unpaid.return_value = [
            {
                "version_id": prev_crv.id,
                "invoice_id": 12345,
                "outstanding": Decimal("16000.00"),
                "paid": Decimal("0.00"),
                "prev_excess_emissions": Decimal("500.0000"),
            }
        ]

        # Act
        result = DecreasedObligationHandler.handle(
            compliance_report=compliance_report,
            new_summary=new_summary,
            previous_summary=prev_summary,
            version_count=2,
        )

        # Assert: new supplementary CRV created/linked
        assert isinstance(result, ComplianceReportVersion)
        assert result.previous_version_id == prev_crv.id
        assert result.excess_emissions_delta_from_previous == Decimal("-200.0000")

        # Refund = $16,000 → apply full amount to invoice (negative adjustment)
        mock_create_adjustment.assert_called_once()
        _, adj_kwargs = mock_create_adjustment.call_args
        assert adj_kwargs["target_compliance_report_version_id"] == prev_crv.id
        assert adj_kwargs["supplementary_compliance_report_version_id"] == result.id
        assert adj_kwargs["adjustment_total"] == Decimal("-16000.00")

        # Fully met, no cash → mark & void
        mock_mark_fully_met.assert_called_once_with(prev_crv.id)
        mock_void_invoices.assert_called_once_with(prev_crv.id)

        # No remainder, no over-compliance, no credited_emissions → NO credits created
        mock_create_credits.assert_not_called()

        # New CRV stays in placeholder status (since no credits were created)
        refreshed = ComplianceReportVersion.objects.get(id=result.id)
        assert refreshed.status == ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS

    def test_handle__over_refund_invoice_no_payment__adjustment_fully_met_void_credit(
        self,
        mock_find_newest_unpaid_anchor,
        mock_get_rate,
        mock_create_adjustment,
        mock_create_credits,
        mock_collect_unpaid,
        mock_void_invoices,
        mock_mark_fully_met,
        run_on_commit_immediately,
    ):
        """
        When the decreased-obligation refund exceeds the invoice outstanding:
        - Apply a negative adjustment to fully meet the invoice.
        - Mark the previous CRV as FULLY_MET and void the invoice (no cash payments).
        - Convert any remaining refund dollars to earned credits on the NEW CRV.
        """

        # Arrange
        mock_get_rate.return_value = Decimal("80.00")  # $80/t

        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            prev_summary = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('500.0000'),
                credited_emissions=Decimal('0'),
                report_version=self.report_version_1,
            )
        new_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('300.0000'),  # ↓ 200 t
            credited_emissions=Decimal('0'),
            report_version=self.report_version_2,
        )

        compliance_report = baker.make_recipe(
            'compliance.tests.utils.compliance_report',
            report=self.report,
            compliance_period_id=1,
        )

        prev_crv = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=compliance_report,
            report_compliance_summary=prev_summary,
        )

        mock_find_newest_unpaid_anchor.return_value = prev_crv
        mock_collect_unpaid.return_value = [
            {
                "version_id": prev_crv.id,
                "invoice_id": 12345,
                "outstanding": Decimal("12000.00"),
                "paid": Decimal("0.00"),
                "prev_excess_emissions": Decimal("500.0000"),
            }
        ]

        # Act
        result = DecreasedObligationHandler.handle(
            compliance_report=compliance_report,
            new_summary=new_summary,
            previous_summary=prev_summary,
            version_count=2,
        )

        # Assert: new supplementary CRV created/linked
        assert isinstance(result, ComplianceReportVersion)
        assert result.previous_version_id == prev_crv.id
        assert result.excess_emissions_delta_from_previous == Decimal("-200.0000")

        # Refund = 200 * 80 = $16,000
        # Apply $12,000 (negative adjustment), fully met, no cash → void; remainder $4,000 ⇒ 50 t credits
        mock_create_adjustment.assert_called_once()
        _, adj_kwargs = mock_create_adjustment.call_args
        assert adj_kwargs["target_compliance_report_version_id"] == prev_crv.id
        assert adj_kwargs["supplementary_compliance_report_version_id"] == result.id
        assert adj_kwargs["adjustment_total"] == Decimal("-12000.00")

        mock_mark_fully_met.assert_called_once_with(prev_crv.id)
        mock_void_invoices.assert_called_once_with(prev_crv.id)

        # 4,000 / 80 = 50 t credits on NEW CRV
        assert mock_create_credits.call_count == 1
        _, credit_kwargs = mock_create_credits.call_args
        assert credit_kwargs["compliance_report_version"].id == result.id
        assert credit_kwargs["amount"] == 50

        refreshed = ComplianceReportVersion.objects.get(id=result.id)
        assert refreshed.status == ComplianceReportVersion.ComplianceStatus.EARNED_CREDITS

    # handle one invoice\payment
    def test_handle__partial_refund_invoice_with_payment__adjustment_not_met_no_void_no_credit(
        self,
        mock_find_newest_unpaid_anchor,
        mock_get_rate,
        mock_create_adjustment,
        mock_create_credits,
        mock_collect_unpaid,
        mock_void_invoices,
        mock_mark_fully_met,
        run_on_commit_immediately,
    ):
        """
        Partial refund < outstanding, with CASH present:
        - Apply partial negative adjustment.
        - NOT fully met → no mark, no void (cash irrelevant but present).
        - No credits since not all invoices cleared.
        """
        mock_get_rate.return_value = Decimal("80.00")  # $80/t

        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            prev_summary = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('800.0000'),
                credited_emissions=Decimal('0'),
                report_version=self.report_version_1,
            )
        new_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('700.0000'),  # ↓ 100 t → $8,000
            credited_emissions=Decimal('0'),
            report_version=self.report_version_2,
        )

        compliance_report = baker.make_recipe(
            'compliance.tests.utils.compliance_report',
            report=self.report,
            compliance_period_id=1,
        )
        prev_crv = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=compliance_report,
            report_compliance_summary=prev_summary,
        )

        mock_find_newest_unpaid_anchor.return_value = prev_crv
        mock_collect_unpaid.return_value = [
            {
                "version_id": prev_crv.id,
                "invoice_id": 9999,
                "outstanding": Decimal("12000.00"),
                "paid": Decimal("10.00"),  # CASH present (explicit)
                "prev_excess_emissions": Decimal("800.0000"),
            }
        ]

        result = DecreasedObligationHandler.handle(
            compliance_report=compliance_report,
            new_summary=new_summary,
            previous_summary=prev_summary,
            version_count=2,
        )

        assert result.excess_emissions_delta_from_previous == Decimal("-100.0000")
        mock_create_adjustment.assert_called_once()
        _, adj_kwargs = mock_create_adjustment.call_args
        assert adj_kwargs["target_compliance_report_version_id"] == prev_crv.id
        assert adj_kwargs["supplementary_compliance_report_version_id"] == result.id
        assert adj_kwargs["adjustment_total"] == Decimal("-8000.00")

        mock_mark_fully_met.assert_not_called()
        mock_void_invoices.assert_not_called()
        mock_create_credits.assert_not_called()

        refreshed = ComplianceReportVersion.objects.get(id=result.id)
        assert refreshed.status == ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS

    def test_handle__full_refund_invoice_with_payment__adjustment_fully_met_no_void_no_credit(
        self,
        mock_find_newest_unpaid_anchor,
        mock_get_rate,
        mock_create_adjustment,
        mock_create_credits,
        mock_collect_unpaid,
        mock_void_invoices,
        mock_mark_fully_met,
        run_on_commit_immediately,
    ):
        """
        Refund == outstanding, with CASH present:
        - Apply full negative adjustment.
        - Mark FULLY_MET.
        - DO NOT void (cash payments exist).
        - No credits (no remainder, no over-compliance, no credited_emissions).
        """
        mock_get_rate.return_value = Decimal("80.00")  # $80/t

        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            prev_summary = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('500.0000'),
                credited_emissions=Decimal('0'),
                report_version=self.report_version_1,
            )
        new_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('300.0000'),  # ↓ 200 t → $16,000
            credited_emissions=Decimal('0'),
            report_version=self.report_version_2,
        )

        compliance_report = baker.make_recipe(
            'compliance.tests.utils.compliance_report',
            report=self.report,
            compliance_period_id=1,
        )
        prev_crv = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=compliance_report,
            report_compliance_summary=prev_summary,
        )

        mock_find_newest_unpaid_anchor.return_value = prev_crv
        mock_collect_unpaid.return_value = [
            {
                "version_id": prev_crv.id,
                "invoice_id": 12345,
                "outstanding": Decimal("16000.00"),  # exactly equals refund
                "paid": Decimal("0.01"),  # CASH present → no void
                "prev_excess_emissions": Decimal("500.0000"),
            }
        ]

        result = DecreasedObligationHandler.handle(
            compliance_report=compliance_report,
            new_summary=new_summary,
            previous_summary=prev_summary,
            version_count=2,
        )

        assert result.excess_emissions_delta_from_previous == Decimal("-200.0000")

        mock_create_adjustment.assert_called_once()
        _, adj_kwargs = mock_create_adjustment.call_args
        assert adj_kwargs["target_compliance_report_version_id"] == prev_crv.id
        assert adj_kwargs["supplementary_compliance_report_version_id"] == result.id
        assert adj_kwargs["adjustment_total"] == Decimal("-16000.00")

        mock_mark_fully_met.assert_called_once_with(prev_crv.id)
        mock_void_invoices.assert_not_called()  # ← key change
        mock_create_credits.assert_not_called()

        refreshed = ComplianceReportVersion.objects.get(id=result.id)
        assert refreshed.status == ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS

    def test_handle__over_refund_invoice_with_payment__adjustment_fully_met_no_void_credit(
        self,
        mock_find_newest_unpaid_anchor,
        mock_get_rate,
        mock_create_adjustment,
        mock_create_credits,
        mock_collect_unpaid,
        mock_void_invoices,
        mock_mark_fully_met,
        run_on_commit_immediately,
    ):
        """
        Refund > outstanding, with CASH present:
        - Apply negative adjustment to fully meet the invoice.
        - Mark FULLY_MET.
        - DO NOT void (cash payments exist).
        - Convert remainder to earned credits on the NEW CRV.
        """
        mock_get_rate.return_value = Decimal("80.00")  # $80/t

        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            prev_summary = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('500.0000'),
                credited_emissions=Decimal('0'),
                report_version=self.report_version_1,
            )
        new_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('300.0000'),  # ↓ 200 t → $16,000 refund
            credited_emissions=Decimal('0'),
            report_version=self.report_version_2,
        )

        compliance_report = baker.make_recipe(
            'compliance.tests.utils.compliance_report',
            report=self.report,
            compliance_period_id=1,
        )
        prev_crv = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=compliance_report,
            report_compliance_summary=prev_summary,
        )

        mock_find_newest_unpaid_anchor.return_value = prev_crv
        mock_collect_unpaid.return_value = [
            {
                "version_id": prev_crv.id,
                "invoice_id": 12345,
                "outstanding": Decimal("12000.00"),  # will be fully met
                "paid": Decimal("5.00"),  # CASH present → no void
                "prev_excess_emissions": Decimal("500.0000"),
            }
        ]

        result = DecreasedObligationHandler.handle(
            compliance_report=compliance_report,
            new_summary=new_summary,
            previous_summary=prev_summary,
            version_count=2,
        )

        assert result.excess_emissions_delta_from_previous == Decimal("-200.0000")

        # $16,000 refund → apply $12,000, remainder $4,000 → 50 t credits
        mock_create_adjustment.assert_called_once()
        _, adj_kwargs = mock_create_adjustment.call_args
        assert adj_kwargs["target_compliance_report_version_id"] == prev_crv.id
        assert adj_kwargs["supplementary_compliance_report_version_id"] == result.id
        assert adj_kwargs["adjustment_total"] == Decimal("-12000.00")

        mock_mark_fully_met.assert_called_once_with(prev_crv.id)
        mock_void_invoices.assert_not_called()  # ← key change

        assert mock_create_credits.call_count == 1
        _, credit_kwargs = mock_create_credits.call_args
        assert credit_kwargs["compliance_report_version"].id == result.id
        assert credit_kwargs["amount"] == 50

        refreshed = ComplianceReportVersion.objects.get(id=result.id)
        assert refreshed.status == ComplianceReportVersion.ComplianceStatus.EARNED_CREDITS

    # handle multiple invoices\no payment
    def test_handle__partial_refund_multi_invoices_no_payment__adjustments_not_met_no_void_no_credit(
        self,
        mock_find_newest_unpaid_anchor,
        mock_get_rate,
        mock_create_adjustment,
        mock_create_credits,
        mock_collect_unpaid,
        mock_void_invoices,
        mock_mark_fully_met,
        run_on_commit_immediately,
    ):
        """
        Partial refund across multiple invoices (no cash):
        - Apply refund only to the newest invoice (partial).
        - DO NOT mark FULLY_MET or void.
        - DO NOT create credits (not all invoices cleared).
        """
        mock_get_rate.return_value = Decimal("80.00")  # $80/t

        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            prev = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('800.0000'),
                credited_emissions=0,
                report_version=self.report_version_1,
            )
        # Refund = 125 t * $80 = $10,000
        new = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('675.0000'),
            credited_emissions=0,
            report_version=self.report_version_2,
        )
        report = baker.make_recipe(
            'compliance.tests.utils.compliance_report', report=self.report, compliance_period_id=1
        )

        anchor = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version', compliance_report=report, report_compliance_summary=prev
        )
        older = baker.make_recipe('compliance.tests.utils.compliance_report_version', compliance_report=report)
        mock_find_newest_unpaid_anchor.return_value = anchor

        mock_collect_unpaid.return_value = [
            {
                "version_id": anchor.id,
                "invoice_id": 111,
                "outstanding": Decimal("12000.00"),
                "paid": Decimal("0.00"),
                "prev_excess_emissions": Decimal("800.0000"),
            },
            {
                "version_id": older.id,
                "invoice_id": 222,
                "outstanding": Decimal("5000.00"),
                "paid": Decimal("0.00"),
                "prev_excess_emissions": Decimal("790.0000"),
            },
        ]

        res = DecreasedObligationHandler.handle(report, new, prev, version_count=3)

        # Only one adjustment of -$10,000 to the newest invoice; not fully met
        mock_create_adjustment.assert_called_once()
        _, adj = mock_create_adjustment.call_args
        assert adj["target_compliance_report_version_id"] == anchor.id
        assert adj["adjustment_total"] == Decimal("-10000.00")

        mock_mark_fully_met.assert_not_called()
        mock_void_invoices.assert_not_called()
        mock_create_credits.assert_not_called()
        assert (
            ComplianceReportVersion.objects.get(id=res.id).status
            == ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS
        )

    def test_handle__full_refund_multi_invoices_no_payment__adjustments_all_fully_met_void_no_credit(
        self,
        mock_find_newest_unpaid_anchor,
        mock_get_rate,
        mock_create_adjustment,
        mock_create_credits,
        mock_collect_unpaid,
        mock_void_invoices,
        mock_mark_fully_met,
        run_on_commit_immediately,
    ):
        """
        Full refund equals sum of two invoices (no cash):
        - Fully meet both invoices (two adjustments).
        - Mark FULLY_MET and void both (no cash on either).
        - No credits (no remainder).
        """
        mock_get_rate.return_value = Decimal("80.00")

        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            prev = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('900.0000'),
                credited_emissions=0,
                report_version=self.report_version_1,
            )
        # Refund = 250 t * $80 = $20,000
        new = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('650.0000'),
            credited_emissions=0,
            report_version=self.report_version_2,
        )
        report = baker.make_recipe(
            'compliance.tests.utils.compliance_report', report=self.report, compliance_period_id=1
        )

        anchor = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version', compliance_report=report, report_compliance_summary=prev
        )
        older = baker.make_recipe('compliance.tests.utils.compliance_report_version', compliance_report=report)
        mock_find_newest_unpaid_anchor.return_value = anchor

        mock_collect_unpaid.return_value = [
            {
                "version_id": anchor.id,
                "invoice_id": 111,
                "outstanding": Decimal("12000.00"),
                "paid": Decimal("0.00"),
                "prev_excess_emissions": Decimal("900.0000"),
            },
            {
                "version_id": older.id,
                "invoice_id": 222,
                "outstanding": Decimal("8000.00"),
                "paid": Decimal("0.00"),
                "prev_excess_emissions": Decimal("850.0000"),
            },
        ]

        res = DecreasedObligationHandler.handle(report, new, prev, version_count=3)

        assert mock_create_adjustment.call_count == 2
        mock_mark_fully_met.assert_any_call(anchor.id)
        mock_mark_fully_met.assert_any_call(older.id)
        # No cash on either -> void both
        assert mock_void_invoices.call_count == 2
        mock_create_credits.assert_not_called()
        assert (
            ComplianceReportVersion.objects.get(id=res.id).status
            == ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS
        )

    def test_handle__over_refund_multi_invoices_no_payment__adjustments_conditional_fully_met_void_no_credit(
        self,
        mock_find_newest_unpaid_anchor,
        mock_get_rate,
        mock_create_adjustment,
        mock_create_credits,
        mock_collect_unpaid,
        mock_void_invoices,
        mock_mark_fully_met,
        run_on_commit_immediately,
    ):
        """
        Multiple invoices, allocated newest → oldest:
        - Apply refund to the newest invoice until fully met (no cash → void).
        - Allocate remaining refund to older invoices (may remain partially met).
        - Since not all invoices are cleared, DO NOT create credits.
        - Verifies two adjustments (-12,000 and -8,000), FULLY_MET + void on the anchor, and no credits.
        """
        mock_get_rate.return_value = Decimal("80.00")  # $80/t

        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            prev_summary = baker.make_recipe(
                "reporting.tests.utils.report_compliance_summary",
                excess_emissions=Decimal("900.0000"),
                credited_emissions=Decimal("0"),
                report_version=self.report_version_1,
            )
        new_summary = baker.make_recipe(
            "reporting.tests.utils.report_compliance_summary",
            excess_emissions=Decimal("650.0000"),  # decrease 250 t
            credited_emissions=Decimal("0"),
            report_version=self.report_version_2,
        )
        compliance_report = baker.make_recipe(
            "compliance.tests.utils.compliance_report", report=self.report, compliance_period_id=1
        )

        # Anchor (newest unpaid) + an older CRV in the chain
        crv_anchor = baker.make_recipe(
            "compliance.tests.utils.compliance_report_version",
            compliance_report=compliance_report,
            report_compliance_summary=prev_summary,
        )
        crv_older = baker.make_recipe(
            "compliance.tests.utils.compliance_report_version",
            compliance_report=compliance_report,
        )
        mock_find_newest_unpaid_anchor.return_value = crv_anchor

        # Refund = 250 * 80 = $20,000
        # Newest → oldest invoices:
        #  - Anchor invoice: $12,000 outstanding, $0 paid → fully met → mark + void
        #  - Older invoice: $15,000 outstanding → apply remaining $8,000 → partial
        mock_collect_unpaid.return_value = [
            {
                "version_id": crv_anchor.id,
                "invoice_id": 111,
                "outstanding": Decimal("12000.00"),
                "paid": Decimal("0.00"),
                "prev_excess_emissions": Decimal("900.0000"),
            },
            {
                "version_id": crv_older.id,
                "invoice_id": 222,
                "outstanding": Decimal("15000.00"),
                "paid": Decimal("0.00"),
                "prev_excess_emissions": Decimal("850.0000"),
            },
        ]

        # Act
        result = DecreasedObligationHandler.handle(
            compliance_report=compliance_report,
            new_summary=new_summary,
            previous_summary=prev_summary,
            version_count=3,
        )

        # Assert: new supplementary CRV
        assert isinstance(result, ComplianceReportVersion)
        assert result.previous_version_id == crv_anchor.id
        assert result.excess_emissions_delta_from_previous == Decimal("-250.0000")

        # Two adjustments: -12,000 (anchor), -8,000 (older)
        assert mock_create_adjustment.call_count == 2

        _, adj1 = mock_create_adjustment.call_args_list[0]
        assert adj1["target_compliance_report_version_id"] == crv_anchor.id
        assert adj1["supplementary_compliance_report_version_id"] == result.id
        assert adj1["adjustment_total"] == Decimal("-12000.00")

        _, adj2 = mock_create_adjustment.call_args_list[1]
        assert adj2["target_compliance_report_version_id"] == crv_older.id
        assert adj2["supplementary_compliance_report_version_id"] == result.id
        assert adj2["adjustment_total"] == Decimal("-8000.00")

        # Fully met anchor (no cash) → mark & void
        mock_mark_fully_met.assert_any_call(crv_anchor.id)
        mock_void_invoices.assert_any_call(crv_anchor.id)
        assert mock_mark_fully_met.call_count == 1
        assert mock_void_invoices.call_count == 1

        # Not all invoices cleared → no credits
        mock_create_credits.assert_not_called()

        refreshed = ComplianceReportVersion.objects.get(id=result.id)
        assert refreshed.status == ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS

    def test_handle__over_refund_multi_invoices_no_payment__adjustments_all_fully_met_void_credit(
        self,
        mock_find_newest_unpaid_anchor,
        mock_get_rate,
        mock_create_adjustment,
        mock_create_credits,
        mock_collect_unpaid,
        mock_void_invoices,
        mock_mark_fully_met,
        run_on_commit_immediately,
    ):
        """
        Multiple invoices, over-refund (no cash on invoices):
        - Allocate refund newest → oldest; fully meet the anchor and void it.
        - Continue allocating to older invoices; also fully met and voided (no cash).
        - Convert the remaining refund dollars to earned credits on the NEW CRV.
        - Verifies two adjustments, FULLY_MET + void on both invoices, and credit creation from the remainder.
        """
        mock_get_rate.return_value = Decimal("80.00")  # $80/t

        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            prev_summary = baker.make_recipe(
                "reporting.tests.utils.report_compliance_summary",
                excess_emissions=Decimal("900.0000"),
                credited_emissions=Decimal("0"),
                report_version=self.report_version_1,
            )
        # Decrease 275 t → refund $22,000
        new_summary = baker.make_recipe(
            "reporting.tests.utils.report_compliance_summary",
            excess_emissions=Decimal("625.0000"),
            credited_emissions=Decimal("0"),
            report_version=self.report_version_2,
        )
        compliance_report = baker.make_recipe(
            "compliance.tests.utils.compliance_report", report=self.report, compliance_period_id=1
        )

        # Anchor (newest unpaid) + older CRV
        crv_anchor = baker.make_recipe(
            "compliance.tests.utils.compliance_report_version",
            compliance_report=compliance_report,
            report_compliance_summary=prev_summary,
        )
        crv_older = baker.make_recipe(
            "compliance.tests.utils.compliance_report_version",
            compliance_report=compliance_report,
        )
        mock_find_newest_unpaid_anchor.return_value = crv_anchor

        # Outstanding totals $20,000; refund $22,000 ⇒ remainder $2,000 ⇒ 25 t credits at $80/t
        mock_collect_unpaid.return_value = [
            {
                "version_id": crv_anchor.id,
                "invoice_id": 111,
                "outstanding": Decimal("12000.00"),
                "paid": Decimal("0.00"),  # no cash → can void when fully met
                "prev_excess_emissions": Decimal("900.0000"),
            },
            {
                "version_id": crv_older.id,
                "invoice_id": 222,
                "outstanding": Decimal("8000.00"),
                "paid": Decimal("0.00"),
                "prev_excess_emissions": Decimal("850.0000"),
            },
        ]

        # Act
        result = DecreasedObligationHandler.handle(
            compliance_report=compliance_report,
            new_summary=new_summary,
            previous_summary=prev_summary,
            version_count=3,
        )

        # Assert: two adjustments (-12,000 and -8,000)
        assert mock_create_adjustment.call_count == 2
        _, adj1 = mock_create_adjustment.call_args_list[0]
        assert adj1["target_compliance_report_version_id"] == crv_anchor.id
        assert adj1["supplementary_compliance_report_version_id"] == result.id
        assert adj1["adjustment_total"] == Decimal("-12000.00")
        _, adj2 = mock_create_adjustment.call_args_list[1]
        assert adj2["target_compliance_report_version_id"] == crv_older.id
        assert adj2["supplementary_compliance_report_version_id"] == result.id
        assert adj2["adjustment_total"] == Decimal("-8000.00")

        # Both fully met → mark and void BOTH (no cash on either)
        mock_mark_fully_met.assert_any_call(crv_anchor.id)
        mock_mark_fully_met.assert_any_call(crv_older.id)
        assert mock_mark_fully_met.call_count == 2

        mock_void_invoices.assert_any_call(crv_anchor.id)
        mock_void_invoices.assert_any_call(crv_older.id)
        assert mock_void_invoices.call_count == 2

        # Remainder $2,000 → 25 t credits on NEW CRV
        assert mock_create_credits.call_count == 1
        _, credit_kwargs = mock_create_credits.call_args
        assert credit_kwargs["compliance_report_version"].id == result.id
        assert credit_kwargs["amount"] == 25

        refreshed = ComplianceReportVersion.objects.get(id=result.id)
        assert refreshed.status == ComplianceReportVersion.ComplianceStatus.EARNED_CREDITS

    # handle multiple invoices\payment
    def test_handle__partial_refund_multi_invoices_with_payment__adjustment_not_met_no_void_no_credit(
        self,
        mock_find_newest_unpaid_anchor,
        mock_get_rate,
        mock_create_adjustment,
        mock_create_credits,
        mock_collect_unpaid,
        mock_void_invoices,
        mock_mark_fully_met,
        run_on_commit_immediately,
    ):
        """
        Partial refund across multiple invoices (cash present):
        - Apply partial adjustment to newest invoice.
        - Not fully met → no mark, no void (cash irrelevant here).
        - No credits.
        """
        mock_get_rate.return_value = Decimal("80.00")

        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            prev = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('820.0000'),
                credited_emissions=0,
                report_version=self.report_version_1,
            )
        # Refund = 100 t * $80 = $8,000
        new = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('720.0000'),
            credited_emissions=0,
            report_version=self.report_version_2,
        )
        report = baker.make_recipe(
            'compliance.tests.utils.compliance_report', report=self.report, compliance_period_id=1
        )

        anchor = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version', compliance_report=report, report_compliance_summary=prev
        )
        older = baker.make_recipe('compliance.tests.utils.compliance_report_version', compliance_report=report)
        mock_find_newest_unpaid_anchor.return_value = anchor

        mock_collect_unpaid.return_value = [
            {
                "version_id": anchor.id,
                "invoice_id": 111,
                "outstanding": Decimal("12000.00"),
                "paid": Decimal("1.00"),
                "prev_excess_emissions": Decimal("820.0000"),
            },
            {
                "version_id": older.id,
                "invoice_id": 222,
                "outstanding": Decimal("6000.00"),
                "paid": Decimal("2.00"),
                "prev_excess_emissions": Decimal("800.0000"),
            },
        ]

        DecreasedObligationHandler.handle(report, new, prev, version_count=3)

        mock_create_adjustment.assert_called_once()
        _, adj = mock_create_adjustment.call_args
        assert adj["target_compliance_report_version_id"] == anchor.id
        assert adj["adjustment_total"] == Decimal("-8000.00")
        mock_mark_fully_met.assert_not_called()
        mock_void_invoices.assert_not_called()
        mock_create_credits.assert_not_called()

    def test_handle__full_refund_multi_invoices_with_payment__adjustments_all_fully_met_no_void_no_credit(
        self,
        mock_find_newest_unpaid_anchor,
        mock_get_rate,
        mock_create_adjustment,
        mock_create_credits,
        mock_collect_unpaid,
        mock_void_invoices,
        mock_mark_fully_met,
        run_on_commit_immediately,
    ):
        """
        Full refund equals sum across invoices (cash present):
        - Fully meet both invoices (two adjustments), mark FULLY_MET.
        - DO NOT void due to cash.
        - No credits (no remainder).
        """
        mock_get_rate.return_value = Decimal("80.00")

        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            prev = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('900.0000'),
                credited_emissions=0,
                report_version=self.report_version_1,
            )
        # Refund = 250 t * $80 = $20,000
        new = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('650.0000'),
            credited_emissions=0,
            report_version=self.report_version_2,
        )
        report = baker.make_recipe(
            'compliance.tests.utils.compliance_report', report=self.report, compliance_period_id=1
        )

        anchor = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version', compliance_report=report, report_compliance_summary=prev
        )
        older = baker.make_recipe('compliance.tests.utils.compliance_report_version', compliance_report=report)
        mock_find_newest_unpaid_anchor.return_value = anchor

        mock_collect_unpaid.return_value = [
            {
                "version_id": anchor.id,
                "invoice_id": 111,
                "outstanding": Decimal("12000.00"),
                "paid": Decimal("1.00"),
                "prev_excess_emissions": Decimal("900.0000"),
            },
            {
                "version_id": older.id,
                "invoice_id": 222,
                "outstanding": Decimal("8000.00"),
                "paid": Decimal("2.00"),
                "prev_excess_emissions": Decimal("850.0000"),
            },
        ]

        DecreasedObligationHandler.handle(report, new, prev, version_count=3)

        assert mock_create_adjustment.call_count == 2
        mock_mark_fully_met.assert_any_call(anchor.id)
        mock_mark_fully_met.assert_any_call(older.id)
        mock_void_invoices.assert_not_called()
        mock_create_credits.assert_not_called()

    def test_handle__over_refund_multi_invoices_with_payment__adjustments_conditionally_met_no_void_no_credit(
        self,
        mock_find_newest_unpaid_anchor,
        mock_get_rate,
        mock_create_adjustment,
        mock_create_credits,
        mock_collect_unpaid,
        mock_void_invoices,
        mock_mark_fully_met,
        run_on_commit_immediately,
    ):
        """
        Split refund with CASH present:
        - Refund > anchor outstanding → anchor fully met (mark), DO NOT void (cash).
        - Remainder applied to older invoice (partial).
        - Not all invoices cleared → DO NOT create credits.
        """
        mock_get_rate.return_value = Decimal("80.00")  # $80/t

        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            prev = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('600.0000'),
                credited_emissions=0,
                report_version=self.report_version_1,
            )
        # Refund = 150 t * $80 = $12,000
        new = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('450.0000'),
            credited_emissions=0,
            report_version=self.report_version_2,
        )
        report = baker.make_recipe(
            'compliance.tests.utils.compliance_report', report=self.report, compliance_period_id=1
        )

        anchor = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version', compliance_report=report, report_compliance_summary=prev
        )
        older = baker.make_recipe('compliance.tests.utils.compliance_report_version', compliance_report=report)
        mock_find_newest_unpaid_anchor.return_value = anchor

        # Anchor 5,000 with cash → fully met, no void; Older 10,000 (partial 7,000 remaining)
        mock_collect_unpaid.return_value = [
            {
                "version_id": anchor.id,
                "invoice_id": 11,
                "outstanding": Decimal("5000.00"),
                "paid": Decimal("10.00"),
                "prev_excess_emissions": Decimal("600.0000"),
            },
            {
                "version_id": older.id,
                "invoice_id": 22,
                "outstanding": Decimal("10000.00"),
                "paid": Decimal("1.00"),
                "prev_excess_emissions": Decimal("550.0000"),
            },
        ]

        DecreasedObligationHandler.handle(report, new, prev, version_count=3)

        # Two adjustments: -5,000 (anchor), -7,000 (older)
        assert mock_create_adjustment.call_count == 2
        # Mark both calls exist
        mock_mark_fully_met.assert_any_call(anchor.id)
        # CASH present on anchor → DO NOT void
        mock_void_invoices.assert_not_called()
        # Not all cleared → NO credits
        mock_create_credits.assert_not_called()

    def test_handle__over_refund_multi_invoices_with_payment__adjustments_all_fully_met_no_void_credit(
        self,
        mock_find_newest_unpaid_anchor,
        mock_get_rate,
        mock_create_adjustment,
        mock_create_credits,
        mock_collect_unpaid,
        mock_void_invoices,
        mock_mark_fully_met,
        run_on_commit_immediately,
    ):
        """
        Over-refund across multiple invoices (cash present):
        - Fully meet all invoices via multiple adjustments and mark FULLY_MET.
        - DO NOT void (cash).
        - Convert remainder to credits on the new CRV.
        """
        mock_get_rate.return_value = Decimal("80.00")

        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            prev = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('900.0000'),
                credited_emissions=0,
                report_version=self.report_version_1,
            )
        # Refund = 275 t * $80 = $22,000
        new = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('625.0000'),
            credited_emissions=0,
            report_version=self.report_version_2,
        )
        report = baker.make_recipe(
            'compliance.tests.utils.compliance_report', report=self.report, compliance_period_id=1
        )

        anchor = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version', compliance_report=report, report_compliance_summary=prev
        )
        older = baker.make_recipe('compliance.tests.utils.compliance_report_version', compliance_report=report)
        mock_find_newest_unpaid_anchor.return_value = anchor

        # Sum outstanding = 12,000 + 8,000 = 20,000 < refund 22,000 → remainder $2,000 → 25 t credits
        mock_collect_unpaid.return_value = [
            {
                "version_id": anchor.id,
                "invoice_id": 111,
                "outstanding": Decimal("12000.00"),
                "paid": Decimal("1.00"),
                "prev_excess_emissions": Decimal("900.0000"),
            },
            {
                "version_id": older.id,
                "invoice_id": 222,
                "outstanding": Decimal("8000.00"),
                "paid": Decimal("2.00"),
                "prev_excess_emissions": Decimal("850.0000"),
            },
        ]

        res = DecreasedObligationHandler.handle(report, new, prev, version_count=3)

        assert mock_create_adjustment.call_count == 2
        mock_mark_fully_met.assert_any_call(anchor.id)
        mock_mark_fully_met.assert_any_call(older.id)
        mock_void_invoices.assert_not_called()

        # Remainder 22,000 - 20,000 = 2,000 → 25 t credits
        _, k = mock_create_credits.call_args
        assert k["compliance_report_version"].id == res.id
        assert k["amount"] == 25


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
        self.previous_compliance_report_version = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version', report_compliance_summary=self.previous_summary
        )
        baker.make_recipe(
            'compliance.tests.utils.compliance_earned_credit',
            compliance_report_version=self.previous_compliance_report_version,
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
        self.previous_compliance_report_version = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version', report_compliance_summary=self.previous_summary
        )
        baker.make_recipe(
            'compliance.tests.utils.compliance_earned_credit',
            compliance_report_version=self.previous_compliance_report_version,
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
        self.previous_compliance_report_version = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            report_compliance_summary=self.previous_summary,
            is_supplementary=False,
        )
        baker.make_recipe(
            'compliance.tests.utils.compliance_earned_credit',
            compliance_report_version=self.previous_compliance_report_version,
            earned_credits_amount=400,
            issuance_status=ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED,
            bccr_trading_name='Test Trading Name',
            bccr_holding_account_id='123',
        )
        # Act
        new_compliance_version = IncreasedCreditHandler.handle(
            self.previous_compliance_report_version.compliance_report, self.new_summary, self.previous_summary, 2
        )
        original_credit_record = ComplianceEarnedCredit.objects.get(
            compliance_report_version=self.previous_compliance_report_version
        )

        # Assert
        assert new_compliance_version.status == ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS
        assert new_compliance_version.credited_emissions_delta_from_previous == Decimal("100")
        assert new_compliance_version.report_compliance_summary_id == self.new_summary.id
        assert new_compliance_version.is_supplementary is True
        assert new_compliance_version.previous_version == self.previous_compliance_report_version

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
            ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED,
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
        self.previous_compliance_report_version = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            report_compliance_summary=self.previous_summary,
            is_supplementary=False,
        )
        baker.make_recipe(
            'compliance.tests.utils.compliance_earned_credit',
            compliance_report_version=self.previous_compliance_report_version,
            earned_credits_amount=600,
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
        self.previous_compliance_report_version = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version', report_compliance_summary=self.previous_summary
        )
        baker.make_recipe(
            'compliance.tests.utils.compliance_earned_credit',
            compliance_report_version=self.previous_compliance_report_version,
            earned_credits_amount=500,
            issuance_status=ComplianceEarnedCredit.IssuanceStatus.CHANGES_REQUIRED,
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
            credited_emissions=Decimal('300'),
            report_version=self.report_version_3,
        )

        # Act
        result = DecreasedCreditHandler.can_handle(summary_3, self.previous_summary)

        # Assert
        assert result is True

    @patch('compliance.service.supplementary_version_service.DecreasedCreditHandler.handle')
    @patch('compliance.service.supplementary_version_service.IncreasedCreditHandler.handle')
    @patch('compliance.service.supplementary_version_service.NoChangeHandler.handle')
    @patch('compliance.service.supplementary_version_service.DecreasedObligationHandler.handle')
    @patch('compliance.service.supplementary_version_service.IncreasedObligationHandler.handle')
    @pytest.mark.parametrize(
        "issuance_status",
        [
            ComplianceEarnedCredit.IssuanceStatus.DECLINED,
            ComplianceEarnedCredit.IssuanceStatus.ISSUANCE_REQUESTED,
            ComplianceEarnedCredit.IssuanceStatus.CHANGES_REQUIRED,
            ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED,
        ],
    )
    def test_correctly_calls_decreased_credit_handler(
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
    def test_handle_decreased_credits_success_when_credits_requested(self, issuance_status):
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
        self.previous_compliance_report_version = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
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
        # Act
        new_compliance_version = DecreasedCreditHandler.handle(
            self.previous_compliance_report_version.compliance_report, self.new_summary, self.previous_summary, 2
        )
        original_credit_record = ComplianceEarnedCredit.objects.get(
            compliance_report_version=self.previous_compliance_report_version
        )
        new_credit_record = ComplianceEarnedCredit.objects.get(compliance_report_version=new_compliance_version)

        # Assert
        assert new_compliance_version.status == ComplianceReportVersion.ComplianceStatus.EARNED_CREDITS
        assert new_compliance_version.credited_emissions_delta_from_previous == Decimal("-300")
        assert new_compliance_version.report_compliance_summary_id == self.new_summary.id
        assert new_compliance_version.is_supplementary is True
        assert new_compliance_version.previous_version == self.previous_compliance_report_version
        assert original_credit_record.earned_credits_amount == Decimal('800')

        assert new_credit_record.earned_credits_amount == Decimal('500')
        assert new_credit_record.issuance_status == ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED
        assert original_credit_record.issuance_status == ComplianceEarnedCredit.IssuanceStatus.DECLINED

    def test_handle_decreased_credits_success_when_credits_not_requested(
        self,
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
        self.previous_compliance_report_version = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            report_compliance_summary=self.previous_summary,
            is_supplementary=False,
        )
        baker.make_recipe(
            'compliance.tests.utils.compliance_earned_credit',
            compliance_report_version=self.previous_compliance_report_version,
            earned_credits_amount=800,
            issuance_status=ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED,
            bccr_trading_name='Test Trading Name',
            bccr_holding_account_id='123',
        )
        # Act
        new_compliance_version = DecreasedCreditHandler.handle(
            self.previous_compliance_report_version.compliance_report, self.new_summary, self.previous_summary, 2
        )
        original_credit_record = ComplianceEarnedCredit.objects.get(
            compliance_report_version=self.previous_compliance_report_version
        )

        # Assert
        assert new_compliance_version.status == ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS
        assert new_compliance_version.credited_emissions_delta_from_previous == Decimal("-300")
        assert new_compliance_version.report_compliance_summary_id == self.new_summary.id
        assert new_compliance_version.is_supplementary is True
        assert new_compliance_version.previous_version == self.previous_compliance_report_version

        # check that original credit record was updated
        assert ComplianceEarnedCredit.objects.count() == 1
        assert original_credit_record.earned_credits_amount == Decimal('500')
        assert original_credit_record.issuance_status == ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED

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
        self.previous_compliance_report_version = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version', report_compliance_summary=self.previous_summary
        )
        baker.make_recipe(
            'compliance.tests.utils.compliance_earned_credit',
            compliance_report_version=self.previous_compliance_report_version,
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
        self.previous_compliance_report_version = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            report_compliance_summary=self.previous_summary,
            is_supplementary=False,
            status=ComplianceReportVersion.ComplianceStatus.EARNED_CREDITS,
        )
        baker.make_recipe(
            'compliance.tests.utils.compliance_earned_credit',
            compliance_report_version=self.previous_compliance_report_version,
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
        self.previous_compliance_report_version = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            report_compliance_summary=self.previous_summary,
            is_supplementary=False,
            status=ComplianceReportVersion.ComplianceStatus.EARNED_CREDITS,
        )
        baker.make_recipe(
            'compliance.tests.utils.compliance_earned_credit',
            compliance_report_version=self.previous_compliance_report_version,
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
        self.previous_compliance_report_version = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            report_compliance_summary=self.previous_summary,
            is_supplementary=False,
            status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_PENDING_INVOICE_CREATION,
        )
        baker.make_recipe(
            'compliance.tests.utils.compliance_obligation',
            compliance_report_version=self.previous_compliance_report_version,
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
        self.previous_compliance_report_version = baker.make_recipe(
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
            compliance_report_version=self.previous_compliance_report_version,
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
        self.previous_compliance_report_version = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            report_compliance_summary=self.previous_summary,
            is_supplementary=False,
            status=ComplianceReportVersion.ComplianceStatus.EARNED_CREDITS,
        )
        baker.make_recipe(
            'compliance.tests.utils.compliance_earned_credit',
            compliance_report_version=self.previous_compliance_report_version,
            earned_credits_amount=800,
            issuance_status=ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED,
        )
        # Act
        new_compliance_version = SupercedeVersionHandler.handle(
            self.previous_compliance_report_version.compliance_report, self.new_summary, self.previous_summary, 2
        )
        credit_record = ComplianceEarnedCredit.objects.get(compliance_report_version=new_compliance_version)
        self.previous_compliance_report_version.refresh_from_db()

        # Assert
        assert new_compliance_version.status == ComplianceReportVersion.ComplianceStatus.EARNED_CREDITS
        assert self.previous_compliance_report_version.status == ComplianceReportVersion.ComplianceStatus.SUPERCEDED
        assert new_compliance_version.report_compliance_summary_id == self.new_summary.id
        assert new_compliance_version.is_supplementary is True
        assert new_compliance_version.previous_version == self.previous_compliance_report_version
        assert credit_record.earned_credits_amount == Decimal('500')
        assert credit_record.issuance_status == ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED

    def test_handle_supercede_obligation_success_before_invoice_date(
        self,
        before_invoice_date,
        run_on_commit_immediately,
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
        self.previous_compliance_report_version = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            report_compliance_summary=self.previous_summary,
            is_supplementary=False,
            status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_PENDING_INVOICE_CREATION,
        )
        baker.make_recipe(
            'compliance.tests.utils.compliance_obligation',
            compliance_report_version=self.previous_compliance_report_version,
        )
        # Act
        new_compliance_version = SupercedeVersionHandler.handle(
            self.previous_compliance_report_version.compliance_report, self.new_summary, self.previous_summary, 2
        )
        self.previous_compliance_report_version.refresh_from_db()
        new_compliance_version.refresh_from_db()

        # Assert
        assert (
            new_compliance_version.status
            == ComplianceReportVersion.ComplianceStatus.OBLIGATION_PENDING_INVOICE_CREATION
        )
        assert self.previous_compliance_report_version.status == ComplianceReportVersion.ComplianceStatus.SUPERCEDED
        assert new_compliance_version.report_compliance_summary_id == self.new_summary.id
        assert new_compliance_version.is_supplementary is True
        assert new_compliance_version.previous_version == self.previous_compliance_report_version

    def test_handle_supercede_obligation_success_after_invoice_date(
        self,
        after_invoice_date,
        run_on_commit_immediately,
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
        self.previous_compliance_report_version = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            report_compliance_summary=self.previous_summary,
            is_supplementary=False,
            status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET,
        )
        baker.make_recipe(
            'compliance.tests.utils.compliance_obligation',
            compliance_report_version=self.previous_compliance_report_version,
        )
        # Act
        new_compliance_version = SupercedeVersionHandler.handle(
            self.previous_compliance_report_version.compliance_report, self.new_summary, self.previous_summary, 2
        )
        self.previous_compliance_report_version.refresh_from_db()
        new_compliance_version.refresh_from_db()

        # Assert
        assert (
            new_compliance_version.status
            == ComplianceReportVersion.ComplianceStatus.OBLIGATION_PENDING_INVOICE_CREATION
        )
        assert self.previous_compliance_report_version.status == ComplianceReportVersion.ComplianceStatus.SUPERCEDED
        assert new_compliance_version.report_compliance_summary_id == self.new_summary.id
        assert new_compliance_version.is_supplementary is True
        assert new_compliance_version.previous_version == self.previous_compliance_report_version
