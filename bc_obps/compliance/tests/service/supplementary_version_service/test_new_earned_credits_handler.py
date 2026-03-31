from decimal import Decimal
from unittest.mock import MagicMock
import pytest
import common.lib.pgtrigger as pgtrigger
from model_bakery import baker
from compliance.models import ComplianceEarnedCredit, ComplianceReportVersion
from unittest.mock import patch
from compliance.service.supplementary_version_service.new_earned_credits_handler import NewEarnedCreditsHandler
from compliance.service.supplementary_version_service.service import SupplementaryVersionService
from compliance.tests.service.supplementary_version_service.utils import BaseSupplementaryVersionServiceTest

pytestmark = pytest.mark.django_db(transaction=True)

_INC_OBL = "compliance.service.supplementary_version_service.increased_obligation_handler"
_DEC_OBL = "compliance.service.supplementary_version_service.decreased_obligation_handler"
_NO_CHG = "compliance.service.supplementary_version_service.no_change_handler"
_INC_CRD = "compliance.service.supplementary_version_service.increased_credit_handler"
_DEC_CRD = "compliance.service.supplementary_version_service.decreased_credit_handler"
_NEW_CRD = "compliance.service.supplementary_version_service.new_earned_credits_handler"
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
def mock_superceded_can_handle():
    with patch(f"{_SUPERCEDE}.SupercedeVersionHandler.can_handle") as mock:
        yield mock


@pytest.fixture
def mock_create_earned_credits():
    with patch(
        "compliance.service.earned_credits_service.ComplianceEarnedCreditsService.create_earned_credits_record"
    ) as mock:
        yield mock


class TestNewEarnedCreditsHandler(BaseSupplementaryVersionServiceTest):
    def test_can_handle_new_earned_credits_no_previous_record(self):
        # Arrange
        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            self.previous_summary = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=0,
                credited_emissions=Decimal('0'),
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
        )
        # No earned credit record created - this is the key difference from IncreasedCreditHandler

        # Act
        result = NewEarnedCreditsHandler.can_handle(self.new_summary, self.previous_summary)

        # Assert
        assert result is True

    def test_can_handle_returns_false_when_previous_has_earned_credit_record(self):
        # Arrange
        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            self.previous_summary = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=0,
                credited_emissions=Decimal('0'),
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
        )
        # Create an earned credit record - should return False
        baker.make_recipe(
            'compliance.tests.utils.compliance_earned_credit',
            compliance_report_version=self.previous_compliance_report_version,
            earned_credits_amount=0,
            issuance_status=ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED,
        )

        # Act
        result = NewEarnedCreditsHandler.can_handle(self.new_summary, self.previous_summary)

        # Assert
        assert result is False

    def test_can_handle_returns_false_when_previous_has_credited_emissions(self):
        # Arrange
        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            self.previous_summary = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=0,
                credited_emissions=Decimal('100'),  # Previous has credited emissions
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
        )

        # Act
        result = NewEarnedCreditsHandler.can_handle(self.new_summary, self.previous_summary)

        # Assert
        assert result is False

    def test_can_handle_returns_false_when_new_has_no_credited_emissions(self):
        # Arrange
        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            self.previous_summary = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=0,
                credited_emissions=Decimal('0'),
                report_version=self.report_version_1,
            )
        self.new_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=0,
            credited_emissions=Decimal('0'),  # New has no credited emissions
            report_version=self.report_version_2,
        )
        self.compliance_report = baker.make_recipe(
            'compliance.tests.utils.compliance_report', report=self.report, compliance_period_id=1
        )
        self.previous_compliance_report_version = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            report_compliance_summary=self.previous_summary,
        )

        # Act
        result = NewEarnedCreditsHandler.can_handle(self.new_summary, self.previous_summary)

        # Assert
        assert result is False

    def test_handle_creates_new_earned_credits_record(self, mock_create_earned_credits):
        # Arrange
        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            self.previous_summary = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=0,
                credited_emissions=Decimal('0'),
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
            compliance_report=self.compliance_report,
        )

        # Act
        result = NewEarnedCreditsHandler.handle(self.compliance_report, self.new_summary, self.previous_summary, 2)

        # Assert
        assert result.status == ComplianceReportVersion.ComplianceStatus.EARNED_CREDITS
        assert result.report_compliance_summary_id == self.new_summary.id
        assert result.compliance_report_id == self.compliance_report.id
        assert result.credited_emissions_delta_from_previous == Decimal('500')
        assert result.is_supplementary is True
        assert result.previous_version == self.previous_compliance_report_version
        mock_create_earned_credits.assert_called_once_with(result)

    def test_calls_correct_handler(
        self,
        mock_increased_handler,
        mock_decreased_handler,
        mock_no_change_handler,
        mock_increased_credit_handler,
        mock_decreased_credit_handler,
        mock_new_earned_credits_handler,
        mock_superceded_can_handle,
    ):
        mock_superceded_can_handle.return_value = False
        # Arrange
        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            self.previous_summary = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=0,
                credited_emissions=Decimal('0'),
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
        # No earned credit record created
        mock_result = MagicMock(spec=ComplianceReportVersion)
        mock_new_earned_credits_handler.return_value = mock_result

        # Act
        result = SupplementaryVersionService().handle_supplementary_version(
            self.compliance_report, self.report_version_2, 2
        )

        # Assert
        mock_new_earned_credits_handler.assert_called_once_with(
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
