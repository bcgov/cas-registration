from datetime import date, datetime, time, timedelta
from decimal import Decimal
from typing import Any, Dict
from django.http import HttpRequest
from django.utils import timezone
from compliance.models import ComplianceObligation, ComplianceReportVersion, ElicensingInterestRate
from rls.utils.manager import RlsManager
from ..schemas import ScenarioPayload
from .base import ScenarioHandler


class MakeObligationOverdueScenario(ScenarioHandler):
    """
    Moves the dates around an obligation created by a real report submission, so penalties and interest
    accrue without waiting in real time.

    Dates are relative to today, so the scenario behaves the same all year:
    - The compliance deadline moves to `days_overdue` days ago, so the automatic overdue penalty accrues.
    - With `days_after_deadline`, the obligation is created that many days after the deadline. A supplementary
      report submitted after the deadline is late, so GGEAPAR interest accrues, and its invoice is due 30 days
      after submission.

    The compliance deadline belongs to the compliance period, which every report of that year shares, so
    the previous deadline is returned and can be put back with `restore_compliance_deadline`.

    Payload:
        report_version_id: Report version the compliance obligation was created from
        days_overdue: Days since the compliance deadline
        days_after_deadline: Days after the deadline the obligation was created
        restore_compliance_deadline: ISO date to set the compliance deadline back to. Only the deadline is
            changed, and the other options are ignored
    """

    DEFAULT_DAYS_OVERDUE = 45
    LATE_SUPPLEMENTARY_PAYMENT_DAYS = 30
    DEFAULT_INTEREST_RATE = Decimal("0.0625")

    def execute(self, request: HttpRequest, data: ScenarioPayload) -> Dict[str, Any]:
        payload = data.payload or {}
        if payload.get("report_version_id") is None:
            raise ValueError("report_version_id is required for make_obligation_overdue")
        report_version_id = int(payload["report_version_id"])
        days_overdue = int(payload.get("days_overdue", self.DEFAULT_DAYS_OVERDUE))
        days_after_deadline = payload.get("days_after_deadline")
        restore_compliance_deadline = payload.get("restore_compliance_deadline")

        compliance_deadline = timezone.localdate() - timedelta(days=days_overdue)

        with RlsManager.bypass_rls():
            crv = ComplianceReportVersion.objects.select_related(
                "compliance_report__compliance_period", "obligation__elicensing_invoice"
            ).get(report_compliance_summary__report_version_id=report_version_id)

            compliance_period = crv.compliance_report.compliance_period
            original_compliance_deadline = compliance_period.compliance_deadline

            if restore_compliance_deadline is not None:
                compliance_period.compliance_deadline = date.fromisoformat(restore_compliance_deadline)
                compliance_period.save(update_fields=["compliance_deadline"])
                return {
                    "compliance_report_version_id": crv.id,
                    "compliance_deadline": restore_compliance_deadline,
                }

            obligation = getattr(crv, "obligation", None)
            if obligation is None or obligation.elicensing_invoice is None:
                raise ValueError(f"Compliance report version {crv.id} has no invoiced obligation")

            compliance_period.compliance_deadline = compliance_deadline
            compliance_period.save(update_fields=["compliance_deadline"])

            updates: Dict[str, Any] = {"penalty_status": ComplianceObligation.PenaltyStatus.ACCRUING}
            invoice_due_date = compliance_deadline
            if days_after_deadline is not None:
                submitted_on = compliance_deadline + timedelta(days=int(days_after_deadline))
                updates["created_at"] = timezone.make_aware(datetime.combine(submitted_on, time(12, 0)))
                invoice_due_date = submitted_on + timedelta(days=self.LATE_SUPPLEMENTARY_PAYMENT_DAYS)
            ComplianceObligation.objects.filter(pk=obligation.pk).update(**updates)

            invoice = obligation.elicensing_invoice
            invoice.due_date = invoice_due_date
            invoice.save(update_fields=["due_date"])

            # GGEAPAR interest is calculated from the eLicensing interest rates
            if not ElicensingInterestRate.objects.exists():
                ElicensingInterestRate.objects.create(
                    interest_rate=self.DEFAULT_INTEREST_RATE,
                    start_date=date(2000, 1, 1),
                    end_date=date(2099, 12, 31),
                    is_current_rate=True,
                )

        return {
            "compliance_report_version_id": crv.id,
            "is_supplementary": crv.is_supplementary,
            "compliance_deadline": compliance_deadline.isoformat(),
            "original_compliance_deadline": original_compliance_deadline.isoformat(),
            "invoice_due_date": invoice_due_date.isoformat(),
        }
