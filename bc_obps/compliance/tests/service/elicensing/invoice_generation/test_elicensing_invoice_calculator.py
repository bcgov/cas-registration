from datetime import date
from decimal import Decimal
from model_bakery.baker import make_recipe
import pytest

from compliance.models.elicensing_adjustment import ElicensingAdjustment
from compliance.service.elicensing.invoice_generation.elicensing_invoice_calculator import (
    ElicensingInvoiceCalculatorService,
)
from compliance.models import (
    ElicensingInvoice,
    ElicensingLineItem,
)

pytestmark = pytest.mark.django_db


class TestElicensingInvoiceCalculatorService:
    @pytest.mark.parametrize(
        "fee_amount, payments, adjustments, expected_due, expected_billing_count",
        [
            (Decimal("300.00"), [], [], Decimal("300.00"), 1),
            (
                Decimal("300.00"),
                [{"amount": Decimal("100.00"), "date": date(2025, 6, 10), "description": "Partial Payment"}],
                [],
                Decimal("200.00"),
                2,
            ),
            (
                Decimal("300.00"),
                [],
                [{"amount": Decimal("-50.00"), "date": date(2025, 6, 12), "description": "Rebate"}],
                Decimal("250.00"),
                2,
            ),
            (
                Decimal("300.00"),
                [{"amount": Decimal("100.00"), "date": date(2025, 6, 10), "description": "Partial Payment"}],
                [{"amount": Decimal("-25.00"), "date": date(2025, 6, 12), "description": "Rebate"}],
                Decimal("175.00"),
                3,
            ),
            (None, [], [], Decimal("0.00"), 0),
        ],
    )
    def test_calculate_invoice_amount_due_parametrized(
        self, fee_amount, payments, adjustments, expected_due, expected_billing_count
    ):
        invoice: ElicensingInvoice = make_recipe("compliance.tests.utils.elicensing_invoice")

        if fee_amount is not None:
            line_item: ElicensingLineItem = make_recipe(
                "compliance.tests.utils.elicensing_line_item",
                elicensing_invoice=invoice,
                base_amount=fee_amount,
                fee_date=date(2025, 6, 1),
                description="Compliance Fee",
            )

            for p in payments:
                make_recipe(
                    "compliance.tests.utils.elicensing_payment",
                    elicensing_line_item=line_item,
                    amount=p["amount"],
                    received_date=p["date"],
                )

            for a in adjustments:
                make_recipe(
                    "compliance.tests.utils.elicensing_adjustment",
                    elicensing_line_item=line_item,
                    amount=a["amount"],
                    adjustment_date=a["date"],
                    reason=ElicensingAdjustment.Reason.COMPLIANCE_UNITS_APPLIED,
                    type="CREDIT",
                )

        # Act
        amount_due, billing_items, _, _, _ = ElicensingInvoiceCalculatorService.calculate_invoice_amount_due(invoice)

        # Assert
        assert amount_due == expected_due
        assert len(billing_items) == expected_billing_count
