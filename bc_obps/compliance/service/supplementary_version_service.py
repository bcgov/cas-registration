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

from django.db.models import Prefetch, QuerySet
from django.db import transaction
from decimal import Decimal
from typing import Protocol, Optional
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
        Create a supplementary ComplianceReportVersion,
        compute an invoice-aware adjustment strategy (single or multi-invoice),
        and schedule posting/crediting work on transaction commit.        
        
        Returns:
            The created supplementary ComplianceReportVersion.
      
        """
        excess_emission_delta = new_summary.excess_emissions - previous_summary.excess_emissions
        charge_rate = ComplianceChargeRateService.get_rate_for_year(
            new_summary.report_version.report.reporting_year
        )
        previous_compliance_version = (
            SupplementaryVersionService._get_previous_compliance_version_by_report_and_summary(
                compliance_report, previous_summary
            )
        )

        compliance_report_version = ComplianceReportVersion.objects.create(
            compliance_report=compliance_report,
            report_compliance_summary=new_summary,
            status=ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS,
            excess_emissions_delta_from_previous=excess_emission_delta,
            is_supplementary=True,
            previous_version=previous_compliance_version,
        )
        
        # 1) Find newest unpaid anchor (unpaid & non-void). If none, we’ll convert refund to credits.
        anchor = DecreasedObligationHandler._find_newest_unpaid_anchor_along_chain(previous_compliance_version)
      
        # 2) Collect newest-first unpaid invoices walking down the chain from the anchor.
        invoices = (
            DecreasedObligationHandler._collect_unpaid_invoices_newest_first(anchor, charge_rate)
            if anchor else []
        )

        # 3) Build a normalized strategy dict the poster can consume.
        if len(invoices) == 0:
            strategy = DecreasedObligationHandler._determine_multi_invoice_strategy_dict(
                new_excess_emissions=new_summary.excess_emissions,
                anchor_prev_excess=previous_summary.excess_emissions,
                charge_rate=charge_rate,
                credited_emissions=new_summary.credited_emissions,
                invoices=[],  # none to apply to
            )

        elif len(invoices) == 1:
            inv = invoices[0]
            single = DecreasedObligationHandler._determine_adjustment_strategy(
                new_excess_emissions=new_summary.excess_emissions,
                previous_excess_emissions=inv["prev_excess_emissions"],
                charge_rate=charge_rate,
                invoice_outstanding_balance=inv["outstanding"],
                credited_emissions=new_summary.credited_emissions,
                invoice_paid_amount=inv["paid"], 
            )
            strategy = {
                "invoices": [
                    {
                        "version_id": inv["version_id"],
                        "applied": single["applied_to_invoice"],
                        "net_outstanding_after": inv["outstanding"] + single["applied_to_invoice"],
                        "mark_fully_met": single["mark_previous_fully_met"],
                        "should_void_invoice": single["should_void_invoice"],
                    }
                ],
                "credits_tonnes": single["credits_tonnes"],
                "create_earned_credits": single["create_earned_credits"],
            }

        else:
            anchor_prev_excess = invoices[0]["prev_excess_emissions"]
            strategy = DecreasedObligationHandler._determine_multi_invoice_strategy_dict(
                new_excess_emissions=new_summary.excess_emissions,
                anchor_prev_excess=anchor_prev_excess,
                charge_rate=charge_rate,
                credited_emissions=new_summary.credited_emissions,
                invoices=invoices,
            )

        transaction.on_commit(
            lambda: DecreasedObligationHandler._process_adjustment_after_commit(
                previous_version_id=previous_compliance_version.id,  # kept for compatibility
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
        previous_version_id: int, compliance_report_version_id: int, strategy: dict
    ) -> None:
        """
        Posts per-invoice adjustments (up to outstanding), marks fully met,
        optionally voids (if fully met & no prior payments), then creates credits.
        """
        # Post per-invoice (supports single or multiple)
        for entry in strategy.get("invoices", []):
            applied = entry.get("applied", ZERO_DECIMAL)
            if applied != ZERO_DECIMAL:
                reason = (
                    ElicensingAdjustment.Reason.SUPPLEMENTARY_REPORT_ADJUSTMENT_TO_VOID_INVOICE
                    if entry.get("should_void_invoice")
                    else ElicensingAdjustment.Reason.SUPPLEMENTARY_REPORT_ADJUSTMENT
                )
                
                ComplianceAdjustmentService.create_adjustment_for_target_version(
                    target_compliance_report_version_id=entry["version_id"],
                    adjustment_total=applied,  # signed (negative reduces outstanding)
                    supplementary_compliance_report_version_id=compliance_report_version_id,
                    reason=reason,
                )

            if entry.get("mark_fully_met"):
                DecreasedObligationHandler._mark_previous_version_fully_met(entry["version_id"])
            if entry.get("should_void_invoice"):
                DecreasedObligationHandler._void_unpaid_invoices(entry["version_id"])

        # Surplus → earned credits on the NEW CRV
        if strategy.get("create_earned_credits"):
            tonnes = strategy.get("credits_tonnes", ZERO_DECIMAL)
            if tonnes > ZERO_DECIMAL:
                DecreasedObligationHandler._create_earned_credits(compliance_report_version_id, tonnes)

    # -------------------------------
    # Single version strategy
    # -------------------------------

    @staticmethod
    def _determine_adjustment_strategy(
        new_excess_emissions: Decimal,
        previous_excess_emissions: Decimal,
        charge_rate: Decimal,
        invoice_outstanding_balance: Decimal,
        credited_emissions: Optional[Decimal] = None,   # kept for signature compatibility (ignored for credits)
        invoice_paid_amount: Decimal = ZERO_DECIMAL,
    ) -> dict:
        """
        Single-invoice math with decreased-obligation policy:
        - Apply refund to this invoice up to outstanding.
        - Credit surplus
        - Void only if fully met AND there were no cash payments.
        """
        excess = (new_excess_emissions or ZERO_DECIMAL).quantize(EMISS)
        prev = (previous_excess_emissions or ZERO_DECIMAL).quantize(EMISS)
        rate = (charge_rate or ZERO_DECIMAL).quantize(Decimal("0.00"))
        # Exclude credited_emissions from credits in decreased-obligation flow
        credited_in = (credited_emissions or ZERO_DECIMAL).quantize(EMISS)  # logged only; not added to credits

        outstanding = max(invoice_outstanding_balance or ZERO_DECIMAL, ZERO_DECIMAL).quantize(MONEY)
        delta_emiss = (excess - prev).quantize(EMISS)
        adjustment_amount = (delta_emiss * rate).quantize(MONEY)

        refund_abs = max(-adjustment_amount, ZERO_DECIMAL).quantize(MONEY)  # positive $
        apply_abs = min(refund_abs, outstanding).quantize(MONEY)
        remainder = (refund_abs - apply_abs).quantize(MONEY)

        # Credits policy for decreased-obligation:
        over_compliance_tonnes = max(-excess, ZERO_DECIMAL).quantize(EMISS)
        remainder_tonnes = (remainder / rate).quantize(EMISS) if rate > ZERO_DECIMAL else ZERO_DECIMAL
        credits_tonnes = (credited_in + over_compliance_tonnes + remainder_tonnes).quantize(EMISS)        
        
        previous_billed_dollars = (prev * rate).quantize(MONEY)
        previous_payments_dollars = (invoice_paid_amount or ZERO_DECIMAL).quantize(MONEY)  # CASH ONLY
        net_outstanding_after = (outstanding - apply_abs).quantize(MONEY)

        mark_previous_fully_met = (net_outstanding_after == ZERO_DECIMAL)
        should_void_invoice = (mark_previous_fully_met and previous_payments_dollars == ZERO_DECIMAL)

        return {
            "applied_to_invoice": -apply_abs,  # neg reduces outstanding
            "credits_tonnes": credits_tonnes,
            "create_earned_credits": (credits_tonnes > ZERO_DECIMAL),
            "mark_previous_fully_met": mark_previous_fully_met,
            "should_void_invoice": should_void_invoice,
            "net_invoice_outstanding_after": net_outstanding_after,
        }

    # ------------------------------------------------------------
    #  Multiple version strategy
    # ------------------------------------------------------------
    
    @staticmethod
    def _determine_multi_invoice_strategy_dict(
        new_excess_emissions: Decimal,
        anchor_prev_excess: Decimal,
        charge_rate: Decimal,
        credited_emissions: Optional[Decimal],
        invoices: list[dict],
    ) -> dict:
         
        """
            Multi-invoice allocation for **decreased-obligation** scenarios (newest-first).

            Policy:
            - **Refund pool** is computed against the anchor baseline:
                    refund_pool = max(-(new_excess_emissions - anchor_prev_excess) * charge_rate, 0)
                (i.e., only decreases generate a positive refund pool).
            - Allocate the refund **newest-first** across the unpaid, non-void invoices in `invoices`,
                up to each invoice's **current outstanding** (which should be refreshed before calling).
            - For each invoice:
                * post a signed negative adjustment (reduces outstanding),
                * mark the CRV as FULLY_MET when net outstanding becomes 0,
                * **void** only if fully met **and** there have been **no prior cash payments** on that invoice.
                * **Credits** surplus
        """
        rate = (charge_rate or ZERO_DECIMAL).quantize(Decimal("0.00"))
        excess_new = (new_excess_emissions or ZERO_DECIMAL).quantize(EMISS)
        anchor_prev = (anchor_prev_excess or ZERO_DECIMAL).quantize(EMISS)
        credited_in = (credited_emissions or ZERO_DECIMAL).quantize(EMISS)

        delta_emiss = (excess_new - anchor_prev).quantize(EMISS)   # negative => refund
        money_delta = (delta_emiss * rate).quantize(MONEY)
        total_refund_vs_anchor = max(-money_delta, ZERO_DECIMAL).quantize(MONEY)

        # NEW: subtract supplementary credits already posted since the anchor
        anchor_crv_id = invoices[0]["version_id"] if invoices else None
        invoice_ids = [i["invoice_id"] for i in invoices if "invoice_id" in i]
        already_applied = (
            DecreasedObligationHandler._sum_already_applied_supplementary_credits_since_anchor(
                anchor_crv_id, invoice_ids
            ) if (anchor_crv_id and invoice_ids) else ZERO_DECIMAL
        )
        refund_pool = max(total_refund_vs_anchor - already_applied, ZERO_DECIMAL).quantize(MONEY)

        per_invoice: list[dict] = []
        all_cleared = True

        for inv in invoices:
            outstanding = (inv["outstanding"] or ZERO_DECIMAL).quantize(MONEY)
            prev_payments = (inv["paid"] or ZERO_DECIMAL).quantize(MONEY)

            if refund_pool <= ZERO_DECIMAL:
                all_cleared = False
                per_invoice.append(
                    {
                        "version_id": inv["version_id"],
                        "applied": ZERO_DECIMAL,
                        "net_outstanding_after": outstanding,
                        "mark_fully_met": (outstanding == ZERO_DECIMAL),
                        "should_void_invoice": False,
                    }
                )
                continue

            apply_abs = min(refund_pool, outstanding).quantize(MONEY)
            net_outstanding_after = (outstanding - apply_abs).quantize(MONEY)
            mark_fully_met = (net_outstanding_after == ZERO_DECIMAL)
            should_void = (mark_fully_met and prev_payments == ZERO_DECIMAL)

            per_invoice.append(
                {
                    "version_id": inv["version_id"],
                    "applied": -apply_abs,  # signed negative reduces outstanding
                    "net_outstanding_after": net_outstanding_after,
                    "mark_fully_met": mark_fully_met,
                    "should_void_invoice": should_void,
                }
            )

            refund_pool = (refund_pool - apply_abs).quantize(MONEY)
            if not mark_fully_met:
                all_cleared = False

        over_compliance_tonnes = max(-excess_new, ZERO_DECIMAL).quantize(EMISS)
        converted_tonnes = (refund_pool / rate).quantize(EMISS) if (all_cleared and rate > ZERO_DECIMAL) else ZERO_DECIMAL
        credits_tonnes = (credited_in + over_compliance_tonnes + converted_tonnes).quantize(EMISS)

        return {
            "invoices": per_invoice,
            "credits_tonnes": credits_tonnes,
            "create_earned_credits": (credits_tonnes > ZERO_DECIMAL),
        }

  
    # ------------------------------------------------------------
    #  Collecting helpers
    # ------------------------------------------------------------

    @staticmethod
    def _find_newest_unpaid_anchor_along_chain(
        start: Optional[ComplianceReportVersion],
    ) -> Optional[ComplianceReportVersion]:
        """
        Returns the closest previous CRV that has an UNPAID, NON-VOID invoice.
        """
        cur = start
        seen: set[int] = set()
        while cur and cur.id not in seen:
            seen.add(cur.id)
            # Guard: only proceed if this CRV has an obligation with an invoice
            obligation = (
                ComplianceObligation.objects
                .select_related("elicensing_invoice")
                .filter(compliance_report_version_id=cur.id)
                .first()
            )
            if not obligation or not obligation.elicensing_invoice:
                cur = cur.previous_version
                continue

            # Refresh invoice
            wrap = ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id(cur.id, True)
            inv = getattr(wrap, "invoice", None)
            if inv and not getattr(inv, "is_void", False):
                outstanding = (getattr(inv, "outstanding_balance", ZERO_DECIMAL) or ZERO_DECIMAL)
                if outstanding > ZERO_DECIMAL:
                    return cur
            cur = getattr(cur, "previous_version", None)
        return None

    @staticmethod
    def _collect_unpaid_invoices_newest_first(
        anchor: ComplianceReportVersion,
        charge_rate: Decimal,
    ) -> list[dict]:
        results: list[dict] = []
        rate = (charge_rate or ZERO_DECIMAL).quantize(Decimal("0.00"))

        cur = anchor
        seen: set[int] = set()
        while cur and cur.id not in seen:
            seen.add(cur.id)
            wrap = ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id(cur.id, True)
            inv = getattr(wrap, "invoice", None)
            if inv and not getattr(inv, "is_void", False):
                outstanding = (getattr(inv, "outstanding_balance", ZERO_DECIMAL) or ZERO_DECIMAL).quantize(MONEY)
                if outstanding > ZERO_DECIMAL:
                    prev_excess = cur.report_compliance_summary.excess_emissions  # <-- fixed
                    prev_excess = (prev_excess or ZERO_DECIMAL).quantize(EMISS)
                    billed = (prev_excess * rate).quantize(MONEY)
                    paid = DecreasedObligationHandler._sum_invoice_cash_payments(inv)

                    results.append(
                        {
                            "version_id": cur.id,
                            "invoice_id": inv.id,
                            "outstanding": outstanding,
                            "paid": paid,
                            "prev_excess_emissions": prev_excess,
                        }
                    )
            cur = getattr(cur, "previous_version", None)

        return results

    @staticmethod
    def _sum_already_applied_supplementary_credits_since_anchor(
        anchor_crv_id: int,
        invoice_ids: list[int],
    ) -> Decimal:
        """
        Sums signed amounts of supplementary adjustments (credits<0) posted to the given invoices
        by supplementary CRVs whose id >= anchor_crv_id (i.e., the anchor or any later supplementary
        in the same chain). Returns a positive number to subtract from the new refund pool.
        """
        if not invoice_ids:
            return ZERO_DECIMAL

        fee_items: QuerySet[ElicensingLineItem] = (
            ElicensingLineItem.objects
            .filter(
                elicensing_invoice_id__in=invoice_ids,
                line_item_type=ElicensingLineItem.LineItemType.FEE,
            )
            .prefetch_related(Prefetch("elicensing_adjustments"))
        )

        total_signed = ZERO_DECIMAL
        for li in fee_items:
            for adj in li.elicensing_adjustments.all():
                amt = getattr(adj, "amount", None)
                if amt is None:
                    continue
                # Only count supplementary reasons
                if adj.reason not in (
                    ElicensingAdjustment.Reason.SUPPLEMENTARY_REPORT_ADJUSTMENT,
                    ElicensingAdjustment.Reason.SUPPLEMENTARY_REPORT_ADJUSTMENT_TO_VOID_INVOICE,
                ):
                    continue
                supp_crv = getattr(adj, "supplementary_compliance_report_version", None)
                if not supp_crv:
                    continue
                # "since anchor": any supplementary CRV at/after anchor
                if supp_crv.id >= anchor_crv_id:
                    total_signed += amt  # credits should be negative

        # Convert to positive dollars already applied to subtract from pool
        already_applied = max(-total_signed, ZERO_DECIMAL).quantize(MONEY)
        return already_applied

    @staticmethod
    def _sum_invoice_cash_payments(invoice: ElicensingInvoice) -> Decimal:
        fee_line_items: QuerySet[ElicensingLineItem] = (
            invoice.elicensing_line_items
            .filter(line_item_type=ElicensingLineItem.LineItemType.FEE)
            .prefetch_related(Prefetch("elicensing_payments"))
        )
        total = ZERO_DECIMAL
        for line_item in fee_line_items:
            for p in line_item.elicensing_payments.all():
                if p.amount is not None:
                    total += p.amount
        # Invoice voiding decision
        return (total or ZERO_DECIMAL).quantize(MONEY)

    # -------------------------------
    # Side-effect helpers
    # -------------------------------

    @staticmethod
    def _void_unpaid_invoices(previous_version_id: int) -> None:
        ElicensingInvoice.objects.filter(
            compliance_obligation__compliance_report_version_id=previous_version_id,
            is_void=False,
        ).update(is_void=True)

    @staticmethod
    def _mark_previous_version_fully_met(previous_version_id: int) -> None:
        ComplianceReportVersion.objects.filter(id=previous_version_id).update(
            status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_FULLY_MET
        )

    @staticmethod
    def _create_earned_credits(compliance_report_version_id: int, tonnes: Decimal) -> None:
        crv = ComplianceReportVersion.objects.get(id=compliance_report_version_id)
        ComplianceEarnedCreditsService.create_earned_credits_record(
            compliance_report_version=crv,
            amount=int(tonnes),
        )
        ComplianceReportVersion.objects.filter(id=compliance_report_version_id).update(
            status=ComplianceReportVersion.ComplianceStatus.EARNED_CREDITS
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
        original_compliance_report_version = ComplianceReportVersion.objects.get(
            compliance_report=ComplianceReportVersion.objects.get(
                report_compliance_summary=previous_summary
            ).compliance_report,
            is_supplementary=False,
        )
        # Get the original earned credit record
        original_earned_credit_record = ComplianceEarnedCredit.objects.filter(
            compliance_report_version=original_compliance_report_version
        ).first()
        if not original_earned_credit_record:
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
        credited_emission_delta = int(new_summary.credited_emissions - previous_summary.credited_emissions)

        # Create a compliance_report_version record with the 'earned credits' status
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
        original_compliance_report_version = ComplianceReportVersion.objects.get(
            compliance_report=ComplianceReportVersion.objects.get(
                report_compliance_summary=previous_summary
            ).compliance_report,
            is_supplementary=False,
        )
        # Get the original earned credit record
        original_earned_credit_record = ComplianceEarnedCredit.objects.filter(
            compliance_report_version=original_compliance_report_version
        ).first()
        if not original_earned_credit_record:
            return False
        return (
            previous_summary.credited_emissions > ZERO_DECIMAL
            and new_summary.credited_emissions < previous_summary.credited_emissions
            and original_earned_credit_record.issuance_status != ComplianceEarnedCredit.IssuanceStatus.APPROVED
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

        ComplianceEarnedCreditsService.create_earned_credits_record(compliance_report_version)

        # If previously requested, mark it as declined
        if previous_earned_credit.issuance_status in (
            ComplianceEarnedCredit.IssuanceStatus.ISSUANCE_REQUESTED,
            ComplianceEarnedCredit.IssuanceStatus.CHANGES_REQUIRED,
        ):
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