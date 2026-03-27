from decimal import Decimal
import pytest
import common.lib.pgtrigger as pgtrigger
from model_bakery import baker
from compliance.models import ComplianceEarnedCredit, ComplianceReportVersion
from reporting.models import ReportVersion
from registration.models import Operation
from unittest.mock import MagicMock, patch
from compliance.service.supplementary_version_service.supercede_version_handler import SupercedeVersionHandler
from compliance.tests.service.supplementary_version_service.utils import BaseSupplementaryVersionServiceTest

pytestmark = pytest.mark.django_db(transaction=True)

_IS_INVOICE_DATE_REACHED = "compliance.service.elicensing.elicensing_obligation_service.ElicensingObligationService._is_invoice_generation_date_reached"
_SUPERCEDE = "compliance.service.supplementary_version_service.supercede_version_handler"


@pytest.fixture
def before_invoice_date():
    with patch(_IS_INVOICE_DATE_REACHED, return_value=False):
        yield


@pytest.fixture
def after_invoice_date():
    with patch(_IS_INVOICE_DATE_REACHED, return_value=True):
        yield


@pytest.fixture
def run_on_commit_immediately():
    with patch("django.db.transaction.on_commit", side_effect=lambda fn: fn()):
        yield


@pytest.fixture
def mock_create_obligation():
    with patch(f"{_SUPERCEDE}.ComplianceObligationService.create_compliance_obligation") as mock:
        mock.return_value = MagicMock(id=999)
        yield mock


@pytest.fixture
def mock_handle_integration():
    with patch(
        "compliance.service.elicensing.elicensing_obligation_service.ElicensingObligationService.handle_obligation_integration"
    ) as mock:

        def fake_integration(obligation_id, compliance_period):
            version = ComplianceReportVersion.objects.order_by('-id').first()
            version.status = ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET
            version.save(update_fields=["status"])

        mock.side_effect = fake_integration
        yield mock


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
        mock_create_obligation,
        mock_handle_integration,
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
            self.previous_compliance_report_version.compliance_report,
            self.new_summary,
            self.previous_summary,
            2,
        )

        self.previous_compliance_report_version.refresh_from_db()
        new_compliance_version.refresh_from_db()

        # Assert
        assert new_compliance_version.status == ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET
        assert self.previous_compliance_report_version.status == ComplianceReportVersion.ComplianceStatus.SUPERCEDED
        assert new_compliance_version.report_compliance_summary_id == self.new_summary.id
        assert new_compliance_version.is_supplementary is True
        assert new_compliance_version.previous_version == self.previous_compliance_report_version
