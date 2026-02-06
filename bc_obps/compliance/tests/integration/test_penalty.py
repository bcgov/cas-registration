import pytest
import uuid
from datetime import date, datetime, timedelta
from decimal import Decimal
from unittest.mock import patch
from django.utils import timezone
from model_bakery.baker import make_recipe
from common.lib import pgtrigger
from compliance.models import (
    ComplianceObligation,
    CompliancePenalty,
    CompliancePenaltyAccrual,
    ComplianceReportVersion,
    ElicensingClientOperator,
    ElicensingInterestRate,
    ElicensingInvoice,
    ElicensingLineItem,
    ElicensingPayment,
)
from compliance.service.automated_process.compliance_handlers import ComplianceHandlerManager
from compliance.signals.consumers import handle_report_submission
from compliance.tests.integration.utils import (
    ComplianceIntegrationTestBase,
    HANDLE_OBLIGATION_INTEGRATION,
    SEND_OBLIGATION_EMAIL,
    SEND_OBLIGATION_MET_EMAIL,
    REFRESH_DATA,
    CREATE_PENALTY_INVOICE,
)
from reporting.models import ReportVersion

pytestmark = pytest.mark.django_db


class TestPenalty(ComplianceIntegrationTestBase):
    """
    Integration tests for penalty creation through the full
    signal -> obligation -> invoice -> payment -> penalty chain.

    Tests exercise the connection between ObligationPaidHandler and
    PenaltyCalculationService, which are always tested in isolation
    in unit tests (ObligationPaidHandler mocks PenaltyCalculationService,
    PenaltyCalculationService mocks ElicensingDataRefreshService).
    """

    REPORTING_YEAR = 2024
    COMPLIANCE_DEADLINE = date(2025, 11, 30)
    OBLIGATION_CREATED_DATE = date(2025, 12, 5)  # 5 days after deadline
    INVOICE_DUE_DATE = date(2026, 1, 4)  # created_at + 30 days

    PAYMENT_DATE_BEFORE_DUE = date(2025, 12, 10)  # Before due date (within 30 days)
    PAYMENT_DATE_AFTER_DUE = date(2026, 1, 10)  # After due date (after 30 days)

    # ------------------------------------------------------------------
    # Infrastructure
    # ------------------------------------------------------------------

    def _create_base_infrastructure(self):
        super()._create_base_infrastructure()

        # Override compliance deadline to our test date
        self.compliance_period.compliance_deadline = self.COMPLIANCE_DEADLINE
        self.compliance_period.save(update_fields=["compliance_deadline"])

        ElicensingInterestRate.objects.create(
            interest_rate=Decimal("0.080000"),  # 8% annual (prime + 3%)
            start_date=date(2025, 1, 1),
            end_date=date(2025, 12, 14),
            is_current_rate=False,
        )
        ElicensingInterestRate.objects.create(
            interest_rate=Decimal("0.080000"),
            start_date=date(2025, 12, 15),
            end_date=date(2026, 12, 31),
            is_current_rate=True,
        )

    # ------------------------------------------------------------------
    # Mock implementations
    # ------------------------------------------------------------------

    @staticmethod
    def _fake_create_penalty_invoice(obligation, total_penalty, final_accrual_date, penalty_type=None):
        """Create a local penalty invoice record (no eLicensing API call)."""
        client_operator = ElicensingClientOperator.objects.get(
            operator=obligation.compliance_report_version.compliance_report.report.operator
        )
        return ElicensingInvoice.objects.create(
            elicensing_client_operator=client_operator,
            invoice_number=f"PENALTY-{uuid.uuid4().hex[:8]}",
            due_date=final_accrual_date + timedelta(days=30),
            outstanding_balance=total_penalty,
            invoice_fee_balance=total_penalty,
            invoice_interest_balance=Decimal("0.00"),
            is_void=False,
            last_refreshed=timezone.now(),
        )

    # ------------------------------------------------------------------
    # Signal helpers
    # ------------------------------------------------------------------

    def _submit_supplementary_with_increased_obligation(self, new_excess_emissions):
        """Submit supplementary report with higher emissions.

        Routes to IncreasedObligationHandler because:
        - ManualHandler: no manual handling record -> can't handle
        - SupercedeVersionHandler: initial obligation HAS an invoice -> can't handle
        - IncreasedObligationHandler: new excess > previous excess -> CAN handle

        After this method:
        - self.supplementary_crv has status OBLIGATION_NOT_MET
        - self.supplementary_obligation has an eLicensing invoice linked
        """
        self.initial_report_version.status = ReportVersion.ReportVersionStatus.Submitted
        self.initial_report_version.save()

        self.supplementary_report_version = make_recipe(
            "reporting.tests.utils.report_version",
            report=self.report,
        )
        make_recipe(
            "reporting.tests.utils.report_compliance_summary",
            report_version=self.supplementary_report_version,
            excess_emissions=new_excess_emissions,
            credited_emissions=Decimal("0"),
        )

        handle_report_submission(
            sender=self.__class__,
            version_id=self.supplementary_report_version.id,
        )

        self.supplementary_crv = ComplianceReportVersion.objects.get(
            compliance_report=self.compliance_report,
            is_supplementary=True,
        )
        assert self.supplementary_crv.status == ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET
        self.supplementary_obligation = ComplianceObligation.objects.get(
            compliance_report_version=self.supplementary_crv
        )
        assert self.supplementary_obligation.elicensing_invoice is not None

    # ------------------------------------------------------------------
    # Date / payment helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _set_obligation_dates(obligation, created_at_date, invoice_due_date):
        """Override obligation.created_at and invoice.due_date for testing."""
        with pgtrigger.ignore("compliance.ComplianceObligation:set_updated_audit_columns"):
            obligation.created_at = timezone.make_aware(
                datetime(created_at_date.year, created_at_date.month, created_at_date.day)
            )
            obligation.save(update_fields=["created_at"])
        invoice = obligation.elicensing_invoice
        invoice.due_date = invoice_due_date
        invoice.save(update_fields=["due_date"])

    @staticmethod
    def _create_payment_and_mark_paid(obligation, amount, received_date):
        """Create payment record and set invoice outstanding_balance to 0."""
        line_item = ElicensingLineItem.objects.get(
            elicensing_invoice=obligation.elicensing_invoice,
            line_item_type=ElicensingLineItem.LineItemType.FEE,
        )
        ElicensingPayment.objects.create(
            payment_object_id=obligation.id,
            elicensing_line_item=line_item,
            amount=amount,
            received_date=received_date,
        )
        invoice = obligation.elicensing_invoice
        invoice.outstanding_balance = Decimal("0.00")
        invoice.save(update_fields=["outstanding_balance"])

    # ------------------------------------------------------------------
    # Test 1: Non-supplementary, paid before due date
    # ------------------------------------------------------------------

    @patch(SEND_OBLIGATION_MET_EMAIL)
    @patch(CREATE_PENALTY_INVOICE)
    @patch(REFRESH_DATA)
    @patch(SEND_OBLIGATION_EMAIL)
    @patch(HANDLE_OBLIGATION_INTEGRATION)
    def test_non_supplementary_paid_before_due_date(
        self, mock_elicensing, _mock_obl_email, mock_refresh, mock_penalty_invoice, _mock_met_email
    ):
        """Non-supplementary report submitted after deadline, paid before invoice due date.

        Expected: automatic overdue penalty only, no late submission penalty.
        Accrual period: compliance_deadline+1 (Dec 1) to payment_date (Dec 10) = 10 days.
        """
        mock_elicensing.side_effect = self.fake_handle_obligation_post_invoice
        mock_refresh.side_effect = self.fake_refresh
        mock_penalty_invoice.side_effect = self._fake_create_penalty_invoice

        self._create_base_infrastructure()
        self._create_initial_report_with_obligation_post_invoice(Decimal("100"))

        # Set dates: obligation created after deadline
        self._set_obligation_dates(
            self.initial_obligation,
            created_at_date=self.OBLIGATION_CREATED_DATE,
            invoice_due_date=self.INVOICE_DUE_DATE,
        )

        # Pay before due date
        self._create_payment_and_mark_paid(
            self.initial_obligation,
            amount=self.initial_obligation.fee_amount_dollars,
            received_date=self.PAYMENT_DATE_BEFORE_DUE,
        )

        # Process compliance updates (simulates eLicensing data refresh)
        manager = ComplianceHandlerManager()
        manager.process_compliance_updates(self.initial_obligation.elicensing_invoice)

        # CRV status updated to OBLIGATION_FULLY_MET
        self.initial_crv.refresh_from_db()
        assert self.initial_crv.status == ComplianceReportVersion.ComplianceStatus.OBLIGATION_FULLY_MET

        # Automatic overdue penalty created
        auto_penalty = CompliancePenalty.objects.get(
            compliance_obligation=self.initial_obligation,
            penalty_type=CompliancePenalty.PenaltyType.AUTOMATIC_OVERDUE,
        )
        assert auto_penalty.status == CompliancePenalty.Status.NOT_PAID
        assert auto_penalty.accrual_start_date == self.COMPLIANCE_DEADLINE + timedelta(days=1)
        assert auto_penalty.accrual_final_date == self.PAYMENT_DATE_BEFORE_DUE
        assert auto_penalty.penalty_amount > Decimal("0")

        # Accrual records created (one per day of accrual)
        expected_days = (self.PAYMENT_DATE_BEFORE_DUE - self.COMPLIANCE_DEADLINE).days  # 10 days
        assert CompliancePenaltyAccrual.objects.filter(compliance_penalty=auto_penalty).count() == expected_days

        # No late submission penalty (non-supplementary never gets late submission penalty)
        assert not CompliancePenalty.objects.filter(
            compliance_obligation=self.initial_obligation,
            penalty_type=CompliancePenalty.PenaltyType.LATE_SUBMISSION,
        ).exists()

        # Obligation penalty_status updated to NOT_PAID
        self.initial_obligation.refresh_from_db()
        assert self.initial_obligation.penalty_status == ComplianceObligation.PenaltyStatus.NOT_PAID

    # ------------------------------------------------------------------
    # Test 2: Non-supplementary, paid after due date
    # ------------------------------------------------------------------

    @patch(SEND_OBLIGATION_MET_EMAIL)
    @patch(CREATE_PENALTY_INVOICE)
    @patch(REFRESH_DATA)
    @patch(SEND_OBLIGATION_EMAIL)
    @patch(HANDLE_OBLIGATION_INTEGRATION)
    def test_non_supplementary_paid_after_due_date(
        self, mock_elicensing, _mock_obl_email, mock_refresh, mock_penalty_invoice, _mock_met_email
    ):
        """Non-supplementary report submitted after deadline, paid after invoice due date.

        Expected: automatic overdue penalty with longer accrual, no late submission penalty.
        Accrual period: compliance_deadline+1 (Dec 1) to payment_date (Jan 10) = 41 days.
        """
        mock_elicensing.side_effect = self.fake_handle_obligation_post_invoice
        mock_refresh.side_effect = self.fake_refresh
        mock_penalty_invoice.side_effect = self._fake_create_penalty_invoice

        self._create_base_infrastructure()
        self._create_initial_report_with_obligation_post_invoice(Decimal("100"))

        self._set_obligation_dates(
            self.initial_obligation,
            created_at_date=self.OBLIGATION_CREATED_DATE,
            invoice_due_date=self.INVOICE_DUE_DATE,
        )

        # Pay after due date (longer accrual period)
        self._create_payment_and_mark_paid(
            self.initial_obligation,
            amount=self.initial_obligation.fee_amount_dollars,
            received_date=self.PAYMENT_DATE_AFTER_DUE,
        )

        manager = ComplianceHandlerManager()
        manager.process_compliance_updates(self.initial_obligation.elicensing_invoice)

        self.initial_crv.refresh_from_db()
        assert self.initial_crv.status == ComplianceReportVersion.ComplianceStatus.OBLIGATION_FULLY_MET

        auto_penalty = CompliancePenalty.objects.get(
            compliance_obligation=self.initial_obligation,
            penalty_type=CompliancePenalty.PenaltyType.AUTOMATIC_OVERDUE,
        )
        assert auto_penalty.status == CompliancePenalty.Status.NOT_PAID
        assert auto_penalty.accrual_start_date == self.COMPLIANCE_DEADLINE + timedelta(days=1)
        assert auto_penalty.accrual_final_date == self.PAYMENT_DATE_AFTER_DUE
        assert auto_penalty.penalty_amount > Decimal("0")

        expected_days = (self.PAYMENT_DATE_AFTER_DUE - self.COMPLIANCE_DEADLINE).days  # 41 days
        assert CompliancePenaltyAccrual.objects.filter(compliance_penalty=auto_penalty).count() == expected_days

        # Longer accrual period should produce a larger penalty
        fee = self.initial_obligation.fee_amount_dollars
        assert auto_penalty.penalty_amount > fee * Decimal("0.01")

        # No late submission penalty
        assert not CompliancePenalty.objects.filter(
            compliance_obligation=self.initial_obligation,
            penalty_type=CompliancePenalty.PenaltyType.LATE_SUBMISSION,
        ).exists()

        self.initial_obligation.refresh_from_db()
        assert self.initial_obligation.penalty_status == ComplianceObligation.PenaltyStatus.NOT_PAID

    # ------------------------------------------------------------------
    # Test 3: Supplementary, paid before due date
    # ------------------------------------------------------------------

    @patch(SEND_OBLIGATION_MET_EMAIL)
    @patch(CREATE_PENALTY_INVOICE)
    @patch(REFRESH_DATA)
    @patch(SEND_OBLIGATION_EMAIL)
    @patch(HANDLE_OBLIGATION_INTEGRATION)
    def test_supplementary_paid_before_due_date(
        self, mock_elicensing, _mock_obl_email, mock_refresh, mock_penalty_invoice, _mock_met_email
    ):
        """Supplementary report submitted after deadline, paid before invoice due date.

        Expected: late submission penalty only.
        No automatic overdue penalty because for supplementary reports the
        effective_deadline is the invoice.due_date, and payment was received
        before that date.

        Late submission accrual: compliance_deadline+1 (Dec 1) to payment_date (Dec 10) = 10 days.
        """
        mock_elicensing.side_effect = self.fake_handle_obligation_post_invoice
        mock_refresh.side_effect = self.fake_refresh
        mock_penalty_invoice.side_effect = self._fake_create_penalty_invoice

        self._create_base_infrastructure()
        self._create_initial_report_with_obligation_post_invoice(Decimal("100"))

        # Submit supplementary with increased emissions (routes to IncreasedObligationHandler)
        self._submit_supplementary_with_increased_obligation(Decimal("200"))

        # Set supplementary obligation dates: created after deadline
        self._set_obligation_dates(
            self.supplementary_obligation,
            created_at_date=self.OBLIGATION_CREATED_DATE,
            invoice_due_date=self.INVOICE_DUE_DATE,
        )

        # Pay before due date
        self._create_payment_and_mark_paid(
            self.supplementary_obligation,
            amount=self.supplementary_obligation.fee_amount_dollars,
            received_date=self.PAYMENT_DATE_BEFORE_DUE,
        )

        manager = ComplianceHandlerManager()
        manager.process_compliance_updates(self.supplementary_obligation.elicensing_invoice)

        self.supplementary_crv.refresh_from_db()
        assert self.supplementary_crv.status == ComplianceReportVersion.ComplianceStatus.OBLIGATION_FULLY_MET

        # Late submission penalty created
        late_penalty = CompliancePenalty.objects.get(
            compliance_obligation=self.supplementary_obligation,
            penalty_type=CompliancePenalty.PenaltyType.LATE_SUBMISSION,
        )
        assert late_penalty.status == CompliancePenalty.Status.NOT_PAID
        assert late_penalty.penalty_amount > Decimal("0")

        # Late submission accrual records
        expected_late_days = (self.PAYMENT_DATE_BEFORE_DUE - self.COMPLIANCE_DEADLINE).days  # 10 days
        assert CompliancePenaltyAccrual.objects.filter(compliance_penalty=late_penalty).count() == expected_late_days

        # No automatic overdue penalty (payment before effective_deadline = invoice.due_date)
        assert not CompliancePenalty.objects.filter(
            compliance_obligation=self.supplementary_obligation,
            penalty_type=CompliancePenalty.PenaltyType.AUTOMATIC_OVERDUE,
        ).exists()

        self.supplementary_obligation.refresh_from_db()
        assert self.supplementary_obligation.penalty_status == ComplianceObligation.PenaltyStatus.NOT_PAID

    # ------------------------------------------------------------------
    # Test 4: Supplementary, paid after due date
    # ------------------------------------------------------------------

    @patch(SEND_OBLIGATION_MET_EMAIL)
    @patch(CREATE_PENALTY_INVOICE)
    @patch(REFRESH_DATA)
    @patch(SEND_OBLIGATION_EMAIL)
    @patch(HANDLE_OBLIGATION_INTEGRATION)
    def test_supplementary_paid_after_due_date(
        self, mock_elicensing, _mock_obl_email, mock_refresh, mock_penalty_invoice, _mock_met_email
    ):
        """Supplementary report submitted after deadline, paid after invoice due date.

        Expected: BOTH late submission AND automatic overdue penalties.
        Late submission accrual: compliance_deadline+1 (Dec 1) to payment_date (Jan 10) = 41 days.
        Automatic overdue accrual: invoice.due_date+1 (Jan 5) to payment_date (Jan 10) = 6 days.
        """
        mock_elicensing.side_effect = self.fake_handle_obligation_post_invoice
        mock_refresh.side_effect = self.fake_refresh
        mock_penalty_invoice.side_effect = self._fake_create_penalty_invoice

        self._create_base_infrastructure()
        self._create_initial_report_with_obligation_post_invoice(Decimal("100"))

        self._submit_supplementary_with_increased_obligation(Decimal("200"))

        self._set_obligation_dates(
            self.supplementary_obligation,
            created_at_date=self.OBLIGATION_CREATED_DATE,
            invoice_due_date=self.INVOICE_DUE_DATE,
        )

        # Pay after due date
        self._create_payment_and_mark_paid(
            self.supplementary_obligation,
            amount=self.supplementary_obligation.fee_amount_dollars,
            received_date=self.PAYMENT_DATE_AFTER_DUE,
        )

        manager = ComplianceHandlerManager()
        manager.process_compliance_updates(self.supplementary_obligation.elicensing_invoice)

        self.supplementary_crv.refresh_from_db()
        assert self.supplementary_crv.status == ComplianceReportVersion.ComplianceStatus.OBLIGATION_FULLY_MET

        # Late submission penalty created
        late_penalty = CompliancePenalty.objects.get(
            compliance_obligation=self.supplementary_obligation,
            penalty_type=CompliancePenalty.PenaltyType.LATE_SUBMISSION,
        )
        assert late_penalty.status == CompliancePenalty.Status.NOT_PAID
        assert late_penalty.penalty_amount > Decimal("0")

        expected_late_days = (self.PAYMENT_DATE_AFTER_DUE - self.COMPLIANCE_DEADLINE).days  # 41 days
        assert CompliancePenaltyAccrual.objects.filter(compliance_penalty=late_penalty).count() == expected_late_days

        # Automatic overdue penalty created
        auto_penalty = CompliancePenalty.objects.get(
            compliance_obligation=self.supplementary_obligation,
            penalty_type=CompliancePenalty.PenaltyType.AUTOMATIC_OVERDUE,
        )
        assert auto_penalty.status == CompliancePenalty.Status.NOT_PAID
        assert auto_penalty.accrual_start_date == self.INVOICE_DUE_DATE + timedelta(days=1)
        assert auto_penalty.accrual_final_date == self.PAYMENT_DATE_AFTER_DUE
        assert auto_penalty.penalty_amount > Decimal("0")

        expected_auto_days = (self.PAYMENT_DATE_AFTER_DUE - self.INVOICE_DUE_DATE).days  # 6 days
        assert CompliancePenaltyAccrual.objects.filter(compliance_penalty=auto_penalty).count() == expected_auto_days

        # Both penalties exist for this obligation
        assert CompliancePenalty.objects.filter(compliance_obligation=self.supplementary_obligation).count() == 2

        self.supplementary_obligation.refresh_from_db()
        assert self.supplementary_obligation.penalty_status == ComplianceObligation.PenaltyStatus.NOT_PAID
