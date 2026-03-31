from decimal import Decimal
from unittest.mock import MagicMock
import pytest
import common.lib.pgtrigger as pgtrigger
from model_bakery import baker
from compliance.models import ComplianceEarnedCredit, ComplianceReportVersion
from reporting.models import ReportVersion
from unittest.mock import patch
from compliance.service.supplementary_version_service.increased_credit_handler import IncreasedCreditHandler
from compliance.service.supplementary_version_service.service import SupplementaryVersionService
from compliance.tests.service.supplementary_version_service.utils import BaseSupplementaryVersionServiceTest

pytestmark = pytest.mark.django_db(transaction=True)

_INC_OBL = "compliance.service.supplementary_version_service.increased_obligation_handler"
_DEC_OBL = "compliance.service.supplementary_version_service.decreased_obligation_handler"
_NO_CHG = "compliance.service.supplementary_version_service.no_change_handler"
_INC_CRD = "compliance.service.supplementary_version_service.increased_credit_handler"
_DEC_CRD = "compliance.service.supplementary_version_service.decreased_credit_handler"
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
def mock_superceded_can_handle():
    with patch(f"{_SUPERCEDE}.SupercedeVersionHandler.can_handle") as mock:
        yield mock


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
