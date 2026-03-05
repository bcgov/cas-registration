import pytest
from decimal import Decimal
from unittest.mock import patch
from compliance.models import (
    ComplianceEarnedCredit,
    ComplianceObligation,
    ComplianceReportVersion,
)
from compliance.tests.integration.utils import (
    ComplianceIntegrationTestBase,
    HANDLE_OBLIGATION_INTEGRATION,
    SEND_OBLIGATION_EMAIL,
    SEND_EARNED_CREDITS_EMAIL,
    SEND_NO_OBLIGATION_EMAIL,
    REFRESH_DATA,
    CREATE_ADJUSTMENT,
)

# transaction=True so DecreasedObligationHandler's on_commit callbacks fire
pytestmark = pytest.mark.django_db(transaction=True)


class TestVoidSupplementary(ComplianceIntegrationTestBase):

    REPORTING_YEAR = 2024

    # ------------------------------------------------------------------
    # Test 1: Full decrease, single invoice, no payments -> void + fully met
    # ------------------------------------------------------------------

    @patch(CREATE_ADJUSTMENT)
    @patch(SEND_NO_OBLIGATION_EMAIL)
    @patch(SEND_EARNED_CREDITS_EMAIL)
    @patch(SEND_OBLIGATION_EMAIL)
    @patch(REFRESH_DATA)
    @patch(HANDLE_OBLIGATION_INTEGRATION)
    def test_full_decrease_no_payments_voids_invoice(
        self, mock_elicensing, mock_refresh, _mock_obl_email, _mock_ec_email, _mock_no_obl_email, mock_adjustment
    ):
        """Full decrease (200->0), single invoice, no payments.

        Expected:
        - DecreasedObligationHandler selected (SupercedeVersionHandler can't handle: invoice exists)
        - Adjustment of -$8000 applied
        - Invoice voided (outstanding reached $0, no payments)
        - Previous CRV marked OBLIGATION_FULLY_MET
        - No manual handling
        """
        mock_elicensing.side_effect = self.fake_handle_obligation_post_invoice
        mock_refresh.side_effect = self.fake_refresh

        self._create_base_infrastructure()
        self._create_initial_report_with_obligation_post_invoice(Decimal("200"))

        self._submit_supplementary_report(excess_emissions=Decimal("0"))

        # New supplementary CRV created
        new_crv = ComplianceReportVersion.objects.get(
            compliance_report=self.compliance_report,
            is_supplementary=True,
        )
        assert new_crv.status == ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS
        assert new_crv.previous_version == self.initial_crv

        # Adjustment service called with correct amount
        mock_adjustment.assert_called_once()
        call_kwargs = mock_adjustment.call_args.kwargs
        expected_adjustment = Decimal("200") * self.charge_rate
        assert call_kwargs["adjustment_total"] == -expected_adjustment
        assert call_kwargs["target_compliance_report_version_id"] == self.initial_crv.id

        # Invoice voided
        self.initial_obligation.elicensing_invoice.refresh_from_db()
        assert self.initial_obligation.elicensing_invoice.is_void is True

        # Previous CRV marked OBLIGATION_FULLY_MET
        self.initial_crv.refresh_from_db()
        assert self.initial_crv.status == ComplianceReportVersion.ComplianceStatus.OBLIGATION_FULLY_MET

        # No earned credits created
        assert ComplianceEarnedCredit.objects.count() == 0

    # ------------------------------------------------------------------
    # Test 2: Full decrease, multiple invoices, no payments -> void all
    # ------------------------------------------------------------------

    @patch(CREATE_ADJUSTMENT)
    @patch(SEND_NO_OBLIGATION_EMAIL)
    @patch(SEND_EARNED_CREDITS_EMAIL)
    @patch(SEND_OBLIGATION_EMAIL)
    @patch(REFRESH_DATA)
    @patch(HANDLE_OBLIGATION_INTEGRATION)
    def test_full_decrease_multiple_invoices_voids_all(
        self, mock_elicensing, mock_refresh, _mock_obl_email, _mock_ec_email, _mock_no_obl_email, mock_adjustment
    ):
        """Full decrease (300->0), two invoices, no payments.

        Chain:
          CRV1 (initial, 200 excess) -> invoice1 ($8,000)
          CRV2 (supp increase, 100 delta) -> invoice2 ($4,000)
          CRV3 (supp decrease to 0) -> voids invoice2 then invoice1

        Expected:
        - Refund pool = 300 * rate = $12,000
        - invoice2 ($4,000) fully cleared first -> voided, CRV2 OBLIGATION_FULLY_MET
        - invoice1 ($8,000) cleared with remaining $8,000 -> voided, CRV1 OBLIGATION_FULLY_MET
        - Two adjustments posted (one per invoice)
        - No manual handling
        """
        mock_elicensing.side_effect = self.fake_handle_obligation_post_invoice
        mock_refresh.side_effect = self.fake_refresh

        self._create_base_infrastructure()

        # CRV1: initial report, 200 excess -> invoice1 ($8,000)
        self._create_initial_report_with_obligation_post_invoice(Decimal("200"))

        # CRV2: supplementary increases to 300 -> IncreasedObligationHandler
        # Creates obligation for delta (100 tCO2e) and invoice2 ($4,000)
        supp1_rv = self._submit_supplementary_report(excess_emissions=Decimal("300"))
        supp1_crv = ComplianceReportVersion.objects.get(
            compliance_report=self.compliance_report,
            is_supplementary=True,
        )
        supp1_obligation = ComplianceObligation.objects.get(compliance_report_version=supp1_crv)
        assert supp1_obligation.elicensing_invoice is not None

        # CRV3: supplementary decreases to 0 -> DecreasedObligationHandler voids both
        self._submit_supplementary_report(excess_emissions=Decimal("0"), previous_report_version=supp1_rv)

        final_crv = ComplianceReportVersion.objects.get(
            compliance_report=self.compliance_report,
            previous_version=supp1_crv,
        )
        assert final_crv.status == ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS

        # Two adjustments: one for invoice2 (-$4,000), one for invoice1 (-$8,000)
        assert mock_adjustment.call_count == 2
        all_kwargs = [call.kwargs for call in mock_adjustment.call_args_list]
        applied_by_version = {kw["target_compliance_report_version_id"]: kw["adjustment_total"] for kw in all_kwargs}
        assert applied_by_version[supp1_crv.id] == -(Decimal("100") * self.charge_rate)
        assert applied_by_version[self.initial_crv.id] == -(Decimal("200") * self.charge_rate)

        # Both invoices voided
        supp1_obligation.elicensing_invoice.refresh_from_db()
        assert supp1_obligation.elicensing_invoice.is_void is True

        self.initial_obligation.elicensing_invoice.refresh_from_db()
        assert self.initial_obligation.elicensing_invoice.is_void is True

        # Both previous CRVs marked OBLIGATION_FULLY_MET
        supp1_crv.refresh_from_db()
        assert supp1_crv.status == ComplianceReportVersion.ComplianceStatus.OBLIGATION_FULLY_MET

        self.initial_crv.refresh_from_db()
        assert self.initial_crv.status == ComplianceReportVersion.ComplianceStatus.OBLIGATION_FULLY_MET

        # No earned credits created
        assert ComplianceEarnedCredit.objects.count() == 0

    # ------------------------------------------------------------------
    # Test 3: Full decrease voids multiple invoices, no payments, then earned credits created
    # ------------------------------------------------------------------

    @patch(CREATE_ADJUSTMENT)
    @patch(SEND_NO_OBLIGATION_EMAIL)
    @patch(SEND_EARNED_CREDITS_EMAIL)
    @patch(SEND_OBLIGATION_EMAIL)
    @patch(REFRESH_DATA)
    @patch(HANDLE_OBLIGATION_INTEGRATION)
    def test_full_decrease_multiple_invoices_then_earned_credits(
        self, mock_elicensing, mock_refresh, _mock_obl_email, _mock_ec_email, _mock_no_obl_email, mock_adjustment
    ):
        """Full decrease voids two invoices, then a follow-up supplementary creates earned credits.

        Chain:
          CRV1 (initial, 200 excess) -> invoice1 ($8,000)
          CRV2 (supp increase, 100 delta) -> invoice2 ($4,000)
          CRV3 (supp decrease to 0) -> voids invoice2 + invoice1, NO_OBLIGATION_OR_EARNED_CREDITS
          CRV4 (supp with credits) -> NewEarnedCreditsHandler, EARNED_CREDITS

        Expected after CRV3:
        - Both invoices voided (same as test 2)
        Expected after CRV4:
        - New CRV status = EARNED_CREDITS
        - ComplianceEarnedCredit created with correct amount, CREDITS_NOT_ISSUED
        - No new adjustments from step 4
        """
        mock_elicensing.side_effect = self.fake_handle_obligation_post_invoice
        mock_refresh.side_effect = self.fake_refresh

        self._create_base_infrastructure()

        # CRV1 + CRV2: same multi-invoice setup as test 2
        self._create_initial_report_with_obligation_post_invoice(Decimal("200"))

        supp1_rv = self._submit_supplementary_report(excess_emissions=Decimal("300"))
        supp1_crv = ComplianceReportVersion.objects.get(
            compliance_report=self.compliance_report,
            is_supplementary=True,
        )
        supp1_obligation = ComplianceObligation.objects.get(compliance_report_version=supp1_crv)

        # CRV3: void both invoices
        supp2_rv = self._submit_supplementary_report(excess_emissions=Decimal("0"), previous_report_version=supp1_rv)
        supp2_crv = ComplianceReportVersion.objects.get(
            compliance_report=self.compliance_report,
            previous_version=supp1_crv,
        )

        # Confirm voids happened
        supp1_obligation.elicensing_invoice.refresh_from_db()
        assert supp1_obligation.elicensing_invoice.is_void is True
        self.initial_obligation.elicensing_invoice.refresh_from_db()
        assert self.initial_obligation.elicensing_invoice.is_void is True

        # CRV4: follow-up supplementary triggers NewEarnedCreditsHandler
        # previous: excess=0, credited=0 -> new: excess=0, credited=50
        self._submit_supplementary_report(
            excess_emissions=Decimal("0"),
            credited_emissions=Decimal("50"),
            previous_report_version=supp2_rv,
        )

        earned_credits_crv = ComplianceReportVersion.objects.get(
            compliance_report=self.compliance_report,
            previous_version=supp2_crv,
        )
        assert earned_credits_crv.status == ComplianceReportVersion.ComplianceStatus.EARNED_CREDITS

        ec = ComplianceEarnedCredit.objects.get(compliance_report_version=earned_credits_crv)
        assert ec.earned_credits_amount == 50
        assert ec.issuance_status == ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED

        # Step 4 (earned credits) does not post any new adjustments
        assert mock_adjustment.call_count == 2  # only the 2 from CRV3

    # ------------------------------------------------------------------
    # Test 4: Single supplementary decreases excess to 0 AND introduces
    #         credited emissions -> void invoice + earned credits in one step
    # ------------------------------------------------------------------

    @patch(CREATE_ADJUSTMENT)
    @patch(SEND_NO_OBLIGATION_EMAIL)
    @patch(SEND_EARNED_CREDITS_EMAIL)
    @patch(SEND_OBLIGATION_EMAIL)
    @patch(REFRESH_DATA)
    @patch(HANDLE_OBLIGATION_INTEGRATION)
    def test_decrease_to_zero_with_credited_emissions_voids_invoice_and_creates_earned_credits(
        self, mock_elicensing, mock_refresh, _mock_obl_email, _mock_ec_email, _mock_no_obl_email, mock_adjustment
    ):
        """Single supplementary reduces excess to 0 and introduces credited emissions.

        Chain:
          CRV1 (initial, 200 excess) -> invoice1 ($8,000)
          CRV2 (supp: excess=0, credited=50) -> DecreasedObligationHandler:
            - voids invoice1 (fully met, no payments)
            - creates earned credits for 50 tCO2e from the same CRV
            - CRV2 status = EARNED_CREDITS

        Expected:
        - DecreasedObligationHandler selected (excess decreased, invoice exists)
        - Adjustment of -$8,000 applied
        - invoice1 voided
        - CRV1 marked OBLIGATION_FULLY_MET
        - New CRV status = EARNED_CREDITS
        - ComplianceEarnedCredit created with amount=50, CREDITS_NOT_ISSUED
        """
        mock_elicensing.side_effect = self.fake_handle_obligation_post_invoice
        mock_refresh.side_effect = self.fake_refresh

        self._create_base_infrastructure()
        self._create_initial_report_with_obligation_post_invoice(Decimal("200"))

        # Single supplementary: excess 200->0, credited 0->50
        self._submit_supplementary_report(
            excess_emissions=Decimal("0"),
            credited_emissions=Decimal("50"),
        )

        new_crv = ComplianceReportVersion.objects.get(
            compliance_report=self.compliance_report,
            is_supplementary=True,
        )

        # CRV status updated to EARNED_CREDITS after on_commit
        assert new_crv.status == ComplianceReportVersion.ComplianceStatus.EARNED_CREDITS
        assert new_crv.previous_version == self.initial_crv

        # Adjustment applied for the full 200 tCO2e
        mock_adjustment.assert_called_once()
        call_kwargs = mock_adjustment.call_args.kwargs
        expected_adjustment = Decimal("200") * self.charge_rate
        assert call_kwargs["adjustment_total"] == -expected_adjustment
        assert call_kwargs["target_compliance_report_version_id"] == self.initial_crv.id

        # Invoice voided
        self.initial_obligation.elicensing_invoice.refresh_from_db()
        assert self.initial_obligation.elicensing_invoice.is_void is True

        # Previous CRV marked OBLIGATION_FULLY_MET
        self.initial_crv.refresh_from_db()
        assert self.initial_crv.status == ComplianceReportVersion.ComplianceStatus.OBLIGATION_FULLY_MET

        # Earned credits created on the same CRV (not a separate supplementary)
        ec = ComplianceEarnedCredit.objects.get(compliance_report_version=new_crv)
        assert ec.earned_credits_amount == 50
        assert ec.issuance_status == ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED
