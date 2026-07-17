from decimal import Decimal
import pytest
import common.lib.pgtrigger as pgtrigger
from model_bakery import baker
from compliance.models import ComplianceReportVersion, ElicensingInvoice
from compliance.models.compliance_report_version_manual_handling import ComplianceReportVersionManualHandling
from compliance.models.elicensing_adjustment import ElicensingAdjustment
from unittest.mock import MagicMock, patch
from compliance.service.supplementary_version_service.decreased_obligation_handler import DecreasedObligationHandler
from compliance.tests.service.supplementary_version_service.utils import (
    BaseSupplementaryVersionServiceTest,
    ZERO_DECIMAL,
)

pytestmark = pytest.mark.django_db(transaction=True)

_DEC_OBL = "compliance.service.supplementary_version_service.decreased_obligation_handler"


@pytest.fixture
def mock_fallback_invoice_filter():
    with patch(f"{_DEC_OBL}.ElicensingInvoice.objects.filter") as mock_filter:
        fake_qs = MagicMock()
        fake_invoice = MagicMock()
        fake_qs.prefetch_related.return_value = [fake_invoice]
        mock_filter.return_value = fake_qs
        yield mock_filter


@pytest.fixture
def mock_sum_invoice_cash():
    with patch(f"{_DEC_OBL}.DecreasedObligationHandler._sum_invoice_cash_payments") as mock:
        yield mock


@pytest.fixture
def mock_sum_already_applied():
    with patch(
        f"{_DEC_OBL}.DecreasedObligationHandler._sum_already_applied_supplementary_adjustments_since_anchor"
    ) as mock:
        yield mock


@pytest.fixture
def mock_collect_unpaid():
    with patch(f"{_DEC_OBL}.DecreasedObligationHandler._collect_unpaid_obligations_for_crv_chain_newest_first") as mock:
        yield mock


@pytest.fixture
def mock_void_invoices():
    with patch(f"{_DEC_OBL}.DecreasedObligationHandler._void_unpaid_invoices") as mock:
        yield mock


@pytest.fixture
def mock_mark_fully_met():
    with patch(f"{_DEC_OBL}.DecreasedObligationHandler._mark_previous_version_fully_met") as mock:
        yield mock


@pytest.fixture
def run_on_commit_immediately():
    with patch("django.db.transaction.on_commit", side_effect=lambda fn: fn()):
        yield


@pytest.fixture
def mock_create_adjustment():
    with patch(
        "compliance.service.compliance_adjustment_service.ComplianceAdjustmentService.create_adjustment_for_target_version"
    ) as mock:
        yield mock


@pytest.fixture
def mock_get_rate():
    with patch(
        "compliance.service.compliance_charge_rate_service.ComplianceChargeRateService.get_rate_for_year"
    ) as mock:
        yield mock


@pytest.fixture
def mock_find_newest_unpaid_anchor():
    with patch(f"{_DEC_OBL}.DecreasedObligationHandler._find_newest_unpaid_anchor_along_chain") as mock:
        yield mock


@pytest.fixture
def mock_find_newest_non_void_prior_invoices():
    with patch(f"{_DEC_OBL}.DecreasedObligationHandler._find_newest_non_void_prior_invoices") as mock:
        yield mock


@pytest.fixture
def mock_record_manual_handling():
    with patch(f"{_DEC_OBL}.DecreasedObligationHandler._record_manual_handling") as mock:
        yield mock


@pytest.fixture
def mock_create_earned_credits():
    with patch(
        "compliance.service.earned_credits_service.ComplianceEarnedCreditsService.create_earned_credits_record"
    ) as mock:
        yield mock


@pytest.fixture(autouse=True)
def mock_is_credit_usage_over_cap():
    with patch(
        "compliance.service.bc_carbon_registry.apply_compliance_units_service.ApplyComplianceUnitsService.is_credit_usage_over_cap",
        return_value=False,
    ) as mock:
        yield mock


class TestDecreasedObligationHandler(BaseSupplementaryVersionServiceTest):
    """
    Unit tests for DecreasedObligationHandler.

    Grouped by purpose:
      - can_handle_* : Eligibility logic (whether the handler should run)
      - handle_* : Behavioral logic (effects on invoices, refunds, manual handling)
      - helper_* : Internal helper methods
    """

    # -------------------------------------------------------------------
    # can_handle tests
    # -------------------------------------------------------------------

    def test_can_handle__when_excess_emissions_decrease__returns_true(self):
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

        # Act
        result = DecreasedObligationHandler.can_handle(self.new_summary, self.previous_summary)

        # Assert
        assert result is True

    def test_can_handle__when_excess_emissions_drop_to_zero__returns_true(self):
        # Arrange
        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            self.previous_summary = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('300'),
                credited_emissions=0,
                report_version=self.report_version_1,
            )
        self.new_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('0'),
            credited_emissions=0,
            report_version=self.report_version_2,
        )

        # Act
        result = DecreasedObligationHandler.can_handle(self.new_summary, self.previous_summary)

        # Assert
        assert result is True

    def test_can_handle__when_excess_emissions_remain_zero_returns__false(self):
        # Arrange
        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            self.previous_summary = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('0'),
                credited_emissions=0,
                report_version=self.report_version_1,
            )
        self.new_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('0'),
            credited_emissions=0,
            report_version=self.report_version_2,
        )

        # Act
        result = DecreasedObligationHandler.can_handle(self.new_summary, self.previous_summary)

        # Assert
        assert result is False

    # -------------------------------------------------------------------
    # handle tests
    # -------------------------------------------------------------------

    # over-cap manual handling test
    def test_handle__decrease_pushes_credits_over_cap__flags_manual_handling(
        self,
        mock_find_newest_unpaid_anchor,
        mock_get_rate,
        mock_create_adjustment,
        mock_record_manual_handling,
        mock_collect_unpaid,
        mock_void_invoices,
        mock_mark_fully_met,
        mock_create_earned_credits,
        mock_is_credit_usage_over_cap,
        run_on_commit_immediately,
    ):
        """
        A decrease that leaves the applied compliance units over the (now-smaller) cap flags the
        supplementary CRV for manual handling with the CREDITS_OVER_ALLOWED_PERCENTAGE context.
        """
        mock_get_rate.return_value = Decimal("80.00")
        mock_is_credit_usage_over_cap.return_value = True

        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            prev_summary = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('800.0000'),
                credited_emissions=Decimal('0'),
                report_version=self.report_version_1,
            )
        new_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('700.0000'),  # ↓ 100 t -> partial refund, not fully met
            credited_emissions=Decimal('0'),
            report_version=self.report_version_2,
        )
        compliance_report = baker.make_recipe(
            'compliance.tests.utils.compliance_report', report=self.report, compliance_period_id=1
        )
        prev_crv = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=compliance_report,
            report_compliance_summary=prev_summary,
        )
        mock_find_newest_unpaid_anchor.return_value = prev_crv
        mock_collect_unpaid.return_value = [
            {
                "version_id": prev_crv.id,
                "invoice_id": 9999,
                "outstanding": Decimal("12000.00"),
                "paid": Decimal("0.00"),
                "prev_excess_emissions": Decimal("800.0000"),
            }
        ]

        # Act
        res = DecreasedObligationHandler.handle(compliance_report, new_summary, prev_summary, version_count=2)

        # Over cap -> manual handling flagged with the credits-over-cap context.
        mock_record_manual_handling.assert_called_once_with(
            res.id,
            context=ComplianceReportVersionManualHandling.Context.CREDITS_OVER_ALLOWED_PERCENTAGE,
        )
        mock_create_earned_credits.assert_not_called()

    # manual handling tests
    def test_handle__over_refund__invoices_with_cash__flags_manual_handling(
        self,
        mock_find_newest_unpaid_anchor,
        mock_get_rate,
        mock_create_adjustment,
        mock_record_manual_handling,
        mock_collect_unpaid,
        mock_void_invoices,
        mock_mark_fully_met,
        mock_sum_already_applied,
        mock_create_earned_credits,
        run_on_commit_immediately,
    ):
        """
        Over-refund with CASH present on all invoices:
        - Refund ($) > total outstanding → all invoices fully met.
        - CASH present → DO NOT void any invoice.
        - Leftover refund dollars exist AND cash_paid_total > 0
        → should_record_manual_handling == True -> manual handling record is created.
        """
        mock_get_rate.return_value = Decimal("80.00")  # $80/t
        mock_sum_already_applied.return_value = ZERO_DECIMAL  # nothing pre-applied since anchor

        # prev=900t, new=600t → delta -300t → refund $24,000
        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            prev = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('900.0000'),
                credited_emissions=0,
                report_version=self.report_version_1,
            )
        new = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('600.0000'),
            credited_emissions=0,
            report_version=self.report_version_2,
        )
        report = baker.make_recipe(
            'compliance.tests.utils.compliance_report', report=self.report, compliance_period_id=1
        )

        # Anchor (newest unpaid) + an older CRV
        anchor = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=report,
            report_compliance_summary=prev,
        )
        older = baker.make_recipe('compliance.tests.utils.compliance_report_version', compliance_report=report)
        mock_find_newest_unpaid_anchor.return_value = anchor

        # Total outstanding = 12,000 + 8,000 = 20,000
        # Total refund = 24,000 → leftover = 4,000
        # CASH paid total = 2,000 + 4,000 = 6,000 → refundable_dollars = min(4,000, 6,000) = 4,000 (> 0)
        mock_collect_unpaid.return_value = [
            {
                "version_id": anchor.id,
                "invoice_id": 111,
                "outstanding": Decimal("12000.00"),
                "paid": Decimal("2000.00"),  # CASH present -> no void
                "prev_excess_emissions": Decimal("900.0000"),
            },
            {
                "version_id": older.id,
                "invoice_id": 222,
                "outstanding": Decimal("8000.00"),
                "paid": Decimal("4000.00"),  # CASH present -> no void
                "prev_excess_emissions": Decimal("850.0000"),
            },
        ]

        # Act
        res = DecreasedObligationHandler.handle(report, new, prev, version_count=3)

        # Assert: new supplementary CRV is chained to anchor
        assert isinstance(res, ComplianceReportVersion)
        assert res.previous_version_id == anchor.id
        assert res.excess_emissions_delta_from_previous == Decimal("-300.0000")

        # Two adjustments for fully clearing both invoices: -12,000 and -8,000
        assert mock_create_adjustment.call_count == 2
        _, adj1 = mock_create_adjustment.call_args_list[0]
        _, adj2 = mock_create_adjustment.call_args_list[1]
        assert adj1["target_compliance_report_version_id"] == anchor.id
        assert adj1["supplementary_compliance_report_version_id"] == res.id
        assert adj1["adjustment_total"] == Decimal("-12000.00")
        assert adj2["target_compliance_report_version_id"] == older.id
        assert adj2["supplementary_compliance_report_version_id"] == res.id
        assert adj2["adjustment_total"] == Decimal("-8000.00")

        # Fully met on both; CASH present → DO NOT void any invoice
        mock_mark_fully_met.assert_any_call(anchor.id)
        mock_mark_fully_met.assert_any_call(older.id)
        assert mock_void_invoices.call_count == 0

        # Leftover refund dollars AND cash present across invoices → record manual handling
        mock_record_manual_handling.assert_called_once_with(
            res.id, context=ComplianceReportVersionManualHandling.Context.OBLIGATION_REFUND_POOL_CASH
        )

        # Placeholder status remains and no credits created
        mock_create_earned_credits.assert_not_called()
        refreshed = ComplianceReportVersion.objects.get(id=res.id)
        assert refreshed.status == ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS

    def test_handle__over_refund__invoices_no_cash__no_manual_handling__no_creates_earned_credits_from_leftover_refund(
        self,
        mock_find_newest_unpaid_anchor,
        mock_get_rate,
        mock_create_adjustment,
        mock_record_manual_handling,
        mock_collect_unpaid,
        mock_void_invoices,
        mock_mark_fully_met,
        mock_sum_already_applied,
        mock_create_earned_credits,
        run_on_commit_immediately,
    ):
        """
        Over-refund with NO CASH payments on any invoice:
        - Refund ($) > total outstanding → all invoices fully met.
        - No cash anywhere → void all fully met invoices.
        - cash_paid_total == 0 → refundable_dollars == 0 → should_record_manual_handling == False.
        """
        mock_get_rate.return_value = Decimal("80.00")
        mock_sum_already_applied.return_value = ZERO_DECIMAL

        # prev=900t, new=600t → delta -300t → refund $24,000
        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            prev = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('900.0000'),
                credited_emissions=0,
                report_version=self.report_version_1,
            )
        new = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('600.0000'),
            credited_emissions=0,
            report_version=self.report_version_2,
        )
        report = baker.make_recipe(
            'compliance.tests.utils.compliance_report', report=self.report, compliance_period_id=1
        )

        # Anchor + older CRV
        anchor = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=report,
            report_compliance_summary=prev,
        )
        older = baker.make_recipe('compliance.tests.utils.compliance_report_version', compliance_report=report)
        mock_find_newest_unpaid_anchor.return_value = anchor

        # Outstanding totals: 12,000 + 8,000 = 20,000
        # Refund = 24,000 → leftover 4,000 but cash sum = 0 → no manual handling
        mock_collect_unpaid.return_value = [
            {
                "version_id": anchor.id,
                "invoice_id": 111,
                "outstanding": Decimal("12000.00"),
                "paid": ZERO_DECIMAL,  # no cash → void allowed
                "prev_excess_emissions": Decimal("900.0000"),
            },
            {
                "version_id": older.id,
                "invoice_id": 222,
                "outstanding": Decimal("8000.00"),
                "paid": ZERO_DECIMAL,  # no cash → void allowed
                "prev_excess_emissions": Decimal("850.0000"),
            },
        ]

        # Act
        res = DecreasedObligationHandler.handle(report, new, prev, version_count=3)

        # Assert: CRV link + delta
        assert isinstance(res, ComplianceReportVersion)
        assert res.previous_version_id == anchor.id
        assert res.excess_emissions_delta_from_previous == Decimal("-300.0000")

        # Adjustments clear both invoices
        assert mock_create_adjustment.call_count == 2
        _, adj1 = mock_create_adjustment.call_args_list[0]
        _, adj2 = mock_create_adjustment.call_args_list[1]
        assert adj1["target_compliance_report_version_id"] == anchor.id
        assert adj1["supplementary_compliance_report_version_id"] == res.id
        assert adj1["adjustment_total"] == Decimal("-12000.00")
        assert adj2["target_compliance_report_version_id"] == older.id
        assert adj2["supplementary_compliance_report_version_id"] == res.id
        assert adj2["adjustment_total"] == Decimal("-8000.00")

        # Fully met + no cash → void both
        mock_mark_fully_met.assert_any_call(anchor.id)
        mock_mark_fully_met.assert_any_call(older.id)
        assert mock_void_invoices.call_count == 2

        # No cash across invoices → refundable_dollars == 0 → no manual handling record
        mock_record_manual_handling.assert_not_called()

        # Placeholder status remains and no credits created
        mock_create_earned_credits.assert_not_called()
        refreshed = ComplianceReportVersion.objects.get(id=res.id)
        assert refreshed.status == ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS

    def test_handle__over_refund__invoices_no_cash__no_manual_handling__creates_earned_credits_from_credited_emissions(
        self,
        mock_find_newest_unpaid_anchor,
        mock_get_rate,
        mock_create_adjustment,
        mock_record_manual_handling,
        mock_collect_unpaid,
        mock_void_invoices,
        mock_mark_fully_met,
        mock_sum_already_applied,
        mock_create_earned_credits,
        run_on_commit_immediately,
    ):
        """
        Over-refund with NO CASH and CREDITED EMISSIONS:
        - Refund ($) > total outstanding → all invoices fully met and voided.
        - no cash anywhere + fully paid → no manual handling.
        - credited_emissions > 0 → creates earned credits record.
        """
        mock_get_rate.return_value = Decimal("80.00")
        mock_sum_already_applied.return_value = ZERO_DECIMAL

        # prev=900t excess, new=0t excess + 100t credited
        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            prev = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('900.0000'),
                credited_emissions=ZERO_DECIMAL,
                report_version=self.report_version_1,
            )
        new = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=ZERO_DECIMAL,
            credited_emissions=Decimal('100.0000'),
            report_version=self.report_version_2,
        )
        report = baker.make_recipe(
            'compliance.tests.utils.compliance_report', report=self.report, compliance_period_id=1
        )

        # Anchor + older CRV
        anchor = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=report,
            report_compliance_summary=prev,
        )
        older = baker.make_recipe('compliance.tests.utils.compliance_report_version', compliance_report=report)
        mock_find_newest_unpaid_anchor.return_value = anchor

        # Outstanding totals: 12,000 + 8,000 = 20,000
        # Refund (900t * $80) = $72,000. Debt is fully cleared.
        mock_collect_unpaid.return_value = [
            {
                "version_id": anchor.id,
                "invoice_id": 111,
                "outstanding": Decimal("12000.00"),
                "paid": ZERO_DECIMAL,
                "prev_excess_emissions": Decimal("900.0000"),
            },
            {
                "version_id": older.id,
                "invoice_id": 222,
                "outstanding": Decimal("8000.00"),
                "paid": ZERO_DECIMAL,
                "prev_excess_emissions": Decimal("850.0000"),
            },
        ]

        # Act
        res = DecreasedObligationHandler.handle(report, new, prev, version_count=3)

        # Assert: CRV link + delta (0 - 900 = -900)
        assert isinstance(res, ComplianceReportVersion)
        assert res.previous_version_id == anchor.id
        assert res.excess_emissions_delta_from_previous == Decimal("-900.0000")

        # Adjustments clear both invoices
        assert mock_create_adjustment.call_count == 2

        # Fully met + no cash → void both
        mock_mark_fully_met.assert_any_call(anchor.id)
        mock_mark_fully_met.assert_any_call(older.id)
        assert mock_void_invoices.call_count == 2

        # No cash → no manual handling
        mock_record_manual_handling.assert_not_called()

        # Assert earned credits created
        mock_create_earned_credits.assert_called_once()
        # CRV status updated to EARNED_CREDITS
        refreshed = ComplianceReportVersion.objects.get(id=res.id)
        assert refreshed.status == ComplianceReportVersion.ComplianceStatus.EARNED_CREDITS

    def test_handle__no_unpaid_invoices__prior_cash_on_previous_crv__flags_manual_handling(
        self,
        mock_find_newest_unpaid_anchor,
        mock_get_rate,
        mock_create_adjustment,
        mock_record_manual_handling,
        mock_collect_unpaid,
        mock_void_invoices,
        mock_mark_fully_met,
        mock_sum_already_applied,
        mock_fallback_invoice_filter,
        mock_sum_invoice_cash,
        mock_create_earned_credits,
        run_on_commit_immediately,
    ):
        """
        Scenario: there are NO unpaid invoices (anchor=None), but prior CRV had CASH payments.
        - invoices == []
        - refund_pool > 0
        - anchor_crv_id falls back to previous_compliance_version.id
        - fallback queries invoices for that CRV and sums cash via _sum_invoice_cash_payments
        → should_record_manual_handling == True
        """
        mock_get_rate.return_value = Decimal("80.00")
        mock_sum_already_applied.return_value = ZERO_DECIMAL
        mock_find_newest_unpaid_anchor.return_value = None  # -> invoices == []
        mock_collect_unpaid.return_value = []  # explicit
        mock_sum_invoice_cash.return_value = Decimal("2000.00")  # CASH present

        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            prev = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('900.0000'),
                credited_emissions=0,
                report_version=self.report_version_1,
            )
        new = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('600.0000'),
            credited_emissions=0,
            report_version=self.report_version_2,
        )
        report = baker.make_recipe(
            'compliance.tests.utils.compliance_report', report=self.report, compliance_period_id=1
        )

        # ▶▶ NEW: create the previous CRV that ties `prev` to this `report`
        prev_crv = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=report,
            report_compliance_summary=prev,
        )

        # Act
        res = DecreasedObligationHandler.handle(report, new, prev, version_count=2)

        # Assert
        assert isinstance(res, ComplianceReportVersion)
        # ▶▶ UPDATED: chain must point to prev_crv (since anchor=None)
        assert res.previous_version_id == prev_crv.id

        mock_record_manual_handling.assert_called_once_with(
            res.id, context=ComplianceReportVersionManualHandling.Context.OBLIGATION_REFUND_POOL_CASH
        )
        mock_create_adjustment.assert_not_called()
        mock_void_invoices.assert_not_called()
        mock_mark_fully_met.assert_not_called()

        # Placeholder status remains and no credits created
        mock_create_earned_credits.assert_not_called()
        refreshed = ComplianceReportVersion.objects.get(id=res.id)
        assert refreshed.status == ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS

    def test_handle__no_unpaid_invoices__prior_cash_on_previous_crv__no_prior_invoices_edgecase(
        self,
        mock_find_newest_non_void_prior_invoices,
        mock_find_newest_unpaid_anchor,
        mock_get_rate,
        mock_collect_unpaid,
        mock_sum_already_applied,
        mock_fallback_invoice_filter,
        mock_sum_invoice_cash,
        run_on_commit_immediately,
    ):
        """
        Scenario: there are NO unpaid invoices (anchor=None), but prior CRV had CASH payments.
        - invoices == [], refund_pool > 0, anchor_crv_id falls back to previous_compliance_version.id
        - fallback queries invoices for that CRV but finds nothing
        - fallback calls _find_newest_non_void_prior_invoices
        """
        mock_get_rate.return_value = Decimal("80.00")
        mock_sum_already_applied.return_value = ZERO_DECIMAL
        mock_find_newest_unpaid_anchor.return_value = None  # -> invoices == []
        mock_collect_unpaid.return_value = []  # explicit
        mock_sum_invoice_cash.return_value = Decimal("2000.00")  # CASH present

        mock_fallback_invoice_filter.return_value = (
            ElicensingInvoice.objects.none()
        )  # no previous_invoices found in fallback

        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            prev = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('900.0000'),
                credited_emissions=0,
                report_version=self.report_version_1,
            )
        new = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('600.0000'),
            credited_emissions=0,
            report_version=self.report_version_2,
        )
        report = baker.make_recipe(
            'compliance.tests.utils.compliance_report', report=self.report, compliance_period_id=1
        )
        # create the previous CRV that ties `prev` to this `report`
        baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=report,
            report_compliance_summary=prev,
        )

        # Act
        DecreasedObligationHandler.handle(report, new, prev, version_count=2)

        # ▶▶ EXTENDED from above previous test:
        # mock_fallback_invoice_filter retuns [] which means this edgecase must be called
        mock_find_newest_non_void_prior_invoices.assert_called_once()

    # handle one invoice\no payment
    def test_handle__partial_refund_invoice_no_payment__adjustment_not_met_no_void(
        self,
        mock_find_newest_unpaid_anchor,
        mock_get_rate,
        mock_create_adjustment,
        mock_record_manual_handling,
        mock_collect_unpaid,
        mock_void_invoices,
        mock_mark_fully_met,
        mock_create_earned_credits,
        run_on_commit_immediately,
    ):
        """
        When the decreased-obligation refund is smaller than the invoice outstanding:
        - Apply a negative adjustment equal to the refund (partial allocation).
        - Do NOT mark the previous CRV as FULLY_MET and do NOT void the invoice.
        """
        # Arrange
        mock_get_rate.return_value = Decimal("80.00")  # $80/t

        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            prev_summary = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('800.0000'),
                credited_emissions=Decimal('0'),
                report_version=self.report_version_1,
            )
        new_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('700.0000'),  # ↓ 100 t
            credited_emissions=Decimal('0'),
            report_version=self.report_version_2,
        )

        compliance_report = baker.make_recipe(
            'compliance.tests.utils.compliance_report',
            report=self.report,
            compliance_period_id=1,
        )

        # Anchor is the previous CRV in chain
        prev_crv = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=compliance_report,
            report_compliance_summary=prev_summary,
        )
        mock_find_newest_unpaid_anchor.return_value = prev_crv

        # One unpaid invoice: $12,000 outstanding, $0 paid
        mock_collect_unpaid.return_value = [
            {
                "version_id": prev_crv.id,
                "invoice_id": 9999,
                "outstanding": Decimal("12000.00"),
                "paid": Decimal("0.00"),
                "prev_excess_emissions": Decimal("800.0000"),
            }
        ]

        # Act (post-commit executes inline)
        result = DecreasedObligationHandler.handle(
            compliance_report=compliance_report,
            new_summary=new_summary,
            previous_summary=prev_summary,
            version_count=2,
        )

        # Assert: new supplementary CRV created/linked
        assert isinstance(result, ComplianceReportVersion)
        assert result.previous_version_id == prev_crv.id
        assert result.excess_emissions_delta_from_previous == Decimal("-100.0000")

        # Refund = 100 * 80 = $8,000 → apply to $12,000 outstanding => NOT fully met
        mock_create_adjustment.assert_called_once()
        _, adj_kwargs = mock_create_adjustment.call_args
        assert adj_kwargs["target_compliance_report_version_id"] == prev_crv.id
        assert adj_kwargs["supplementary_compliance_report_version_id"] == result.id
        assert adj_kwargs["adjustment_total"] == Decimal("-8000.00")
        assert adj_kwargs["reason"] == ElicensingAdjustment.Reason.SUPPLEMENTARY_REPORT_ADJUSTMENT

        # Not fully met → no mark/void and no credits
        mock_mark_fully_met.assert_not_called()
        mock_void_invoices.assert_not_called()
        mock_record_manual_handling.assert_not_called()

        # Placeholder status remains and no credits created
        mock_create_earned_credits.assert_not_called()
        refreshed = ComplianceReportVersion.objects.get(id=result.id)
        assert refreshed.status == ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS

    def test_handle__full_refund_invoice_no_payment__adjustment_fully_met_void(
        self,
        mock_find_newest_unpaid_anchor,
        mock_get_rate,
        mock_create_adjustment,
        mock_record_manual_handling,
        mock_collect_unpaid,
        mock_void_invoices,
        mock_mark_fully_met,
        mock_create_earned_credits,
        run_on_commit_immediately,
    ):
        """
        When the decreased-obligation refund exactly equals the invoice outstanding:
        - Apply a negative adjustment equal to the full outstanding.
        - Mark the previous CRV as FULLY_MET and void the invoice (no cash payments).
        """
        # Arrange
        mock_get_rate.return_value = Decimal("80.00")  # $80/t

        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            prev_summary = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('500.0000'),
                credited_emissions=Decimal('0'),
                report_version=self.report_version_1,
            )
        new_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('300.0000'),  # ↓ 200 t → refund $16,000
            credited_emissions=Decimal('0'),
            report_version=self.report_version_2,
        )

        compliance_report = baker.make_recipe(
            'compliance.tests.utils.compliance_report',
            report=self.report,
            compliance_period_id=1,
        )

        prev_crv = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=compliance_report,
            report_compliance_summary=prev_summary,
        )

        mock_find_newest_unpaid_anchor.return_value = prev_crv
        # Outstanding EXACTLY equals refund (200 * $80 = $16,000)
        mock_collect_unpaid.return_value = [
            {
                "version_id": prev_crv.id,
                "invoice_id": 12345,
                "outstanding": Decimal("16000.00"),
                "paid": Decimal("0.00"),
                "prev_excess_emissions": Decimal("500.0000"),
            }
        ]

        # Act
        result = DecreasedObligationHandler.handle(
            compliance_report=compliance_report,
            new_summary=new_summary,
            previous_summary=prev_summary,
            version_count=2,
        )

        # Assert: new supplementary CRV created/linked
        assert isinstance(result, ComplianceReportVersion)
        assert result.previous_version_id == prev_crv.id
        assert result.excess_emissions_delta_from_previous == Decimal("-200.0000")

        # Refund = $16,000 → apply full amount to invoice (negative adjustment)
        mock_create_adjustment.assert_called_once()
        _, adj_kwargs = mock_create_adjustment.call_args
        assert adj_kwargs["target_compliance_report_version_id"] == prev_crv.id
        assert adj_kwargs["supplementary_compliance_report_version_id"] == result.id
        assert adj_kwargs["adjustment_total"] == Decimal("-16000.00")
        assert adj_kwargs["reason"] == ElicensingAdjustment.Reason.SUPPLEMENTARY_REPORT_ADJUSTMENT_TO_VOID_INVOICE

        # Fully met, no cash → mark & void
        mock_mark_fully_met.assert_called_once_with(prev_crv.id)
        mock_void_invoices.assert_called_once_with(prev_crv.id)

        # No remainder, no over-compliance, no credited_emissions → no manual handling created
        mock_record_manual_handling.assert_not_called()

        # Placeholder status remains and no credits created
        mock_create_earned_credits.assert_not_called()
        refreshed = ComplianceReportVersion.objects.get(id=result.id)
        assert refreshed.status == ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS

    # handle one invoice\payment
    def test_handle__partial_refund_invoice_with_payment__adjustment_not_met_no_void(
        self,
        mock_find_newest_unpaid_anchor,
        mock_get_rate,
        mock_create_adjustment,
        mock_record_manual_handling,
        mock_collect_unpaid,
        mock_void_invoices,
        mock_mark_fully_met,
        mock_create_earned_credits,
        run_on_commit_immediately,
    ):
        """
        Partial refund < outstanding, with CASH present:
        - Apply partial negative adjustment.
        - NOT fully met → no mark, no void (cash irrelevant but present).
        """
        mock_get_rate.return_value = Decimal("80.00")  # $80/t

        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            prev_summary = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('800.0000'),
                credited_emissions=Decimal('0'),
                report_version=self.report_version_1,
            )
        new_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('700.0000'),  # ↓ 100 t → $8,000
            credited_emissions=Decimal('0'),
            report_version=self.report_version_2,
        )

        compliance_report = baker.make_recipe(
            'compliance.tests.utils.compliance_report',
            report=self.report,
            compliance_period_id=1,
        )
        prev_crv = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=compliance_report,
            report_compliance_summary=prev_summary,
        )

        mock_find_newest_unpaid_anchor.return_value = prev_crv
        mock_collect_unpaid.return_value = [
            {
                "version_id": prev_crv.id,
                "invoice_id": 9999,
                "outstanding": Decimal("12000.00"),
                "paid": Decimal("10.00"),  # CASH present (explicit)
                "prev_excess_emissions": Decimal("800.0000"),
            }
        ]

        result = DecreasedObligationHandler.handle(
            compliance_report=compliance_report,
            new_summary=new_summary,
            previous_summary=prev_summary,
            version_count=2,
        )

        assert result.excess_emissions_delta_from_previous == Decimal("-100.0000")
        mock_create_adjustment.assert_called_once()
        _, adj_kwargs = mock_create_adjustment.call_args
        assert adj_kwargs["target_compliance_report_version_id"] == prev_crv.id
        assert adj_kwargs["supplementary_compliance_report_version_id"] == result.id
        assert adj_kwargs["adjustment_total"] == Decimal("-8000.00")
        assert adj_kwargs["reason"] == ElicensingAdjustment.Reason.SUPPLEMENTARY_REPORT_ADJUSTMENT

        mock_mark_fully_met.assert_not_called()
        mock_void_invoices.assert_not_called()
        mock_record_manual_handling.assert_not_called()

        # Placeholder status remains and no credits created
        mock_create_earned_credits.assert_not_called()
        refreshed = ComplianceReportVersion.objects.get(id=result.id)
        assert refreshed.status == ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS

    def test_handle__full_refund_invoice_with_payment__adjustment_fully_met_no_void(
        self,
        mock_find_newest_unpaid_anchor,
        mock_get_rate,
        mock_create_adjustment,
        mock_record_manual_handling,
        mock_collect_unpaid,
        mock_void_invoices,
        mock_mark_fully_met,
        mock_create_earned_credits,
        run_on_commit_immediately,
    ):
        """
        Refund == outstanding, with CASH present:
        - Apply full negative adjustment.
        - Mark FULLY_MET.
        - DO NOT void (cash payments exist).
        """
        mock_get_rate.return_value = Decimal("80.00")  # $80/t

        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            prev_summary = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('500.0000'),
                credited_emissions=Decimal('0'),
                report_version=self.report_version_1,
            )
        new_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('300.0000'),  # ↓ 200 t → $16,000
            credited_emissions=Decimal('0'),
            report_version=self.report_version_2,
        )

        compliance_report = baker.make_recipe(
            'compliance.tests.utils.compliance_report',
            report=self.report,
            compliance_period_id=1,
        )
        prev_crv = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=compliance_report,
            report_compliance_summary=prev_summary,
        )

        mock_find_newest_unpaid_anchor.return_value = prev_crv
        mock_collect_unpaid.return_value = [
            {
                "version_id": prev_crv.id,
                "invoice_id": 12345,
                "outstanding": Decimal("16000.00"),  # exactly equals refund
                "paid": Decimal("0.01"),  # CASH present → no void
                "prev_excess_emissions": Decimal("500.0000"),
            }
        ]

        result = DecreasedObligationHandler.handle(
            compliance_report=compliance_report,
            new_summary=new_summary,
            previous_summary=prev_summary,
            version_count=2,
        )

        assert result.excess_emissions_delta_from_previous == Decimal("-200.0000")

        mock_create_adjustment.assert_called_once()
        _, adj_kwargs = mock_create_adjustment.call_args
        assert adj_kwargs["target_compliance_report_version_id"] == prev_crv.id
        assert adj_kwargs["supplementary_compliance_report_version_id"] == result.id
        assert adj_kwargs["adjustment_total"] == Decimal("-16000.00")
        assert adj_kwargs["reason"] == ElicensingAdjustment.Reason.SUPPLEMENTARY_REPORT_ADJUSTMENT

        mock_mark_fully_met.assert_called_once_with(prev_crv.id)
        mock_void_invoices.assert_not_called()
        mock_record_manual_handling.assert_not_called()

        # Placeholder status remains and no credits created
        mock_create_earned_credits.assert_not_called()
        refreshed = ComplianceReportVersion.objects.get(id=result.id)
        assert refreshed.status == ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS

    # handle multiple invoices\no payment
    def test_handle__partial_refund_multi_invoices_no_payment__adjustments_not_met_no_void(
        self,
        mock_find_newest_unpaid_anchor,
        mock_get_rate,
        mock_create_adjustment,
        mock_record_manual_handling,
        mock_collect_unpaid,
        mock_void_invoices,
        mock_mark_fully_met,
        mock_create_earned_credits,
        run_on_commit_immediately,
    ):
        """
        Partial refund across multiple invoices (no cash):
        - Apply refund only to the newest invoice (partial).
        - DO NOT mark FULLY_MET or void.
        """
        mock_get_rate.return_value = Decimal("80.00")  # $80/t

        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            prev = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('800.0000'),
                credited_emissions=0,
                report_version=self.report_version_1,
            )
        # Refund = 125 t * $80 = $10,000
        new = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('675.0000'),
            credited_emissions=0,
            report_version=self.report_version_2,
        )
        report = baker.make_recipe(
            'compliance.tests.utils.compliance_report', report=self.report, compliance_period_id=1
        )

        anchor = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version', compliance_report=report, report_compliance_summary=prev
        )
        older = baker.make_recipe('compliance.tests.utils.compliance_report_version', compliance_report=report)
        mock_find_newest_unpaid_anchor.return_value = anchor

        mock_collect_unpaid.return_value = [
            {
                "version_id": anchor.id,
                "invoice_id": 111,
                "outstanding": Decimal("12000.00"),
                "paid": Decimal("0.00"),
                "prev_excess_emissions": Decimal("800.0000"),
            },
            {
                "version_id": older.id,
                "invoice_id": 222,
                "outstanding": Decimal("5000.00"),
                "paid": Decimal("0.00"),
                "prev_excess_emissions": Decimal("790.0000"),
            },
        ]

        res = DecreasedObligationHandler.handle(report, new, prev, version_count=3)

        # Only one adjustment of -$10,000 to the newest invoice; not fully met
        mock_create_adjustment.assert_called_once()
        _, adj = mock_create_adjustment.call_args
        assert adj["target_compliance_report_version_id"] == anchor.id
        assert adj["adjustment_total"] == Decimal("-10000.00")
        assert adj["reason"] == ElicensingAdjustment.Reason.SUPPLEMENTARY_REPORT_ADJUSTMENT

        mock_mark_fully_met.assert_not_called()
        mock_void_invoices.assert_not_called()
        mock_record_manual_handling.assert_not_called()

        # Placeholder status remains and no credits created
        mock_create_earned_credits.assert_not_called()
        assert (
            ComplianceReportVersion.objects.get(id=res.id).status
            == ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS
        )

    def test_handle__full_refund_multi_invoices_no_payment__adjustments_all_fully_met_void(
        self,
        mock_find_newest_unpaid_anchor,
        mock_get_rate,
        mock_create_adjustment,
        mock_record_manual_handling,
        mock_collect_unpaid,
        mock_void_invoices,
        mock_mark_fully_met,
        mock_create_earned_credits,
        run_on_commit_immediately,
    ):
        """
        Full refund equals sum of two invoices (no cash):
        - Fully meet both invoices (two adjustments).
        - Mark FULLY_MET and void both (no cash on either).
        """
        mock_get_rate.return_value = Decimal("80.00")

        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            prev = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('900.0000'),
                credited_emissions=0,
                report_version=self.report_version_1,
            )
        # Refund = 250 t * $80 = $20,000
        new = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('650.0000'),
            credited_emissions=0,
            report_version=self.report_version_2,
        )
        report = baker.make_recipe(
            'compliance.tests.utils.compliance_report', report=self.report, compliance_period_id=1
        )

        anchor = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version', compliance_report=report, report_compliance_summary=prev
        )
        older = baker.make_recipe('compliance.tests.utils.compliance_report_version', compliance_report=report)
        mock_find_newest_unpaid_anchor.return_value = anchor

        mock_collect_unpaid.return_value = [
            {
                "version_id": anchor.id,
                "invoice_id": 111,
                "outstanding": Decimal("12000.00"),
                "paid": Decimal("0.00"),
                "prev_excess_emissions": Decimal("900.0000"),
            },
            {
                "version_id": older.id,
                "invoice_id": 222,
                "outstanding": Decimal("8000.00"),
                "paid": Decimal("0.00"),
                "prev_excess_emissions": Decimal("850.0000"),
            },
        ]

        res = DecreasedObligationHandler.handle(report, new, prev, version_count=3)

        assert mock_create_adjustment.call_count == 2
        mock_mark_fully_met.assert_any_call(anchor.id)
        mock_mark_fully_met.assert_any_call(older.id)
        # No cash on either -> void both
        assert mock_void_invoices.call_count == 2
        mock_record_manual_handling.assert_not_called()

        # Placeholder status remains and no credits created
        mock_create_earned_credits.assert_not_called()
        assert (
            ComplianceReportVersion.objects.get(id=res.id).status
            == ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS
        )

    def test_handle__over_refund_multi_invoices_no_payment__adjustments_conditional_fully_met_void(
        self,
        mock_find_newest_unpaid_anchor,
        mock_get_rate,
        mock_create_adjustment,
        mock_record_manual_handling,
        mock_collect_unpaid,
        mock_void_invoices,
        mock_mark_fully_met,
        mock_create_earned_credits,
        run_on_commit_immediately,
    ):
        """
        Multiple invoices, allocated newest → oldest:
        - Apply refund to the newest invoice until fully met (no cash → void).
        - Allocate remaining refund to older invoices (may remain partially met).
        - Verifies two adjustments (-12,000 and -8,000), FULLY_MET + void on the anchor.
        """
        mock_get_rate.return_value = Decimal("80.00")  # $80/t

        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            prev_summary = baker.make_recipe(
                "reporting.tests.utils.report_compliance_summary",
                excess_emissions=Decimal("900.0000"),
                credited_emissions=Decimal("0"),
                report_version=self.report_version_1,
            )
        new_summary = baker.make_recipe(
            "reporting.tests.utils.report_compliance_summary",
            excess_emissions=Decimal("650.0000"),  # decrease 250 t
            credited_emissions=Decimal("0"),
            report_version=self.report_version_2,
        )
        compliance_report = baker.make_recipe(
            "compliance.tests.utils.compliance_report", report=self.report, compliance_period_id=1
        )

        # Anchor (newest unpaid) + an older CRV in the chain
        crv_anchor = baker.make_recipe(
            "compliance.tests.utils.compliance_report_version",
            compliance_report=compliance_report,
            report_compliance_summary=prev_summary,
        )
        crv_older = baker.make_recipe(
            "compliance.tests.utils.compliance_report_version",
            compliance_report=compliance_report,
        )
        mock_find_newest_unpaid_anchor.return_value = crv_anchor

        # Refund = 250 * 80 = $20,000
        # Newest → oldest invoices:
        #  - Anchor invoice: $12,000 outstanding, $0 paid → fully met → mark + void
        #  - Older invoice: $15,000 outstanding → apply remaining $8,000 → partial
        mock_collect_unpaid.return_value = [
            {
                "version_id": crv_anchor.id,
                "invoice_id": 111,
                "outstanding": Decimal("12000.00"),
                "paid": Decimal("0.00"),
                "prev_excess_emissions": Decimal("900.0000"),
            },
            {
                "version_id": crv_older.id,
                "invoice_id": 222,
                "outstanding": Decimal("15000.00"),
                "paid": Decimal("0.00"),
                "prev_excess_emissions": Decimal("850.0000"),
            },
        ]

        # Act
        result = DecreasedObligationHandler.handle(
            compliance_report=compliance_report,
            new_summary=new_summary,
            previous_summary=prev_summary,
            version_count=3,
        )

        # Assert: new supplementary CRV
        assert isinstance(result, ComplianceReportVersion)
        assert result.previous_version_id == crv_anchor.id
        assert result.excess_emissions_delta_from_previous == Decimal("-250.0000")

        # Two adjustments: -12,000 (anchor), -8,000 (older)
        assert mock_create_adjustment.call_count == 2

        _, adj1 = mock_create_adjustment.call_args_list[0]
        assert adj1["target_compliance_report_version_id"] == crv_anchor.id
        assert adj1["supplementary_compliance_report_version_id"] == result.id
        assert adj1["adjustment_total"] == Decimal("-12000.00")

        _, adj2 = mock_create_adjustment.call_args_list[1]
        assert adj2["target_compliance_report_version_id"] == crv_older.id
        assert adj2["supplementary_compliance_report_version_id"] == result.id
        assert adj2["adjustment_total"] == Decimal("-8000.00")

        # Fully met anchor (no cash) → mark & void
        mock_mark_fully_met.assert_any_call(crv_anchor.id)
        mock_void_invoices.assert_any_call(crv_anchor.id)
        assert mock_mark_fully_met.call_count == 1
        assert mock_void_invoices.call_count == 1

        # Not all invoices cleared → no manual handling
        mock_record_manual_handling.assert_not_called()

        # Placeholder status remains and no credits created
        mock_create_earned_credits.assert_not_called()
        refreshed = ComplianceReportVersion.objects.get(id=result.id)
        assert refreshed.status == ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS

    # handle multiple invoices\payment
    def test_handle__partial_refund_multi_invoices_with_payment__adjustment_not_met_no_void(
        self,
        mock_find_newest_unpaid_anchor,
        mock_get_rate,
        mock_create_adjustment,
        mock_record_manual_handling,
        mock_collect_unpaid,
        mock_void_invoices,
        mock_mark_fully_met,
        mock_create_earned_credits,
        run_on_commit_immediately,
    ):
        """
        Partial refund across multiple invoices (cash present):
        - Apply partial adjustment to newest invoice.
        - Not fully met → no mark, no void (cash irrelevant here).
        """
        mock_get_rate.return_value = Decimal("80.00")

        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            prev = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('820.0000'),
                credited_emissions=0,
                report_version=self.report_version_1,
            )
        # Refund = 100 t * $80 = $8,000
        new = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('720.0000'),
            credited_emissions=0,
            report_version=self.report_version_2,
        )
        report = baker.make_recipe(
            'compliance.tests.utils.compliance_report', report=self.report, compliance_period_id=1
        )

        anchor = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version', compliance_report=report, report_compliance_summary=prev
        )
        older = baker.make_recipe('compliance.tests.utils.compliance_report_version', compliance_report=report)
        mock_find_newest_unpaid_anchor.return_value = anchor

        mock_collect_unpaid.return_value = [
            {
                "version_id": anchor.id,
                "invoice_id": 111,
                "outstanding": Decimal("12000.00"),
                "paid": Decimal("1.00"),
                "prev_excess_emissions": Decimal("820.0000"),
            },
            {
                "version_id": older.id,
                "invoice_id": 222,
                "outstanding": Decimal("6000.00"),
                "paid": Decimal("2.00"),
                "prev_excess_emissions": Decimal("800.0000"),
            },
        ]

        res = DecreasedObligationHandler.handle(report, new, prev, version_count=3)

        mock_create_adjustment.assert_called_once()
        _, adj = mock_create_adjustment.call_args
        assert adj["target_compliance_report_version_id"] == anchor.id
        assert adj["adjustment_total"] == Decimal("-8000.00")
        assert adj["reason"] == ElicensingAdjustment.Reason.SUPPLEMENTARY_REPORT_ADJUSTMENT
        mock_mark_fully_met.assert_not_called()
        mock_void_invoices.assert_not_called()
        mock_record_manual_handling.assert_not_called()

        # Placeholder status remains and no credits created
        mock_create_earned_credits.assert_not_called()
        refreshed = ComplianceReportVersion.objects.get(id=res.id)
        assert refreshed.status == ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS

    def test_handle__full_refund_multi_invoices_with_payment__adjustments_all_fully_met_no_void(
        self,
        mock_find_newest_unpaid_anchor,
        mock_get_rate,
        mock_create_adjustment,
        mock_record_manual_handling,
        mock_collect_unpaid,
        mock_void_invoices,
        mock_mark_fully_met,
        mock_create_earned_credits,
        run_on_commit_immediately,
    ):
        """
        Full refund equals sum across invoices (cash present):
        - Fully meet both invoices (two adjustments), mark FULLY_MET.
        - DO NOT void due to cash.
        """
        mock_get_rate.return_value = Decimal("80.00")

        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            prev = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('900.0000'),
                credited_emissions=0,
                report_version=self.report_version_1,
            )
        # Refund = 250 t * $80 = $20,000
        new = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('650.0000'),
            credited_emissions=0,
            report_version=self.report_version_2,
        )
        report = baker.make_recipe(
            'compliance.tests.utils.compliance_report', report=self.report, compliance_period_id=1
        )

        anchor = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version', compliance_report=report, report_compliance_summary=prev
        )
        older = baker.make_recipe('compliance.tests.utils.compliance_report_version', compliance_report=report)
        mock_find_newest_unpaid_anchor.return_value = anchor

        mock_collect_unpaid.return_value = [
            {
                "version_id": anchor.id,
                "invoice_id": 111,
                "outstanding": Decimal("12000.00"),
                "paid": Decimal("1.00"),
                "prev_excess_emissions": Decimal("900.0000"),
            },
            {
                "version_id": older.id,
                "invoice_id": 222,
                "outstanding": Decimal("8000.00"),
                "paid": Decimal("2.00"),
                "prev_excess_emissions": Decimal("850.0000"),
            },
        ]

        res = DecreasedObligationHandler.handle(report, new, prev, version_count=3)

        assert mock_create_adjustment.call_count == 2
        mock_mark_fully_met.assert_any_call(anchor.id)
        mock_mark_fully_met.assert_any_call(older.id)
        mock_void_invoices.assert_not_called()
        mock_record_manual_handling.assert_not_called()

        # Placeholder status remains and no credits created
        mock_create_earned_credits.assert_not_called()
        refreshed = ComplianceReportVersion.objects.get(id=res.id)
        assert refreshed.status == ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS

    def test_handle__over_refund_multi_invoices_with_payment__adjustments_conditionally_met_no_void(
        self,
        mock_find_newest_unpaid_anchor,
        mock_get_rate,
        mock_create_adjustment,
        mock_record_manual_handling,
        mock_collect_unpaid,
        mock_void_invoices,
        mock_mark_fully_met,
        mock_create_earned_credits,
        run_on_commit_immediately,
    ):
        """
        Split refund with CASH present:
        - Refund > anchor outstanding → anchor fully met (mark), DO NOT void (cash).
        - Remainder applied to older invoice (partial).
        """
        mock_get_rate.return_value = Decimal("80.00")  # $80/t

        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            prev = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('600.0000'),
                credited_emissions=0,
                report_version=self.report_version_1,
            )
        # Refund = 150 t * $80 = $12,000
        new = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('450.0000'),
            credited_emissions=0,
            report_version=self.report_version_2,
        )
        report = baker.make_recipe(
            'compliance.tests.utils.compliance_report', report=self.report, compliance_period_id=1
        )

        anchor = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version', compliance_report=report, report_compliance_summary=prev
        )
        older = baker.make_recipe('compliance.tests.utils.compliance_report_version', compliance_report=report)
        mock_find_newest_unpaid_anchor.return_value = anchor

        # Anchor 5,000 with cash → fully met, no void; Older 10,000 (partial 7,000 remaining)
        mock_collect_unpaid.return_value = [
            {
                "version_id": anchor.id,
                "invoice_id": 11,
                "outstanding": Decimal("5000.00"),
                "paid": Decimal("10.00"),
                "prev_excess_emissions": Decimal("600.0000"),
            },
            {
                "version_id": older.id,
                "invoice_id": 22,
                "outstanding": Decimal("10000.00"),
                "paid": Decimal("1.00"),
                "prev_excess_emissions": Decimal("550.0000"),
            },
        ]

        res = DecreasedObligationHandler.handle(report, new, prev, version_count=3)

        # Two adjustments: -5,000 (anchor), -7,000 (older)
        assert mock_create_adjustment.call_count == 2
        # Mark both calls exist
        mock_mark_fully_met.assert_any_call(anchor.id)
        # CASH present on anchor → DO NOT void
        mock_void_invoices.assert_not_called()
        # Not all cleared → no manual handling
        mock_record_manual_handling.assert_not_called()

        # Placeholder status remains and no credits created
        mock_create_earned_credits.assert_not_called()
        refreshed = ComplianceReportVersion.objects.get(id=res.id)
        assert refreshed.status == ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS

    # adjustment-dating test
    def test_handle__decrease_dates_adjustment_to_fee_date(
        self,
        mock_find_newest_unpaid_anchor,
        mock_get_rate,
        mock_create_adjustment,
        mock_collect_unpaid,
        run_on_commit_immediately,
    ):
        mock_get_rate.return_value = Decimal("80.00")  # $80/t
        compliance_report = baker.make_recipe(
            'compliance.tests.utils.compliance_report', report=self.report, compliance_period_id=1
        )

        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            prev_summary = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('800.0000'),
                credited_emissions=Decimal('0'),
                report_version=self.report_version_1,
            )
        new_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('700.0000'),  # ↓ 100 t -> refund $8,000
            credited_emissions=Decimal('0'),
            report_version=self.report_version_2,
        )

        prev_crv = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=compliance_report,
            report_compliance_summary=prev_summary,
        )
        mock_find_newest_unpaid_anchor.return_value = prev_crv
        mock_collect_unpaid.return_value = [
            {
                "version_id": prev_crv.id,
                "invoice_id": 9999,
                "outstanding": Decimal("12000.00"),
                "paid": Decimal("0.00"),
                "prev_excess_emissions": Decimal("800.0000"),
            }
        ]

        # Act
        DecreasedObligationHandler.handle(compliance_report, new_summary, prev_summary, version_count=2)

        # Assert
        mock_create_adjustment.assert_called_once()
        _, adj_kwargs = mock_create_adjustment.call_args
        assert adj_kwargs["date_adjustment_to_fee_date"] is True

    # -------------------------------------------------------------------
    # helper tests
    # -------------------------------------------------------------------

    def test_helper__find_newest_non_void_prior_invoices(
        self,
    ):
        """
        Tests if helper function correctly walks backwards through report versions finding nearest valid invoice past voided ones
        """
        # Arrange
        self.invoice_1 = baker.make_recipe(
            'compliance.tests.utils.elicensing_invoice',
        )
        self.invoice_2 = baker.make_recipe(
            'compliance.tests.utils.elicensing_invoice',
        )
        self.invoice_3 = baker.make_recipe(
            'compliance.tests.utils.elicensing_invoice',
            is_void=True,
        )
        self.invoice_4 = baker.make_recipe(
            'compliance.tests.utils.elicensing_invoice',
            is_void=True,
        )

        self.line_item_1 = baker.make_recipe(
            'compliance.tests.utils.elicensing_line_item',
            elicensing_invoice=self.invoice_1,
        )
        self.line_item_2 = baker.make_recipe(
            'compliance.tests.utils.elicensing_line_item',
            elicensing_invoice=self.invoice_2,
        )
        self.line_item_3 = baker.make_recipe(
            'compliance.tests.utils.elicensing_line_item',
            elicensing_invoice=self.invoice_3,
        )
        self.line_item_4 = baker.make_recipe(
            'compliance.tests.utils.elicensing_line_item',
            elicensing_invoice=self.invoice_4,
        )

        self.payment_1 = baker.make_recipe(
            'compliance.tests.utils.elicensing_payment',
            elicensing_line_item=self.line_item_1,
            amount=Decimal('100.01'),
        )
        self.payment_2 = baker.make_recipe(
            'compliance.tests.utils.elicensing_payment',
            elicensing_line_item=self.line_item_2,
            amount=Decimal('100.01'),
        )

        self.crv_1 = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
        )
        self.crv_2 = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            previous_version=self.crv_1,
        )
        self.crv_3 = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            previous_version=self.crv_2,
        )
        self.crv_4 = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            previous_version=self.crv_3,
        )
        self.crv_5 = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            previous_version=self.crv_4,
        )

        self.obligation_1 = baker.make_recipe(
            'compliance.tests.utils.compliance_obligation',
            elicensing_invoice=self.invoice_1,
            compliance_report_version=self.crv_1,
        )
        self.obligation_2 = baker.make_recipe(
            'compliance.tests.utils.compliance_obligation',
            elicensing_invoice=self.invoice_2,
            compliance_report_version=self.crv_2,
        )
        self.obligation_3 = baker.make_recipe(
            'compliance.tests.utils.compliance_obligation',
            elicensing_invoice=self.invoice_3,
            compliance_report_version=self.crv_3,
        )
        self.obligation_4 = baker.make_recipe(
            'compliance.tests.utils.compliance_obligation',
            elicensing_invoice=self.invoice_4,
            compliance_report_version=self.crv_4,
        )

        # Act
        result = DecreasedObligationHandler._find_newest_non_void_prior_invoices(
            self.crv_5.id, ElicensingInvoice.objects.none()
        )

        # Assert
        assert result.first() == self.invoice_2


class TestMarkPreviousVersionFullyMet:
    """
    Direct unit tests for _mark_previous_version_fully_met
    """

    def setup_method(self):
        self.compliance_report_version = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET,
        )
        self.obligation = baker.make_recipe(
            'compliance.tests.utils.compliance_obligation',
            compliance_report_version=self.compliance_report_version,
        )
        self.invoice = baker.make_recipe(
            'compliance.tests.utils.elicensing_invoice',
            outstanding_balance=ZERO_DECIMAL,
            invoice_fee_balance=ZERO_DECIMAL,
            invoice_interest_balance=ZERO_DECIMAL,
        )
        with pgtrigger.ignore("compliance.ComplianceObligation:set_updated_audit_columns"):
            self.obligation.elicensing_invoice = self.invoice
            self.obligation.save()

    def test_marks_fully_met_when_no_interest_outstanding(self):
        DecreasedObligationHandler._mark_previous_version_fully_met(self.compliance_report_version.id)

        self.compliance_report_version.refresh_from_db()
        assert self.compliance_report_version.status == ComplianceReportVersion.ComplianceStatus.OBLIGATION_FULLY_MET

    def test_marks_interest_not_paid_when_interest_still_outstanding(self):
        self.invoice.invoice_interest_balance = Decimal("25.00")
        self.invoice.outstanding_balance = Decimal("25.00")
        self.invoice.save()

        DecreasedObligationHandler._mark_previous_version_fully_met(self.compliance_report_version.id)

        self.compliance_report_version.refresh_from_db()
        assert (
            self.compliance_report_version.status
            == ComplianceReportVersion.ComplianceStatus.OBLIGATION_MET_INTEREST_NOT_PAID
        )
