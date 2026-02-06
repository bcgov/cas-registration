from datetime import date
from decimal import Decimal
import pytest
from model_bakery import baker

from compliance.service.penalty.queries import has_outstanding_penalty

pytestmark = pytest.mark.django_db


class TestHasOutstandingPenaltyQuery:

    def setup_method(self):
        self.obligation = baker.make_recipe("compliance.tests.utils.compliance_obligation")

    def test_has_outstanding_penalty_true_when_invoice_has_positive_balance(self):
        invoice = baker.make_recipe(
            "compliance.tests.utils.elicensing_invoice",
            is_void=False,
            outstanding_balance=Decimal("10.00"),
        )

        baker.make_recipe(
            "compliance.tests.utils.compliance_penalty",
            compliance_obligation=self.obligation,
            elicensing_invoice=invoice,
            accrual_start_date=date.today(),
            penalty_type="Automatic Overdue",
        )

        assert has_outstanding_penalty(self.obligation.compliance_penalties.all()) is True

    def test_has_outstanding_penalty_false_when_invoice_balance_zero(self):
        invoice = baker.make_recipe(
            "compliance.tests.utils.elicensing_invoice",
            is_void=False,
            outstanding_balance=Decimal("0.00"),
        )

        baker.make_recipe(
            "compliance.tests.utils.compliance_penalty",
            compliance_obligation=self.obligation,
            elicensing_invoice=invoice,
            accrual_start_date=date.today(),
            penalty_type="Automatic Overdue",
        )

        assert has_outstanding_penalty(self.obligation.compliance_penalties.all()) is False

    def test_has_outstanding_penalty_false_when_invoice_void(self):
        invoice = baker.make_recipe(
            "compliance.tests.utils.elicensing_invoice",
            is_void=True,
            outstanding_balance=Decimal("10.00"),
        )

        baker.make_recipe(
            "compliance.tests.utils.compliance_penalty",
            compliance_obligation=self.obligation,
            elicensing_invoice=invoice,
            accrual_start_date=date.today(),
            penalty_type="Automatic Overdue",
        )

        assert has_outstanding_penalty(self.obligation.compliance_penalties.all()) is False

    def test_has_outstanding_penalty_false_when_penalty_has_no_invoice(self):
        baker.make_recipe(
            "compliance.tests.utils.compliance_penalty",
            compliance_obligation=self.obligation,
            elicensing_invoice=None,
            accrual_start_date=date.today(),
            penalty_type="Automatic Overdue",
        )

        assert has_outstanding_penalty(self.obligation.compliance_penalties.all()) is False
