from datetime import date
from decimal import Decimal
from typing import Any, Dict, List
from django.http import HttpRequest
from django.utils import timezone
from compliance.models import (
    ComplianceObligation,
    ElicensingLineItem,
    ElicensingPayment,
)
from rls.utils.manager import RlsManager
from ..schemas import ScenarioPayload
from .base import ScenarioHandler


class PayObligationScenario(ScenarioHandler):
    """
    Records one or more payments against a compliance obligation so the
    "Pay Obligation and Track Payment(s)" page renders payment rows.
    """

    # Two partial payments that leave a balance owing (initial obligation is
    # $1,000,968.64), so the obligation remains not fully met.
    DEFAULT_PAYMENTS: List[Dict[str, Any]] = [
        {
            "amount": "500000.00",
            "received_date": "2025-12-18",
            "method": "Wire Transfer",
            "receipt_number": "E2E-RECEIPT-001",
        },
        {
            "amount": "300000.00",
            "received_date": "2025-12-20",
            "method": "Wire Transfer",
            "receipt_number": "E2E-RECEIPT-002",
        },
    ]

    BASE_PAYMENT_OBJECT_ID = 900001

    def execute(self, request: HttpRequest, data: ScenarioPayload) -> Dict[str, Any]:
        if data.compliance_report_version_id is None:
            raise ValueError("compliance_report_version_id is required for pay_obligation")

        payload = data.payload or {}
        payments_input: List[Dict[str, Any]] = payload.get("payments") or self.DEFAULT_PAYMENTS

        with RlsManager.bypass_rls():
            obligation = ComplianceObligation.objects.select_related("elicensing_invoice").get(
                compliance_report_version_id=data.compliance_report_version_id
            )
            invoice = obligation.elicensing_invoice
            if invoice is None:
                raise ValueError(
                    f"No elicensing invoice found for compliance_report_version_id={data.compliance_report_version_id}"
                )

            line_item = (
                ElicensingLineItem.objects.filter(
                    elicensing_invoice=invoice,
                    line_item_type=ElicensingLineItem.LineItemType.FEE,
                )
                .order_by("id")
                .first()
            )
            if line_item is None:
                raise ValueError(f"No fee line item found for invoice {invoice.invoice_number}")

            total_paid = Decimal("0.00")
            for index, payment in enumerate(payments_input):
                amount = Decimal(str(payment["amount"])).quantize(Decimal("0.00"))
                total_paid += amount
                ElicensingPayment.objects.update_or_create(
                    elicensing_line_item=line_item,
                    payment_object_id=self.BASE_PAYMENT_OBJECT_ID + index,
                    defaults={
                        "amount": amount,
                        "received_date": date.fromisoformat(payment["received_date"]),
                        "method": payment.get("method"),
                        "receipt_number": payment.get("receipt_number"),
                    },
                )

            # Reduce the balances by the amount paid and mark the invoice fresh so the page load
            # doesn't trigger a (mocked-empty) refresh that would wipe the payments we just wrote.
            current_balance = Decimal(invoice.invoice_fee_balance or line_item.base_amount)
            remaining = max(current_balance - total_paid, Decimal("0.00")).quantize(Decimal("0.00"))
            invoice.outstanding_balance = remaining
            invoice.invoice_fee_balance = remaining
            invoice.last_refreshed = timezone.now()
            invoice.save(update_fields=["outstanding_balance", "invoice_fee_balance", "last_refreshed"])

        return {
            "compliance_report_version_id": data.compliance_report_version_id,
            "invoice_number": invoice.invoice_number,
            "payment_count": len(payments_input),
            "total_paid": str(total_paid),
            "remaining_balance": str(remaining),
        }
