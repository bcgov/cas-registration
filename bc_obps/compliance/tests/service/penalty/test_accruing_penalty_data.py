from datetime import date
from decimal import Decimal
from unittest.mock import patch
import pytest
from model_bakery import baker
from compliance.dataclass import RefreshWrapperReturn
from compliance.models import ComplianceObligation, CompliancePenalty, ComplianceReportVersion
from compliance.service.penalty_calculation_service import PenaltyCalculationService

pytestmark = pytest.mark.django_db

REFRESH_WRAPPER_PATH = (
    'compliance.service.elicensing.elicensing_data_refresh_service.'
    'ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id'
)


class TestGetAccruingPenaltyData:
    def setup_method(self):
        self.compliance_report_version = baker.make_recipe("compliance.tests.utils.compliance_report_version")
        self.invoice = baker.make_recipe(
            "compliance.tests.utils.elicensing_invoice",
            due_date=date(2025, 7, 30),
            outstanding_balance=Decimal("1000000.00"),
            invoice_interest_balance=Decimal("1000.00"),
        )
        baker.make_recipe(
            "compliance.tests.utils.elicensing_line_item",
            elicensing_invoice=self.invoice,
            base_amount=Decimal("1000000.00"),
        )
        self.obligation = baker.make_recipe(
            "compliance.tests.utils.compliance_obligation",
            compliance_report_version=self.compliance_report_version,
            elicensing_invoice=self.invoice,
            fee_amount_dollars=Decimal("1000000.00"),
            penalty_status=ComplianceObligation.PenaltyStatus.ACCRUING,
        )

    def _mock_refresh(self, mock_refresh_data):
        mock_refresh_data.return_value = RefreshWrapperReturn(data_is_fresh=True, invoice=self.invoice)

    @patch(REFRESH_WRAPPER_PATH)
    def test_returns_accruing_automatic_overdue_penalty(self, mock_refresh_data):
        self._mock_refresh(mock_refresh_data)

        result = PenaltyCalculationService.get_accruing_penalty_data(self.compliance_report_version.id)

        assert result["automatic_overdue_penalty_amount"] > Decimal('0.00')
        assert result["faa_interest"] == Decimal('1000.00')
        # Not a late supplementary report, so no GGEAPAR interest is accruing
        assert result["ggeapar_interest_amount"] == Decimal('0.00')

    @patch(REFRESH_WRAPPER_PATH)
    def test_returns_zeros_when_penalty_not_accruing(self, mock_refresh_data):
        self._mock_refresh(mock_refresh_data)
        self.obligation.penalty_status = ComplianceObligation.PenaltyStatus.NONE
        self.obligation.save()

        result = PenaltyCalculationService.get_accruing_penalty_data(self.compliance_report_version.id)

        assert result["automatic_overdue_penalty_amount"] == Decimal('0.00')
        assert result["ggeapar_interest_amount"] == Decimal('0.00')
        # FAA interest is still reported so the page can display it
        assert result["faa_interest"] == Decimal('1000.00')

    @patch(REFRESH_WRAPPER_PATH)
    def test_returns_zero_faa_interest_when_none_accrued(self, mock_refresh_data):
        self.invoice.invoice_interest_balance = Decimal("0.00")
        self.invoice.save()
        self._mock_refresh(mock_refresh_data)

        result = PenaltyCalculationService.get_accruing_penalty_data(self.compliance_report_version.id)

        assert result["faa_interest"] == Decimal('0.00')

    @patch(REFRESH_WRAPPER_PATH)
    def test_returns_ggeapar_interest_for_late_supplementary_report(self, mock_refresh_data):
        self._mock_refresh(mock_refresh_data)
        baker.make_recipe(
            "compliance.tests.utils.elicensing_interest_rate",
            start_date=date(2024, 1, 1),
            end_date=date(2026, 12, 31),
            interest_rate=Decimal("0.0800"),
        )
        self.compliance_report_version.is_supplementary = True
        self.compliance_report_version.save()

        result = PenaltyCalculationService.get_accruing_penalty_data(self.compliance_report_version.id)

        assert result["ggeapar_interest_amount"] > Decimal('0.00')

    @patch(REFRESH_WRAPPER_PATH)
    def test_still_reports_penalty_once_it_has_maxed_out(self, mock_refresh_data):
        """
        A penalty that reached 3x the obligation stops accruing and is invoiced, which takes the
        obligation out of ACCRUING. The invoiced amount must still be reported while the obligation is
        outstanding, otherwise the penalty disappears from the page the moment it becomes payable
        """
        self._mock_refresh(mock_refresh_data)
        self.obligation.penalty_status = ComplianceObligation.PenaltyStatus.NOT_PAID
        self.obligation.save(update_fields=["penalty_status"])
        # Deliberately not 3x the obligation, which is what a live calculation would cap at, so that
        # this only passes if the stored penalty is read rather than the penalty being recalculated
        baker.make_recipe(
            "compliance.tests.utils.compliance_penalty",
            compliance_obligation=self.obligation,
            penalty_type=CompliancePenalty.PenaltyType.AUTOMATIC_OVERDUE,
            penalty_amount=Decimal("2500000.00"),
        )

        result = PenaltyCalculationService.get_accruing_penalty_data(self.compliance_report_version.id)

        assert result["automatic_overdue_penalty_amount"] == Decimal("2500000.00")

    @patch(REFRESH_WRAPPER_PATH)
    def test_ggeapar_interest_keeps_accruing_after_the_penalty_maxes_out(self, mock_refresh_data):
        self._mock_refresh(mock_refresh_data)
        baker.make_recipe(
            "compliance.tests.utils.elicensing_interest_rate",
            start_date=date(2024, 1, 1),
            end_date=date(2026, 12, 31),
            interest_rate=Decimal("0.0800"),
        )
        self.compliance_report_version.is_supplementary = True
        self.compliance_report_version.save()
        self.obligation.penalty_status = ComplianceObligation.PenaltyStatus.NOT_PAID
        self.obligation.save(update_fields=["penalty_status"])
        baker.make_recipe(
            "compliance.tests.utils.compliance_penalty",
            compliance_obligation=self.obligation,
            penalty_type=CompliancePenalty.PenaltyType.AUTOMATIC_OVERDUE,
            penalty_amount=Decimal("3000000.00"),
        )

        result = PenaltyCalculationService.get_accruing_penalty_data(self.compliance_report_version.id)

        assert result["ggeapar_interest_amount"] > Decimal("0.00")

    @patch(REFRESH_WRAPPER_PATH)
    def test_does_not_report_penalty_once_the_obligation_is_met(self, mock_refresh_data):
        self._mock_refresh(mock_refresh_data)
        self.compliance_report_version.status = ComplianceReportVersion.ComplianceStatus.OBLIGATION_FULLY_MET
        self.compliance_report_version.save()
        self.obligation.penalty_status = ComplianceObligation.PenaltyStatus.NOT_PAID
        self.obligation.save(update_fields=["penalty_status"])
        baker.make_recipe(
            "compliance.tests.utils.compliance_penalty",
            compliance_obligation=self.obligation,
            penalty_type=CompliancePenalty.PenaltyType.AUTOMATIC_OVERDUE,
            penalty_amount=Decimal("3000000.00"),
        )

        result = PenaltyCalculationService.get_accruing_penalty_data(self.compliance_report_version.id)

        assert result["automatic_overdue_penalty_amount"] == Decimal("0.00")
