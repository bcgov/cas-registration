from decimal import Decimal
from compliance.models import (
    ComplianceReportVersion,
    ComplianceEarnedCredit,
    ComplianceReportVersionManualHandling,
)
from reporting.models import ReportVersion
from compliance.service.supplementary_version_service import IncreasedCreditHandler
import pytest
from unittest.mock import patch
from model_bakery import baker
import common.lib.pgtrigger as pgtrigger
from registration.models import Operation

pytestmark = pytest.mark.django_db(transaction=True)

SUPPLEMENTARY_VERSION_SERVICE_PATH = "compliance.service.supplementary_version_service"
HAS_RESOLVED_MANUAL_HANDLING_PATH = (
    f"{SUPPLEMENTARY_VERSION_SERVICE_PATH}.SupplementaryVersionService._has_resolved_manual_handling"
)


@pytest.fixture
def mock_has_resolved_manual_handling():
    with patch(HAS_RESOLVED_MANUAL_HANDLING_PATH) as mock:
        yield mock


@pytest.mark.django_db
class BaseIncreasedCreditHandlerTest:
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


class TestIncreasedCreditHandler(BaseIncreasedCreditHandlerTest):
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
    def test_can_handle_all_statuses(self, issuance_status, mock_has_resolved_manual_handling):
        mock_has_resolved_manual_handling.return_value = False
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

    def test_can_handle_multiple_supplementary_reports(self, mock_has_resolved_manual_handling):
        mock_has_resolved_manual_handling.return_value = False
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

    def test_handle_increased_credits_success_when_credits_approved(self, mock_has_resolved_manual_handling):
        mock_has_resolved_manual_handling.return_value = False
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
    def test_handle_increased_credits_success_when_credits_not_approved(
        self, issuance_status, mock_has_resolved_manual_handling
    ):
        mock_has_resolved_manual_handling.return_value = False
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

        earned_credit.refresh_from_db()
        assert earned_credit.issuance_status == ComplianceEarnedCredit.IssuanceStatus.DECLINED
        assert earned_credit.earned_credits_amount == Decimal('600')
        assert ComplianceEarnedCredit.objects.last().earned_credits_amount == Decimal('800')

    def test_handle_increased_credits_success_when_credits_not_requested(self, mock_has_resolved_manual_handling):
        mock_has_resolved_manual_handling.return_value = False
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

    def test_handle_increased_credits_success_when_previous_version_has_resolved_manual_handling(
        self,
        mock_has_resolved_manual_handling,
    ):
        mock_has_resolved_manual_handling.return_value = True
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
            is_supplementary=True,
            compliance_report=self.compliance_report,
        )
        baker.make_recipe(
            'compliance.tests.utils.compliance_report_version_manual_handling',
            compliance_report_version=self.previous_compliance_report_version,
            handling_type=ComplianceReportVersionManualHandling.HandlingType.EARNED_CREDITS,
            context=ComplianceReportVersionManualHandling.Context.EARNED_CREDITS_PREVIOUSLY_APPROVED,
            director_decision=ComplianceReportVersionManualHandling.DirectorDecision.ISSUE_RESOLVED,
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
        assert ComplianceEarnedCredit.objects.count() == 1
        assert ComplianceEarnedCredit.objects.last().earned_credits_amount == Decimal('200')
