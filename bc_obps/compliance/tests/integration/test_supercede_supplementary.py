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
)

pytestmark = pytest.mark.django_db


class TestSupercedeSupplementary(ComplianceIntegrationTestBase):

    REPORTING_YEAR = 2025

    # ------------------------------------------------------------------
    # Common assertions
    # ------------------------------------------------------------------

    def _assert_initial_crv_superceded(self):
        self.initial_crv.refresh_from_db()
        assert self.initial_crv.status == ComplianceReportVersion.ComplianceStatus.SUPERCEDED

    def _get_new_supplementary_crv(self):
        return ComplianceReportVersion.objects.get(
            compliance_report=self.compliance_report,
            is_supplementary=True,
        )

    def _assert_common_supercede_outcomes(self, new_crv):
        assert new_crv.previous_version == self.initial_crv
        assert ComplianceReportVersion.objects.filter(compliance_report=self.compliance_report).count() == 2

    # ------------------------------------------------------------------
    # Test 1: Obligation -> Earned Credits
    # ------------------------------------------------------------------

    @patch(SEND_NO_OBLIGATION_EMAIL)
    @patch(SEND_EARNED_CREDITS_EMAIL)
    @patch(SEND_OBLIGATION_EMAIL)
    @patch(HANDLE_OBLIGATION_INTEGRATION)
    def test_supercede_obligation_to_earned_credits(
        self, mock_elicensing, _mock_obl_email, _mock_ec_email, _mock_no_obl_email
    ):
        """Supplementary report changes obligation to earned credits.

        Initial: excess_emissions=100, OBLIGATION_PENDING_INVOICE_CREATION
        Supplementary: credited_emissions=100, excess_emissions=0
        Expected: initial CRV SUPERCEDED, old obligation deleted,
                  new CRV EARNED_CREDITS, new earned credit created.
        """
        mock_elicensing.side_effect = self.fake_handle_obligation_pre_invoice

        self._create_base_infrastructure()
        self._create_initial_report_with_obligation_pre_invoice(Decimal("100"))
        self._submit_supplementary_report(
            excess_emissions=Decimal("0"),
            credited_emissions=Decimal("100"),
        )

        self._assert_initial_crv_superceded()

        # Old obligation deleted
        assert not ComplianceObligation.objects.filter(compliance_report_version=self.initial_crv).exists()

        # New supplementary CRV
        new_crv = self._get_new_supplementary_crv()
        assert new_crv.status == ComplianceReportVersion.ComplianceStatus.EARNED_CREDITS
        self._assert_common_supercede_outcomes(new_crv)

        # New earned credit record
        new_ec = ComplianceEarnedCredit.objects.get(compliance_report_version=new_crv)
        assert new_ec.earned_credits_amount == 100
        assert new_ec.issuance_status == ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED

        # No obligation on new CRV
        assert not ComplianceObligation.objects.filter(compliance_report_version=new_crv).exists()

        # handle_obligation_integration called only for initial (not supplementary)
        assert mock_elicensing.call_count == 1

    # ------------------------------------------------------------------
    # Test 2: Obligation -> No Obligation or Earned Credits
    # ------------------------------------------------------------------

    @patch(SEND_NO_OBLIGATION_EMAIL)
    @patch(SEND_EARNED_CREDITS_EMAIL)
    @patch(SEND_OBLIGATION_EMAIL)
    @patch(HANDLE_OBLIGATION_INTEGRATION)
    def test_supercede_obligation_to_no_obligation_or_earned_credits(
        self, mock_elicensing, _mock_obl_email, _mock_ec_email, _mock_no_obl_email
    ):
        """Supplementary report changes obligation to no obligation or earned credits.

        Initial: excess_emissions=100, OBLIGATION_PENDING_INVOICE_CREATION
        Supplementary: excess_emissions=0, credited_emissions=0
        Expected: initial CRV SUPERCEDED, old obligation deleted,
                  new CRV NO_OBLIGATION_OR_EARNED_CREDITS, no new records.
        """
        mock_elicensing.side_effect = self.fake_handle_obligation_pre_invoice

        self._create_base_infrastructure()
        self._create_initial_report_with_obligation_pre_invoice(Decimal("100"))
        self._submit_supplementary_report(
            excess_emissions=Decimal("0"),
            credited_emissions=Decimal("0"),
        )

        self._assert_initial_crv_superceded()

        # Old obligation deleted
        assert not ComplianceObligation.objects.filter(compliance_report_version=self.initial_crv).exists()

        # New supplementary CRV
        new_crv = self._get_new_supplementary_crv()
        assert new_crv.status == ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS
        self._assert_common_supercede_outcomes(new_crv)

        # No obligation or earned credit on new CRV
        assert not ComplianceObligation.objects.filter(compliance_report_version=new_crv).exists()
        assert not ComplianceEarnedCredit.objects.filter(compliance_report_version=new_crv).exists()

        # handle_obligation_integration called only for initial
        assert mock_elicensing.call_count == 1

    # ------------------------------------------------------------------
    # Test 3: Increases Obligation (via supercede path)
    # ------------------------------------------------------------------

    @patch(SEND_NO_OBLIGATION_EMAIL)
    @patch(SEND_EARNED_CREDITS_EMAIL)
    @patch(SEND_OBLIGATION_EMAIL)
    @patch(HANDLE_OBLIGATION_INTEGRATION)
    def test_supercede_increases_obligation(self, mock_elicensing, _mock_obl_email, _mock_ec_email, _mock_no_obl_email):
        """Supplementary report increases obligation (supercede path, no invoice yet).

        Initial: excess_emissions=100, OBLIGATION_PENDING_INVOICE_CREATION
        Supplementary: excess_emissions=200, credited_emissions=0
        Expected: initial CRV SUPERCEDED, old obligation deleted,
                  new CRV OBLIGATION_PENDING_INVOICE_CREATION,
                  new obligation for full 200 tCO2e.
        """
        mock_elicensing.side_effect = self.fake_handle_obligation_pre_invoice

        self._create_base_infrastructure()
        self._create_initial_report_with_obligation_pre_invoice(Decimal("100"))
        self._submit_supplementary_report(
            excess_emissions=Decimal("200"),
            credited_emissions=Decimal("0"),
        )

        self._assert_initial_crv_superceded()

        # Old obligation deleted
        assert not ComplianceObligation.objects.filter(compliance_report_version=self.initial_crv).exists()

        # New supplementary CRV
        new_crv = self._get_new_supplementary_crv()
        assert new_crv.status == ComplianceReportVersion.ComplianceStatus.OBLIGATION_PENDING_INVOICE_CREATION
        self._assert_common_supercede_outcomes(new_crv)

        # New obligation for full amount (supercede creates obligation for new_summary.excess_emissions, not delta)
        new_obligation = ComplianceObligation.objects.get(compliance_report_version=new_crv)
        expected_fee = Decimal("200") * self.charge_rate  # 8000.00
        assert new_obligation.fee_amount_dollars == expected_fee
        assert new_obligation.elicensing_invoice is None

        # No earned credit on new CRV
        assert not ComplianceEarnedCredit.objects.filter(compliance_report_version=new_crv).exists()

        # handle_obligation_integration called for initial + supplementary
        assert mock_elicensing.call_count == 2

    # ------------------------------------------------------------------
    # Test 4: Decreases Obligation (via supercede path)
    # ------------------------------------------------------------------

    @patch(SEND_NO_OBLIGATION_EMAIL)
    @patch(SEND_EARNED_CREDITS_EMAIL)
    @patch(SEND_OBLIGATION_EMAIL)
    @patch(HANDLE_OBLIGATION_INTEGRATION)
    def test_supercede_decreases_obligation(self, mock_elicensing, _mock_obl_email, _mock_ec_email, _mock_no_obl_email):
        """Supplementary report decreases obligation (supercede path, no invoice yet).

        Initial: excess_emissions=200, OBLIGATION_PENDING_INVOICE_CREATION
        Supplementary: excess_emissions=100, credited_emissions=0
        Expected: initial CRV SUPERCEDED, old obligation deleted,
                  new CRV OBLIGATION_PENDING_INVOICE_CREATION,
                  new obligation for 100 tCO2e.
        """
        mock_elicensing.side_effect = self.fake_handle_obligation_pre_invoice

        self._create_base_infrastructure()
        self._create_initial_report_with_obligation_pre_invoice(Decimal("200"))
        self._submit_supplementary_report(
            excess_emissions=Decimal("100"),
            credited_emissions=Decimal("0"),
        )

        self._assert_initial_crv_superceded()

        # Old obligation deleted
        assert not ComplianceObligation.objects.filter(compliance_report_version=self.initial_crv).exists()

        # New supplementary CRV
        new_crv = self._get_new_supplementary_crv()
        assert new_crv.status == ComplianceReportVersion.ComplianceStatus.OBLIGATION_PENDING_INVOICE_CREATION
        self._assert_common_supercede_outcomes(new_crv)

        # New obligation for decreased amount
        new_obligation = ComplianceObligation.objects.get(compliance_report_version=new_crv)
        expected_fee = Decimal("100") * self.charge_rate  # 4000.00
        assert new_obligation.fee_amount_dollars == expected_fee
        assert new_obligation.elicensing_invoice is None

        # handle_obligation_integration called for initial + supplementary
        assert mock_elicensing.call_count == 2

    # ------------------------------------------------------------------
    # Test 5: Earned Credits -> No Obligation or Earned Credits
    # ------------------------------------------------------------------

    @patch(SEND_NO_OBLIGATION_EMAIL)
    @patch(SEND_EARNED_CREDITS_EMAIL)
    @patch(SEND_OBLIGATION_EMAIL)
    @patch(HANDLE_OBLIGATION_INTEGRATION)
    def test_supercede_earned_credits_to_no_obligation_or_earned_credits(
        self, mock_elicensing, _mock_obl_email, _mock_ec_email, _mock_no_obl_email
    ):
        """Supplementary report changes earned credits to no obligation or earned credits.

        Initial: credited_emissions=100, EARNED_CREDITS, CREDITS_NOT_ISSUED
        Supplementary: credited_emissions=0, excess_emissions=0
        Expected: initial CRV SUPERCEDED, old earned credit deleted,
                  new CRV NO_OBLIGATION_OR_EARNED_CREDITS.
        """
        self._create_base_infrastructure()
        self._create_initial_report_with_earned_credits(Decimal("100"))
        self._submit_supplementary_report(
            excess_emissions=Decimal("0"),
            credited_emissions=Decimal("0"),
        )

        self._assert_initial_crv_superceded()

        # Old earned credit deleted
        assert not ComplianceEarnedCredit.objects.filter(compliance_report_version=self.initial_crv).exists()

        # New supplementary CRV
        new_crv = self._get_new_supplementary_crv()
        assert new_crv.status == ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS
        self._assert_common_supercede_outcomes(new_crv)

        # No obligation or earned credit on new CRV
        assert not ComplianceObligation.objects.filter(compliance_report_version=new_crv).exists()
        assert not ComplianceEarnedCredit.objects.filter(compliance_report_version=new_crv).exists()

        # handle_obligation_integration should NOT be called (no obligation involved)
        mock_elicensing.assert_not_called()

    # ------------------------------------------------------------------
    # Test 6: Earned Credits -> Obligation
    # ------------------------------------------------------------------

    @patch(SEND_NO_OBLIGATION_EMAIL)
    @patch(SEND_EARNED_CREDITS_EMAIL)
    @patch(SEND_OBLIGATION_EMAIL)
    @patch(HANDLE_OBLIGATION_INTEGRATION)
    def test_supercede_earned_credits_to_obligation(
        self, mock_elicensing, _mock_obl_email, _mock_ec_email, _mock_no_obl_email
    ):
        """Supplementary report changes earned credits to obligation.

        Initial: credited_emissions=100, EARNED_CREDITS, CREDITS_NOT_ISSUED
        Supplementary: excess_emissions=100, credited_emissions=0
        Expected: initial CRV SUPERCEDED, old earned credit deleted,
                  new CRV OBLIGATION_PENDING_INVOICE_CREATION,
                  new obligation for 100 tCO2e.
        """
        mock_elicensing.side_effect = self.fake_handle_obligation_pre_invoice

        self._create_base_infrastructure()
        self._create_initial_report_with_earned_credits(Decimal("100"))
        self._submit_supplementary_report(
            excess_emissions=Decimal("100"),
            credited_emissions=Decimal("0"),
        )

        self._assert_initial_crv_superceded()

        # Old earned credit deleted
        assert not ComplianceEarnedCredit.objects.filter(compliance_report_version=self.initial_crv).exists()

        # New supplementary CRV
        new_crv = self._get_new_supplementary_crv()
        assert new_crv.status == ComplianceReportVersion.ComplianceStatus.OBLIGATION_PENDING_INVOICE_CREATION
        self._assert_common_supercede_outcomes(new_crv)

        # New obligation exists
        new_obligation = ComplianceObligation.objects.get(compliance_report_version=new_crv)
        expected_fee = Decimal("100") * self.charge_rate  # 4000.00
        assert new_obligation.fee_amount_dollars == expected_fee
        assert new_obligation.elicensing_invoice is None

        # No earned credit on new CRV
        assert not ComplianceEarnedCredit.objects.filter(compliance_report_version=new_crv).exists()

        # handle_obligation_integration called once for supplementary only
        assert mock_elicensing.call_count == 1
