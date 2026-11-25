from decimal import Decimal
from typing import Any, Dict, List, Tuple
from django.db.models import Prefetch, QuerySet

from compliance.service.elicensing.elicensing_invoice_service import STRFTIME_FORMAT
from compliance.models.elicensing_line_item import ElicensingLineItem
from compliance.models.elicensing_invoice import ElicensingInvoice

"""
Elicensing_invoice_calculator

Contains functions pertaining to financial calculations and line items for the invoice.
"""


class ElicensingInvoiceCalculatorService:
    @classmethod
    def calculate_invoice_amount_due(
        cls,
        invoice: ElicensingInvoice,
    ) -> Tuple[Decimal, List[Dict[str, Any]], Decimal, Decimal, Decimal]:
        billing_items: List[Dict[str, Any]] = []
        total_fee = Decimal("0.00")
        total_payments = Decimal("0.00")
        total_adjustments = Decimal("0.00")

        fee_line_items: QuerySet[ElicensingLineItem] = invoice.elicensing_line_items.prefetch_related(
            Prefetch("elicensing_payments"),
            Prefetch("elicensing_adjustments"),
        )

        if invoice.invoice_fee_balance != Decimal('0.00'):
            fee_line_items = fee_line_items.exclude(line_item_type=ElicensingLineItem.LineItemType.INTEREST)

        for line_item in fee_line_items:
            line_total, line_billing_items = cls._build_line_item_entry(line_item)
            billing_items.extend(line_billing_items)
            total_fee += line_total

            payments_total, payments_billing_items = cls._build_payment_entries(line_item)
            billing_items.extend(payments_billing_items)
            total_payments += payments_total

            adjustments_total, adjustments_billing_items = cls._build_adjustment_entries(line_item)
            billing_items.extend(adjustments_billing_items)
            total_adjustments += adjustments_total

        amount_due = (total_fee - total_payments + total_adjustments).quantize(Decimal("0.01"))
        return (
            amount_due,
            billing_items,
            total_fee.quantize(Decimal("0.01")),
            total_payments.quantize(Decimal("0.01")),
            total_adjustments.quantize(Decimal("0.01")),
        )

    @classmethod
    def _build_line_item_entry(cls, line_item: ElicensingLineItem) -> Tuple[Decimal, List[Dict[str, Any]]]:
        fee_date = line_item.fee_date.strftime(STRFTIME_FORMAT) if line_item.fee_date else "—"
        amount = line_item.base_amount
        entry = {
            "date": fee_date,
            "description": (
                "FAA Interest"
                if line_item.line_item_type == ElicensingLineItem.LineItemType.INTEREST
                else line_item.description
            ),
            "amount": f"${amount:,.2f}",
        }
        return amount, [entry]

    @classmethod
    def _build_payment_entries(cls, line_item: ElicensingLineItem) -> Tuple[Decimal, List[Dict[str, Any]]]:
        billing_items = []
        total = Decimal("0.00")

        for payment in line_item.elicensing_payments.all():
            date = payment.received_date.strftime(STRFTIME_FORMAT) if payment.received_date else "—"
            if line_item.line_item_type == ElicensingLineItem.LineItemType.INTEREST:
                description = "FAA Interest Payment"
            else:
                description = getattr(payment, "description", None) or f"Payment {payment.payment_object_id}"
            amount = payment.amount
            billing_items.append(
                {
                    "date": date,
                    "description": description,
                    "amount": f"(${amount:,.2f})",
                }
            )
            total += amount

        return total, billing_items

    @classmethod
    def _build_adjustment_entries(cls, line_item: ElicensingLineItem) -> Tuple[Decimal, List[Dict[str, Any]]]:
        billing_items = []
        total = Decimal("0.00")

        for adjustment in line_item.elicensing_adjustments.all():
            date = adjustment.adjustment_date.strftime(STRFTIME_FORMAT) if adjustment.adjustment_date else "—"
            description = adjustment.reason or f"Adjustment {adjustment.adjustment_object_id} ({adjustment.type})"
            amount = adjustment.amount
            billing_items.append(
                {
                    "date": date,
                    "description": description,
                    "amount": f"(${amount:,.2f})",
                }
            )
            total += amount

        return total, billing_items
