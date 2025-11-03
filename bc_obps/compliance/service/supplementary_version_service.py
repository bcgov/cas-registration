from reporting.models import ReportVersion, ReportComplianceSummary
from compliance.models.elicensing_invoice import ElicensingInvoice
from compliance.models.elicensing_adjustment import ElicensingAdjustment
from compliance.models import ComplianceReport, ComplianceEarnedCredit, ComplianceReportVersion, ComplianceObligation
from compliance.service.compliance_obligation_service import ComplianceObligationService
from compliance.service.compliance_adjustment_service import ComplianceAdjustmentService
from compliance.service.compliance_charge_rate_service import ComplianceChargeRateService
from compliance.service.elicensing.elicensing_obligation_service import ElicensingObligationService
from compliance.service.earned_credits_service import ComplianceEarnedCreditsService
from compliance.service.elicensing.elicensing_data_refresh_service import ElicensingDataRefreshService
from compliance.models.elicensing_line_item import ElicensingLineItem

from compliance.dataclass import InvoiceAdjustment, AdjustmentStrategy

from django.db.models import Prefetch, QuerySet, Case, When, Value, IntegerField, Sum
from django.db.models.functions import Coalesce
from django.db import transaction
from decimal import Decimal
from typing import Dict, List, Protocol, Optional, cast
import logging

logger = logging.getLogger(__name__)

# Constants
ZERO_DECIMAL = Decimal('0')
MONEY = Decimal("0.01")
EMISS = Decimal("0.0000")


# Define the strategy interface
class SupplementaryScenarioHandler(Protocol):
    @staticmethod
    def can_handle(new_summary: ReportComplianceSummary, previous_summary: ReportComplianceSummary) -> bool:
        ...

    @staticmethod
    def handle(
        compliance_report: ComplianceReport,
        new_summary: ReportComplianceSummary,
        previous_summary: ReportComplianceSummary,
        version_count: int,
    ) -> Optional[ComplianceReportVersion]:
        ...


# Concrete strategy for superceding compliance report versions when no binding action has occurred (invoice generated / earned credits requested or issued)
class SupercedeVersionHandler:
    @staticmethod
    def _all_ancestor_versions_are_superceded(compliance_report_version: ComplianceReportVersion) -> bool:
        """Check if all ancestor versions have a status of SUPERCEDED."""
        return (
            not ComplianceReportVersion.objects.filter(
                compliance_report_id=compliance_report_version.compliance_report_id
            )
            .exclude(id=compliance_report_version.id)
            .exclude(status=ComplianceReportVersion.ComplianceStatus.SUPERCEDED)
            .exists()
        )

    @staticmethod
    def can_handle(new_summary: ReportComplianceSummary, previous_summary: ReportComplianceSummary) -> bool:
        previous_compliance_report_version = ComplianceReportVersion.objects.get(
            report_compliance_summary=previous_summary
        )
        # Return False if any previous version ancestors have a status other than superceded
        if not SupercedeVersionHandler._all_ancestor_versions_are_superceded(previous_compliance_report_version):
            return False
        if previous_summary.excess_emissions > ZERO_DECIMAL:
            # Return True if the previous version has an obligation with no invoice
            return SupplementaryVersionService._obligation_has_no_invoice(previous_compliance_report_version)
        if previous_summary.credited_emissions > ZERO_DECIMAL:
            # Return True if the previous version has earned credits that have not been requested
            return SupplementaryVersionService._earned_credits_not_issued(previous_compliance_report_version)
        return False

    @staticmethod
    def handle(
        compliance_report: ComplianceReport,
        new_summary: ReportComplianceSummary,
        previous_summary: ReportComplianceSummary,
        version_count: int,
    ) -> Optional[ComplianceReportVersion]:

        previous_compliance_version = (
            SupplementaryVersionService._get_previous_compliance_version_by_report_and_summary(
                compliance_report, previous_summary
            )
        )
        # Update previous version status to SUPERCEDED
        previous_compliance_version.status = ComplianceReportVersion.ComplianceStatus.SUPERCEDED
        previous_compliance_version.save(update_fields=['status'])

        # Create new version
        compliance_report_version = ComplianceReportVersion.objects.create(
            compliance_report=compliance_report,
            report_compliance_summary=new_summary,
            status=ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS,
            is_supplementary=True,
            previous_version=previous_compliance_version,
        )

        # Handle supercede obligation
        if previous_summary.excess_emissions > ZERO_DECIMAL:
            # Delete hanging superceded obligation record
            ComplianceObligation.objects.get(compliance_report_version=previous_compliance_version).delete()

        # Handle supercede earned credit
        if previous_summary.credited_emissions > ZERO_DECIMAL:
            # Delete hanging superceded earned credit record
            ComplianceEarnedCredit.objects.get(compliance_report_version=previous_compliance_version).delete()

        # Create new obligation record if new version has excess emissions
        if new_summary.excess_emissions > ZERO_DECIMAL:
            # Create new obligation
            obligation = ComplianceObligationService.create_compliance_obligation(
                compliance_report_version.id, new_summary.excess_emissions
            )
            ElicensingObligationService.handle_obligation_integration(
                obligation.id, compliance_report.compliance_period
            )

        # Create new earned credit record if new version has earned credits
        if new_summary.credited_emissions > ZERO_DECIMAL:
            ComplianceEarnedCreditsService.create_earned_credits_record(compliance_report_version)
            compliance_report_version.status = ComplianceReportVersion.ComplianceStatus.EARNED_CREDITS
            compliance_report_version.save()

        return compliance_report_version


# Concrete strategy for increased obligations
class IncreasedObligationHandler:
    @staticmethod
    def can_handle(new_summary: ReportComplianceSummary, previous_summary: ReportComplianceSummary) -> bool:
        # Return True if excess emissions increased from previous version
        return (
            new_summary.excess_emissions > ZERO_DECIMAL
            and previous_summary.excess_emissions < new_summary.excess_emissions
        )

    @staticmethod
    def handle(
        compliance_report: ComplianceReport,
        new_summary: ReportComplianceSummary,
        previous_summary: ReportComplianceSummary,
        version_count: int,
    ) -> Optional[ComplianceReportVersion]:
        # Handle increased obligation logic
        excess_emission_delta = new_summary.excess_emissions - previous_summary.excess_emissions
        previous_compliance_version = (
            SupplementaryVersionService._get_previous_compliance_version_by_report_and_summary(
                compliance_report, previous_summary
            )
        )

        compliance_report_version = ComplianceReportVersion.objects.create(
            compliance_report=compliance_report,
            report_compliance_summary=new_summary,
            status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET,
            excess_emissions_delta_from_previous=excess_emission_delta,
            is_supplementary=True,
            previous_version=previous_compliance_version,
        )
        obligation = ComplianceObligationService.create_compliance_obligation(
            compliance_report_version.id, excess_emission_delta
        )
        ElicensingObligationService.handle_obligation_integration(obligation.id, compliance_report.compliance_period)
        return compliance_report_version


# Concrete strategy for decreased obligations
class DecreasedObligationHandler:
    @staticmethod
    def can_handle(new_summary: ReportComplianceSummary, previous_summary: ReportComplianceSummary) -> bool:
        # Return True if excess emissions decreased from previous version
        return (
            previous_summary.excess_emissions > ZERO_DECIMAL
            and new_summary.excess_emissions < previous_summary.excess_emissions
        )

    @staticmethod
    def handle(
        compliance_report: ComplianceReport,
        new_summary: ReportComplianceSummary,
        previous_summary: ReportComplianceSummary,
        version_count: int,
    ) -> Optional[ComplianceReportVersion]:
        """
        Main entry point for a DECREASED obligation scenario.

        High-level flow:
        1. Compute the delta in tCO2e from previous CRV.
        2. Look up the applicable charge rate (dollars per tCO2e).
        3. Create a new *supplementary* ComplianceReportVersion linked to the prior version.
        4. Find the newest unpaid 'anchor' CRV (closest prior CRV that has an unpaid, non-void invoice).
        5. Collect unpaid invoices, non void newest→oldest from that anchor.
        6. Build an `AdjustmentStrategy` that describes how dollars and tonnes will be allocated.
        7. Defer all actual DB side effects to `transaction.on_commit` to ensure consistency.

        Returns:
            The newly created supplementary ComplianceReportVersion
        """
        # Compute delta in tCO2e
        excess_emission_delta = new_summary.excess_emissions - previous_summary.excess_emissions

        # Charge rate for the applicable reporting year (used for $ conversions)
        charge_rate = ComplianceChargeRateService.get_rate_for_year(new_summary.report_version.report.reporting_year)

        # Previous CRV in this chain used to link our new supplementary version
        previous_compliance_version = (
            SupplementaryVersionService._get_previous_compliance_version_by_report_and_summary(
                compliance_report, previous_summary
            )
        )

        # Create the NEW supplementary CRV, carry the delta and linkage
        compliance_report_version = ComplianceReportVersion.objects.create(
            compliance_report=compliance_report,
            report_compliance_summary=new_summary,
            status=ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS,
            excess_emissions_delta_from_previous=excess_emission_delta,
            is_supplementary=True,
            previous_version=previous_compliance_version,
        )

        # 1) Find the correct baseline (“anchor”)
        #    This walks the CRV→previous_version chain and returns the nearest prior CRV that still has a non-void, unpaid invoice.
        #    sets the comparison baseline (the “anchor_prev_excess”) so we don’t over/under-refund by comparing against the wrong version.
        #    gates the flow: no anchor ⇒ no unpaid invoices to apply a refund to
        anchor = DecreasedObligationHandler._find_newest_unpaid_anchor_along_chain(previous_compliance_version)

        # 2) Collect newest-first unpaid invoices from the anchor backwards.
        #    NOTE: Each invoice is refreshed before inclusion to ensure up-to-date outstanding balances.
        invoices = (
            DecreasedObligationHandler._collect_unpaid_obligations_for_crv_chain_newest_first(anchor) if anchor else []
        )

        # 3) Build a normalized strategy dict
        # The strategy object returned by the determination functions is the single contract used _process_adjustment_after_commit
        # invoices: list of InvoiceAdjustment entries, each with `version_id`, `applied`, `net_outstanding_after`, `mark_fully_met`, `should_void_invoice`.
        # should_record_manual_handling: boolean flag.

        if invoices:
            # anchor_prev_excess comes from the newest unpaid CRV (first in the list)
            anchor_prev_excess = invoices[0]["prev_excess_emissions"]
        else:
            # no invoices: compare against the previous_summary’s excess as the baseline
            anchor_prev_excess = previous_summary.excess_emissions

        fallback_prev_id = getattr(previous_compliance_version, "id", None)
        anchor_id_for_strategy = getattr(anchor, "id", None) or fallback_prev_id

        strategy: AdjustmentStrategy = DecreasedObligationHandler._build_adjustment_strategy(
            new_excess_emissions=new_summary.excess_emissions,
            anchor_prev_excess=anchor_prev_excess,
            charge_rate=charge_rate,
            invoices=invoices,  # 0/1/many
            anchor_crv_id=anchor_id_for_strategy,
        )

        # 4) Defer all side effects until after the DB transaction commits, guaranteeing consistency.
        # All changes that touch invoices, create adjustments, update CRV fields are performed inside `_process_adjustment_after_commit`
        transaction.on_commit(
            lambda: DecreasedObligationHandler._process_adjustment_after_commit(
                compliance_report_version_id=compliance_report_version.id,
                strategy=strategy,
            )
        )

        return compliance_report_version

    # ---------------------------------
    # Posting/side-effects
    # ---------------------------------

    @staticmethod
    def _process_adjustment_after_commit(
        compliance_report_version_id: int,
        strategy: AdjustmentStrategy,
    ) -> None:
        """
        Execute the "strategy" produced in handle():

        For each invoice in strategy["invoices"]:
          - Post a signed negative adjustment (reduces outstanding).
          - If net outstanding hits zero, mark that previous CRV as FULLY_MET.
          - If fully met AND no prior CASH payments, void the invoice.


        """
        for entry in strategy.invoices:
            applied = entry.applied
            if applied != ZERO_DECIMAL:
                reason = (
                    ElicensingAdjustment.Reason.SUPPLEMENTARY_REPORT_ADJUSTMENT_TO_VOID_INVOICE
                    if entry.should_void_invoice
                    else ElicensingAdjustment.Reason.SUPPLEMENTARY_REPORT_ADJUSTMENT
                )
                ComplianceAdjustmentService.create_adjustment_for_target_version(
                    target_compliance_report_version_id=entry.version_id,
                    adjustment_total=applied,
                    supplementary_compliance_report_version_id=compliance_report_version_id,
                    reason=reason,
                )

            if entry.mark_fully_met:
                DecreasedObligationHandler._mark_previous_version_fully_met(entry.version_id)
            if entry.should_void_invoice:
                DecreasedObligationHandler._void_unpaid_invoices(entry.version_id)

        if strategy.should_record_manual_handling:
            DecreasedObligationHandler._record_manual_handling(compliance_report_version_id)

    # -------------------------------
    # Version strategy
    # -------------------------------
    @staticmethod
    def _build_adjustment_strategy(
        new_excess_emissions: Decimal,
        anchor_prev_excess: Decimal,
        charge_rate: Decimal,
        invoices: list[dict],
        anchor_crv_id: Optional[int] = None,
    ) -> AdjustmentStrategy:
        """
        Determine how to allocate a decreased-obligation refund across zero, one, or multiple invoices.

         Behavior:
        - Works for any number of unpaid invoices (0/1/many), newest → oldest.
        - Calculates total refund since the anchor CRV:
            refund_pool = max(-(new_excess_emissions - anchor_prev_excess) * charge_rate, 0)
        - Deducts any supplementary adjustments already applied since the anchor.
        - For each invoice:
            * Apply refund up to its outstanding balance.
            * Mark FULLY_MET if outstanding becomes zero.
            * VOID invoice only if FULLY_MET and no prior cash payments.

        Returns:
            AdjustmentStrategy: containing invoice adjustments, and a flag
            for the manual-handling rule:
                • If the obligation ends up fully paid (no outstanding invoices), AND
                • The refund pool represents real cash (not just prior adjustments),
                then flag manual handling.
        """

        rate = (charge_rate or ZERO_DECIMAL).quantize(Decimal("0.00"))
        excess_new = (new_excess_emissions or ZERO_DECIMAL).quantize(EMISS)
        anchor_prev = (anchor_prev_excess or ZERO_DECIMAL).quantize(EMISS)

        # Negative delta means "refund owed"; convert to positive dollars for allocation
        delta_emiss = (excess_new - anchor_prev).quantize(EMISS)
        money_delta = (delta_emiss * rate).quantize(MONEY)
        total_refund_vs_anchor = max(-money_delta, ZERO_DECIMAL).quantize(MONEY)

        # Subtract supplementary credits already applied across these invoices since the anchor
        invoice_ids = [i["invoice_id"] for i in invoices if "invoice_id" in i]
        anchor_for_adjustment_window = invoices[0]["version_id"] if invoices else anchor_crv_id

        already_applied = (
            DecreasedObligationHandler._sum_already_applied_supplementary_adjustments_since_anchor(
                anchor_for_adjustment_window, invoice_ids  # use the local window id
            )
            if (anchor_for_adjustment_window and invoice_ids)
            else ZERO_DECIMAL
        )
        refund_pool = max(total_refund_vs_anchor - already_applied, ZERO_DECIMAL).quantize(MONEY)

        per_invoice: list[InvoiceAdjustment] = []

        for inv in invoices:
            outstanding = (inv["outstanding"] or ZERO_DECIMAL).quantize(MONEY)
            prev_payments = (inv["paid"] or ZERO_DECIMAL).quantize(MONEY)

            # If nothing left to allocate, carry current state forward
            if refund_pool <= ZERO_DECIMAL:
                per_invoice.append(
                    InvoiceAdjustment(
                        version_id=inv["version_id"],
                        applied=ZERO_DECIMAL,
                        net_outstanding_after=outstanding,
                        mark_fully_met=(outstanding == ZERO_DECIMAL),
                        should_void_invoice=False,
                    )
                )
                continue

            # Apply as much as possible to this invoice's outstanding
            apply_abs = min(refund_pool, outstanding).quantize(MONEY)
            net_outstanding_after = (outstanding - apply_abs).quantize(MONEY)
            mark_fully_met = net_outstanding_after == ZERO_DECIMAL

            # Void only if fully met and no prior cash payments
            should_void = mark_fully_met and prev_payments == ZERO_DECIMAL

            per_invoice.append(
                InvoiceAdjustment(
                    version_id=inv["version_id"],
                    applied=-apply_abs,  # negative reduces outstanding
                    net_outstanding_after=net_outstanding_after,
                    mark_fully_met=mark_fully_met,
                    should_void_invoice=should_void,
                )
            )

            # Reduce the shared pool for next (older) invoice
            refund_pool = (refund_pool - apply_abs).quantize(MONEY)

        # --- Manual handling decision -------------------------------------------
        # Fully paid if no invoices OR all tracked invoices end at $0.
        fully_paid_obligation = (len(per_invoice) == 0) or all(
            e.net_outstanding_after == ZERO_DECIMAL for e in per_invoice
        )

        should_record_manual_handling = False
        has_cash = False  # keep for logging if you print later
        if fully_paid_obligation and refund_pool > ZERO_DECIMAL:
            # Prefer using precomputed per-invoice 'paid' when available.
            has_cash = any((inv.get("paid") or ZERO_DECIMAL) > ZERO_DECIMAL for inv in invoices)

            # Fallback when there are NO invoices but we have an anchor_crv_id
            if not has_cash and not invoices and anchor_crv_id:
                prior_invoices = ElicensingInvoice.objects.filter(
                    compliance_obligation__compliance_report_version_id=anchor_crv_id
                ).prefetch_related(
                    Prefetch(
                        "elicensing_line_items",
                        queryset=ElicensingLineItem.objects.filter(
                            line_item_type=ElicensingLineItem.LineItemType.FEE
                        ).prefetch_related("elicensing_payments"),
                    )
                )
                cash_total = ZERO_DECIMAL
                for _inv in prior_invoices:
                    cash_total += DecreasedObligationHandler._sum_invoice_cash_payments(_inv)
                has_cash = cash_total > ZERO_DECIMAL

            if has_cash:
                should_record_manual_handling = True

        return AdjustmentStrategy(
            invoices=per_invoice,
            should_record_manual_handling=should_record_manual_handling,
        )

    # ------------------------------------------------------------
    #  Collecting helpers
    # ------------------------------------------------------------

    @staticmethod
    def _find_newest_unpaid_anchor_along_chain(
        start: Optional[ComplianceReportVersion],
    ) -> Optional[ComplianceReportVersion]:
        """
        Find the nearest previous ComplianceReportVersion that has a non-void invoice
        with outstanding balance > 0.

        Returns:
            The "anchor" CRV (nearest unpaid) or None if no such CRV exists.
        """
        if not start:
            return None

        # Build the backward chain of CRV ids (start -> oldest), preserving order
        chain_ids: list[int] = []
        seen: set[int] = set()
        cur: Optional[ComplianceReportVersion] = start
        while cur is not None and cur.id not in seen:
            seen.add(cur.id)
            chain_ids.append(cur.id)
            cur = cast(Optional[ComplianceReportVersion], getattr(cur, "previous_version", None))

        if not chain_ids:
            return None

        # Rank by the position in the chain (0 = newest/start)
        rank_case = Case(
            *[When(compliance_report_version_id=crv_id, then=Value(idx)) for idx, crv_id in enumerate(chain_ids)],
            default=Value(len(chain_ids)),  # anything not in chain goes to the end
            output_field=IntegerField(),
        )

        # Filtering: only obligations in the chain with a non-void invoice and outstanding > 0
        candidates: QuerySet[ComplianceObligation] = (
            ComplianceObligation.objects.select_related("elicensing_invoice")
            .filter(
                compliance_report_version_id__in=chain_ids,
                elicensing_invoice__isnull=False,
                elicensing_invoice__is_void=False,
                elicensing_invoice__outstanding_balance__gt=ZERO_DECIMAL,
            )
            .annotate(_rank=rank_case)
            .order_by("_rank")  # preserve chain order, newest first
        )
        first = candidates.first()
        if not first:
            return None

        # Refresh the *top* candidate(s) only, in order
        for obligation in candidates:
            crv_id = obligation.compliance_report_version_id
            wrap = ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id(crv_id, True)
            inv = getattr(wrap, "invoice", None)
            if inv and not getattr(inv, "is_void", False):
                outstanding = getattr(inv, "outstanding_balance", ZERO_DECIMAL) or ZERO_DECIMAL
                if outstanding > ZERO_DECIMAL:
                    # Return the CRV itself (mirrors your original behavior)
                    return ComplianceReportVersion.objects.get(id=crv_id)

        return None

    @staticmethod
    def _collect_unpaid_obligations_for_crv_chain_newest_first(anchor: ComplianceReportVersion) -> List[Dict]:
        """
        Walk back through previous_version pointers (newest → oldest).
        Collect only CRVs with non-void invoices and outstanding > 0.

        DB filtering improvements:
        - Build the CRV chain once (Python) to preserve the custom newest→oldest order.
        - Filter to obligations with a non-void invoice and outstanding > 0 in the DB.
        - Order results by the chain order via a CASE annotation.
        - Bulk-load related CRV, summary, and invoice to avoid per-row queries.
        - Refresh only the filtered candidates (often just a few).
        """
        results: List[Dict] = []
        if not anchor:
            return results

        # 1) Build the chain (anchor → oldest) and preserve order
        chain_ids: list[int] = []
        seen: set[int] = set()
        cur: Optional[ComplianceReportVersion] = anchor
        while cur and cur.id not in seen:
            seen.add(cur.id)
            chain_ids.append(cur.id)
            cur = getattr(cur, "previous_version", None)

        if not chain_ids:
            return results

        # 2) Rank by position in the chain (0 = newest)
        rank_case = Case(
            *[When(compliance_report_version_id=crv_id, then=Value(idx)) for idx, crv_id in enumerate(chain_ids)],
            default=Value(len(chain_ids)),
            output_field=IntegerField(),
        )

        # 3) Bulk select related invoice and CRV + summary
        candidates = (
            ComplianceObligation.objects.select_related(
                "elicensing_invoice",
                "compliance_report_version",
                "compliance_report_version__report_compliance_summary",
            )
            .filter(
                compliance_report_version_id__in=chain_ids,
                elicensing_invoice__isnull=False,
                elicensing_invoice__is_void=False,
                elicensing_invoice__outstanding_balance__gt=ZERO_DECIMAL,
            )
            .annotate(_rank=rank_case)
            .order_by("_rank")  # newest → oldest per chain order
        )

        # 4) Iterate only filtered candidates
        for obligation in candidates:
            crv = obligation.compliance_report_version
            wrap = ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id(crv.id, True)
            inv_refreshed = getattr(wrap, "invoice", None)
            if not inv_refreshed or getattr(inv_refreshed, "is_void", False):
                continue

            outstanding = (getattr(inv_refreshed, "outstanding_balance", ZERO_DECIMAL) or ZERO_DECIMAL).quantize(MONEY)
            if outstanding <= ZERO_DECIMAL:
                continue

            # Use preloaded summary for prev_excess
            summary = getattr(crv, "report_compliance_summary", None)
            prev_excess = (getattr(summary, "excess_emissions", ZERO_DECIMAL) or ZERO_DECIMAL).quantize(EMISS)

            # Sum payments
            paid: Decimal = DecreasedObligationHandler._sum_invoice_cash_payments(inv_refreshed)

            results.append(
                {
                    "version_id": crv.id,
                    "invoice_id": inv_refreshed.id,
                    "outstanding": outstanding,
                    "paid": paid,
                    "prev_excess_emissions": prev_excess,
                }
            )

        return results

    @staticmethod
    def _sum_already_applied_supplementary_adjustments_since_anchor(
        anchor_crv_id: int,
        invoice_ids: list[int],
    ) -> Decimal:
        """
        Sum the signed amounts of SUPPLEMENTARY adjustments applied to FEE line items
        on the given invoices WHERE the supplementary CRV id >= anchor id.

        Returned as a POSITIVE dollar amount to be subtracted from the refund pool.
        """
        if not invoice_ids:
            return ZERO_DECIMAL

        total_signed: Decimal = (
            ElicensingAdjustment.objects.filter(
                elicensing_line_item__elicensing_invoice_id__in=invoice_ids,
                elicensing_line_item__line_item_type=ElicensingLineItem.LineItemType.FEE,
                reason__in=(
                    ElicensingAdjustment.Reason.SUPPLEMENTARY_REPORT_ADJUSTMENT,
                    ElicensingAdjustment.Reason.SUPPLEMENTARY_REPORT_ADJUSTMENT_TO_VOID_INVOICE,
                ),
                supplementary_compliance_report_version__id__gte=anchor_crv_id,
                amount__isnull=False,
            )
            .aggregate(total=Coalesce(Sum("amount"), ZERO_DECIMAL))
            .get("total", ZERO_DECIMAL)
        )

        already_applied = max(-total_signed, ZERO_DECIMAL).quantize(MONEY)
        return already_applied

    @staticmethod
    def _sum_invoice_cash_payments(invoice: ElicensingInvoice) -> Decimal:
        """
        Sum CASH payments applied to FEE line items for a given invoice.

        Used only for the "voiding" rule:
          - We void only if the invoice becomes fully met AND there were no CASH payments.
        """
        fee_line_items: QuerySet[ElicensingLineItem] = invoice.elicensing_line_items.filter(
            line_item_type=ElicensingLineItem.LineItemType.FEE
        ).prefetch_related(Prefetch("elicensing_payments"))
        total = ZERO_DECIMAL
        for line_item in fee_line_items:
            for p in line_item.elicensing_payments.all():
                if p.amount is not None:
                    total += p.amount
        return (total or ZERO_DECIMAL).quantize(MONEY)

    # -------------------------------
    # Side-effect helpers
    # -------------------------------

    @staticmethod
    def _void_unpaid_invoices(previous_version_id: int) -> None:
        """
        Mark all NON-VOID invoices tied to the given previous CRV as void.

        Only called when:
          - The invoice is fully met by adjustments AND
          - There were no CASH payments (keeps accounting clean).
        """
        ElicensingInvoice.objects.filter(
            compliance_obligation__compliance_report_version_id=previous_version_id,
            is_void=False,
        ).update(is_void=True)

    @staticmethod
    def _mark_previous_version_fully_met(previous_version_id: int) -> None:
        """
        Set the previous CRV's status to OBLIGATION_FULLY_MET when its invoice reaches $0 outstanding.
        """
        ComplianceReportVersion.objects.filter(id=previous_version_id).update(
            status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_FULLY_MET
        )

    @staticmethod
    def _record_manual_handling(
        compliance_report_version_id: int,
    ) -> None:
        """
        Set requires_manual_handling refundable dollars
        """
        ComplianceReportVersion.objects.filter(id=compliance_report_version_id).update(
            requires_manual_handling=True,
        )


# Concrete strategy for no significant change
class NoChangeHandler:
    @staticmethod
    def can_handle(new_summary: ReportComplianceSummary, previous_summary: ReportComplianceSummary) -> bool:
        if (
            new_summary.excess_emissions == previous_summary.excess_emissions
            and new_summary.credited_emissions == previous_summary.credited_emissions
        ):
            return True
        return False

    @staticmethod
    def handle(
        compliance_report: ComplianceReport,
        new_summary: ReportComplianceSummary,
        previous_summary: ReportComplianceSummary,
        version_count: int,
    ) -> Optional[ComplianceReportVersion]:
        # Get the previous compliance report version
        previous_compliance_version = (
            SupplementaryVersionService._get_previous_compliance_version_by_report_and_summary(
                compliance_report, previous_summary
            )
        )

        compliance_report_version = ComplianceReportVersion.objects.create(
            compliance_report=compliance_report,
            report_compliance_summary=new_summary,
            status=ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS,
            is_supplementary=True,
            previous_version=previous_compliance_version,
        )
        return compliance_report_version


# Concrete strategy for increased credits
class IncreasedCreditHandler:
    @staticmethod
    def can_handle(new_summary: ReportComplianceSummary, previous_summary: ReportComplianceSummary) -> bool:
        previous_compliance_report_version = ComplianceReportVersion.objects.get(
            report_compliance_summary=previous_summary
        )
        # Get the previous earned credit record
        previous_earned_credit_record = ComplianceEarnedCredit.objects.filter(
            compliance_report_version=previous_compliance_report_version
        ).first()

        if not previous_earned_credit_record:
            return False
        # Return True if excess emissions increased from previous version
        return ZERO_DECIMAL < previous_summary.credited_emissions < new_summary.credited_emissions

    @staticmethod
    @transaction.atomic()
    def handle(
        compliance_report: ComplianceReport,
        new_summary: ReportComplianceSummary,
        previous_summary: ReportComplianceSummary,
        version_count: int,
    ) -> Optional[ComplianceReportVersion]:
        # Get the previous compliance report version
        previous_compliance_version = (
            SupplementaryVersionService._get_previous_compliance_version_by_report_and_summary(
                compliance_report, previous_summary
            )
        )
        # Get the previous earned_credit record
        previous_earned_credit = ComplianceEarnedCredit.objects.get(
            compliance_report_version=previous_compliance_version
        )

        credited_emission_delta = int(new_summary.credited_emissions - previous_summary.credited_emissions)
        # Create a compliance_report_version record with the 'earned credits' status (status will change if credits not requested)
        compliance_report_version = ComplianceReportVersion.objects.create(
            compliance_report=compliance_report,
            report_compliance_summary=new_summary,
            status=ComplianceReportVersion.ComplianceStatus.EARNED_CREDITS,
            credited_emissions_delta_from_previous=credited_emission_delta,
            is_supplementary=True,
            previous_version=previous_compliance_version,
        )

        if previous_earned_credit.issuance_status == ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED:
            previous_earned_credit.earned_credits_amount = (
                previous_earned_credit.earned_credits_amount + credited_emission_delta
            )
            previous_earned_credit.save()
            compliance_report_version.status = ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS
            compliance_report_version.save()

        if previous_earned_credit.issuance_status == ComplianceEarnedCredit.IssuanceStatus.APPROVED:
            ComplianceEarnedCreditsService.create_earned_credits_record(
                compliance_report_version, credited_emission_delta
            )
        if previous_earned_credit.issuance_status in (
            ComplianceEarnedCredit.IssuanceStatus.DECLINED,
            ComplianceEarnedCredit.IssuanceStatus.ISSUANCE_REQUESTED,
            ComplianceEarnedCredit.IssuanceStatus.CHANGES_REQUIRED,
        ):
            # since no amount arg is provided, it will be taken from the report version's credited emissions
            ComplianceEarnedCreditsService.create_earned_credits_record(compliance_report_version)

            # If previously requested, mark it as declined
            if previous_earned_credit.issuance_status in (
                ComplianceEarnedCredit.IssuanceStatus.ISSUANCE_REQUESTED,
                ComplianceEarnedCredit.IssuanceStatus.CHANGES_REQUIRED,
            ):
                previous_earned_credit.issuance_status = ComplianceEarnedCredit.IssuanceStatus.DECLINED
                previous_earned_credit.save()

        return compliance_report_version


# Concrete strategy for decreased credits
class DecreasedCreditHandler:
    @staticmethod
    def can_handle(new_summary: ReportComplianceSummary, previous_summary: ReportComplianceSummary) -> bool:
        # Return True if credited emissions decreased from previous version
        previous_compliance_report_version = ComplianceReportVersion.objects.get(
            report_compliance_summary=previous_summary,
        )
        # Get the original earned credit record
        previous_earned_credit_record = ComplianceEarnedCredit.objects.filter(
            compliance_report_version=previous_compliance_report_version
        ).first()
        if not previous_earned_credit_record:
            return False

        return (
            previous_summary.credited_emissions > ZERO_DECIMAL
            and new_summary.credited_emissions < previous_summary.credited_emissions
        )

    @staticmethod
    def handle(
        compliance_report: ComplianceReport,
        new_summary: ReportComplianceSummary,
        previous_summary: ReportComplianceSummary,
        version_count: int,
    ) -> Optional[ComplianceReportVersion]:

        credited_emission_delta = int(new_summary.credited_emissions - previous_summary.credited_emissions)
        previous_compliance_version = (
            SupplementaryVersionService._get_previous_compliance_version_by_report_and_summary(
                compliance_report, previous_summary
            )
        )
        # Create a compliance_report_version record with the 'earned credits' status (status will change if credits not requested)
        compliance_report_version = ComplianceReportVersion.objects.create(
            compliance_report=compliance_report,
            report_compliance_summary=new_summary,
            status=ComplianceReportVersion.ComplianceStatus.EARNED_CREDITS,
            credited_emissions_delta_from_previous=credited_emission_delta,
            is_supplementary=True,
            previous_version=previous_compliance_version,
        )
        # Get the previous earned_credit record
        previous_earned_credit = ComplianceEarnedCredit.objects.get(
            compliance_report_version=previous_compliance_version
        )

        # Previously approved → flag manual handling, do not mutate/move prior credit
        if previous_earned_credit.issuance_status == ComplianceEarnedCredit.IssuanceStatus.APPROVED:
            compliance_report_version.requires_manual_handling = True
            compliance_report_version.save(update_fields=["requires_manual_handling"])
            return compliance_report_version

        # if credits weren't requested, update the previous earned credit record
        if previous_earned_credit.issuance_status == ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED:

            previous_earned_credit.earned_credits_amount = (
                previous_earned_credit.earned_credits_amount + credited_emission_delta
            )
            previous_earned_credit.save()

            compliance_report_version.status = ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS
            compliance_report_version.save()

            return compliance_report_version

        # if credits were requested, create a new earned credit record and decline the old one
        ComplianceEarnedCreditsService.create_earned_credits_record(compliance_report_version)
        previous_earned_credit.issuance_status = ComplianceEarnedCredit.IssuanceStatus.DECLINED
        previous_earned_credit.save()

        return compliance_report_version


class SupplementaryVersionService:
    def __init__(self) -> None:
        self.handlers: list[SupplementaryScenarioHandler] = [
            IncreasedObligationHandler(),
            DecreasedObligationHandler(),
            NoChangeHandler(),
            IncreasedCreditHandler(),
            DecreasedCreditHandler(),
        ]

    @staticmethod
    def _get_previous_compliance_version_by_report_and_summary(
        compliance_report: ComplianceReport, previous_summary: ReportComplianceSummary
    ) -> ComplianceReportVersion:
        return ComplianceReportVersion.objects.get(
            compliance_report=compliance_report,
            report_compliance_summary=previous_summary,
        )

    @staticmethod
    def _obligation_has_no_invoice(previous_compliance_report_version: ComplianceReportVersion) -> bool:
        previous_obligation = ComplianceObligation.objects.get(
            compliance_report_version=previous_compliance_report_version
        )
        return (
            previous_compliance_report_version.status
            == ComplianceReportVersion.ComplianceStatus.OBLIGATION_PENDING_INVOICE_CREATION
            and previous_obligation.elicensing_invoice is None
        )

    @staticmethod
    def _earned_credits_not_issued(previous_compliance_report_version: ComplianceReportVersion) -> bool:
        previous_earned_credit = ComplianceEarnedCredit.objects.get(
            compliance_report_version=previous_compliance_report_version
        )
        return previous_earned_credit.issuance_status == ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED

    @transaction.atomic
    def handle_supplementary_version(
        self, compliance_report: ComplianceReport, report_version: ReportVersion, version_count: int
    ) -> Optional[ComplianceReportVersion]:

        # Get the previous version (lower ID = older)
        previous_version = (
            ReportVersion.objects.filter(report_id=report_version.report_id, id__lt=report_version.id)
            .order_by('-id')
            .first()
        )  # Get the most recent one that's older
        if not previous_version:
            logger.error(f"No previous version found for report version {report_version.id}")
            return None  # No previous version exists

        new_version_compliance_summary = ReportComplianceSummary.objects.get(report_version_id=report_version.id)
        previous_version_compliance_summary = ReportComplianceSummary.objects.get(report_version_id=previous_version.id)

        # If the previous version can be superceded, run the supercede handler & exit
        if SupercedeVersionHandler.can_handle(
            new_summary=new_version_compliance_summary, previous_summary=previous_version_compliance_summary
        ):
            SupercedeVersionHandler.handle(
                compliance_report=compliance_report,
                new_summary=new_version_compliance_summary,
                previous_summary=previous_version_compliance_summary,
                version_count=version_count,
            )
            return None
        # Find the right handler and delegate
        for handler in self.handlers:
            if handler.can_handle(
                new_summary=new_version_compliance_summary, previous_summary=previous_version_compliance_summary
            ):
                return handler.handle(
                    compliance_report=compliance_report,
                    new_summary=new_version_compliance_summary,
                    previous_summary=previous_version_compliance_summary,
                    version_count=version_count,
                )
        logger.error(
            f"No handler found for report version {report_version.id} and compliance report {compliance_report.id}"
        )
        return None
