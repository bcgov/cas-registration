import pytest
from decimal import Decimal
from unittest.mock import patch
from compliance.models import (
    ComplianceEarnedCredit,
    ComplianceReportVersion,
    ComplianceReportVersionManualHandling,
    ElicensingLineItem,
    ElicensingPayment,
)
from compliance.tests.integration.utils import (
    ComplianceIntegrationTestBase,
    HANDLE_OBLIGATION_INTEGRATION,
    REFRESH_DATA,
    SEND_OBLIGATION_EMAIL,
    SEND_EARNED_CREDITS_EMAIL,
    SEND_NO_OBLIGATION_EMAIL,
)

ON_COMMIT_PATH = "django.db.transaction.on_commit"
CREATE_ADJUSTMENT_PATH = (
    "compliance.service.compliance_adjustment_service"
    ".ComplianceAdjustmentService.create_adjustment_for_target_version"
)

pytestmark = pytest.mark.django_db


class TestManualHandlingSupplementary(ComplianceIntegrationTestBase):
    REPORTING_YEAR = 2024

    def _approve_initial_earned_credits(self):
        """Simulate credit approval."""
        self.initial_earned_credit.issuance_status = ComplianceEarnedCredit.IssuanceStatus.APPROVED
        self.initial_earned_credit.bccr_trading_name = "Test Trading Name"
        self.initial_earned_credit.bccr_holding_account_id = "TEST-001"
        self.initial_earned_credit.save(
            update_fields=["issuance_status", "bccr_trading_name", "bccr_holding_account_id"]
        )

    # ------------------------------------------------------------------
    # Scenario 1: Excess emissions decrease after invoice has been paid
    # ------------------------------------------------------------------

    @patch(SEND_NO_OBLIGATION_EMAIL)
    @patch(SEND_OBLIGATION_EMAIL)
    @patch(CREATE_ADJUSTMENT_PATH)
    @patch(ON_COMMIT_PATH)
    @patch(REFRESH_DATA)
    @patch(HANDLE_OBLIGATION_INTEGRATION)
    def test_decreased_obligation_paid_invoice_creates_manual_handling(
        self, mock_elicensing, mock_refresh, mock_on_commit, _mock_create_adj, _mock_obl_email, _mock_no_obl_email
    ):
        """Excess emissions decrease when invoice has been partially paid with cash.

        Routing:
        - ManualHandler: no manual handling on initial CRV → can't handle
        - SupercedeVersionHandler: invoice exists (not pre-invoice) → can't handle
        - DecreasedObligationHandler: excess decreased + unpaid invoice + cash paid → CAN handle

        Setup:
        - Initial: 10 excess emissions, invoice created with outstanding = full fee
        - Half the fee is paid in cash; outstanding_balance is reduced to half
        - Supplementary: 0 excess → refund_pool = full fee > outstanding (half fee)
          → obligation fully paid AND leftover refund > 0 AND has_cash → manual handling

        Expected:
        - New CRV with NO_OBLIGATION_OR_EARNED_CREDITS status
        - Previous CRV marked OBLIGATION_FULLY_MET
        - ManualHandling record created with handling_type=OBLIGATION,
          context=OBLIGATION_REFUND_POOL_CASH
        """
        mock_elicensing.side_effect = self.fake_handle_obligation_post_invoice
        mock_refresh.side_effect = self.fake_refresh
        mock_on_commit.side_effect = lambda fn: fn()

        self._create_base_infrastructure()
        self._create_initial_report_with_obligation_post_invoice(Decimal("10"))

        invoice = self.initial_obligation.elicensing_invoice
        fee = invoice.outstanding_balance
        partial_payment = (fee / 2).quantize(Decimal("0.01"))
        invoice.outstanding_balance = fee - partial_payment
        invoice.save(update_fields=["outstanding_balance"])

        fee_line_item = ElicensingLineItem.objects.get(
            elicensing_invoice=invoice,
            line_item_type=ElicensingLineItem.LineItemType.FEE,
        )
        ElicensingPayment.objects.create(
            payment_object_id=self.initial_obligation.id,
            elicensing_line_item=fee_line_item,
            amount=partial_payment,
        )

        self._submit_supplementary_report(
            excess_emissions=Decimal("0"),
            previous_report_version=self.initial_report_version,
        )

        supp_crv = ComplianceReportVersion.objects.get(
            compliance_report=self.compliance_report,
            is_supplementary=True,
        )
        assert supp_crv.status == ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS
        assert supp_crv.previous_version == self.initial_crv

        manual_handling = ComplianceReportVersionManualHandling.objects.get(compliance_report_version=supp_crv)
        assert manual_handling.handling_type == ComplianceReportVersionManualHandling.HandlingType.OBLIGATION
        assert manual_handling.context == ComplianceReportVersionManualHandling.Context.OBLIGATION_REFUND_POOL_CASH
        assert manual_handling.director_decision == (
            ComplianceReportVersionManualHandling.DirectorDecision.PENDING_MANUAL_HANDLING
        )

        self.initial_crv.refresh_from_db()
        assert self.initial_crv.status == ComplianceReportVersion.ComplianceStatus.OBLIGATION_FULLY_MET

    # ------------------------------------------------------------------
    # Scenario 2: Credited emissions decrease after credits have been approved
    # ------------------------------------------------------------------

    @patch(SEND_NO_OBLIGATION_EMAIL)
    @patch(SEND_EARNED_CREDITS_EMAIL)
    @patch(SEND_OBLIGATION_EMAIL)
    @patch(HANDLE_OBLIGATION_INTEGRATION)
    def test_decreased_credits_approved_creates_manual_handling(
        self, _mock_elicensing, _mock_obl_email, _mock_ec_email, _mock_no_obl_email
    ):
        """Credited emissions decrease when credits are APPROVED.

        Routing:
        - ManualHandler: no manual handling on initial CRV → can't handle
        - SupercedeVersionHandler: issuance_status is APPROVED (not CREDITS_NOT_ISSUED) → can't handle
        - DecreasedCreditHandler: credited decreased + previous credit exists → CAN handle (APPROVED branch)

        Expected:
        - New CRV with EARNED_CREDITS status
        - ManualHandling record created with handling_type=EARNED_CREDITS,
          context=EARNED_CREDITS_PREVIOUSLY_APPROVED
        - Previous earned credit NOT modified (stays APPROVED)
        """
        self._create_base_infrastructure()
        self._create_initial_report_with_earned_credits(Decimal("100"))
        self._approve_initial_earned_credits()

        self._submit_supplementary_report(
            excess_emissions=Decimal("0"),
            credited_emissions=Decimal("50"),
            previous_report_version=self.initial_report_version,
        )

        supp_crv = ComplianceReportVersion.objects.get(
            compliance_report=self.compliance_report,
            is_supplementary=True,
        )
        assert supp_crv.status == ComplianceReportVersion.ComplianceStatus.EARNED_CREDITS
        assert supp_crv.previous_version == self.initial_crv

        manual_handling = ComplianceReportVersionManualHandling.objects.get(compliance_report_version=supp_crv)
        assert manual_handling.handling_type == ComplianceReportVersionManualHandling.HandlingType.EARNED_CREDITS
        assert (
            manual_handling.context == ComplianceReportVersionManualHandling.Context.EARNED_CREDITS_PREVIOUSLY_APPROVED
        )
        assert manual_handling.director_decision == (
            ComplianceReportVersionManualHandling.DirectorDecision.PENDING_MANUAL_HANDLING
        )

        self.initial_earned_credit.refresh_from_db()
        assert self.initial_earned_credit.issuance_status == ComplianceEarnedCredit.IssuanceStatus.APPROVED
