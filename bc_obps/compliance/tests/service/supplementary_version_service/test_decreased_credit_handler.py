from decimal import Decimal
from unittest.mock import MagicMock
import pytest
import common.lib.pgtrigger as pgtrigger
from model_bakery import baker
from compliance.models import ComplianceEarnedCredit, ComplianceReportVersion
from reporting.models import ReportVersion
from unittest.mock import patch
from compliance.service.supplementary_version_service.decreased_credit_handler import DecreasedCreditHandler
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


class TestDecreasedCreditHandler(BaseSupplementaryVersionServiceTest):
    @pytest.mark.parametrize(
        "issuance_status",
        [
            ComplianceEarnedCredit.IssuanceStatus.DECLINED,
            ComplianceEarnedCredit.IssuanceStatus.ISSUANCE_REQUESTED,
            ComplianceEarnedCredit.IssuanceStatus.CHANGES_REQUIRED,
            ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED,
            ComplianceEarnedCredit.IssuanceStatus.APPROVED,
        ],
    )
    def test_can_handle_decreased_credits(self, issuance_status):
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

    def test_can_handle_returns_false_when_no_previous_credit(self):
        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            prev = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                credited_emissions=Decimal('600'),
                report_version=self.report_version_1,
            )
            new = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                credited_emissions=Decimal('500'),
                report_version=self.report_version_2,
            )
        baker.make_recipe(
            'compliance.tests.utils.compliance_report_version', report_compliance_summary=prev, is_supplementary=False
        )
        # NOTE: no ComplianceEarnedCredit created

        assert DecreasedCreditHandler.can_handle(new, prev) is False

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

    def test_handle_approved_prior_credit_marks_manual_handling_and_keeps_approved_credit(self):
        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            prev = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                credited_emissions=Decimal('600'),
                report_version=self.report_version_1,
            )
            new = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                credited_emissions=Decimal('500'),
                report_version=self.report_version_2,
            )

        prev_crv = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version', report_compliance_summary=prev, is_supplementary=False
        )
        approved = baker.make_recipe(
            'compliance.tests.utils.compliance_earned_credit',
            compliance_report_version=prev_crv,
            earned_credits_amount=600,
            issuance_status=ComplianceEarnedCredit.IssuanceStatus.APPROVED,
            bccr_trading_name="Test Trading Name",
            bccr_holding_account_id="123",
        )

        new_crv = DecreasedCreditHandler.handle(prev_crv.compliance_report, new, prev, 2)

        assert isinstance(new_crv, ComplianceReportVersion)
        assert new_crv.previous_version == prev_crv
        assert new_crv.is_supplementary is True

        approved.refresh_from_db()
        assert approved.issuance_status == ComplianceEarnedCredit.IssuanceStatus.APPROVED
        assert ComplianceEarnedCredit.objects.count() == 1  # no new credit created

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
