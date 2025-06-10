from common.tests.utils.helpers import BaseTestCase
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from model_bakery.baker import make_recipe
from decimal import Decimal


class ElicensingInvoiceTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = make_recipe(
            'compliance.tests.utils.elicensing_invoice',
            due_date='2024-11-30',
            outstanding_balance=Decimal('100.01'),
            invoice_fee_balance=Decimal('100.01'),
            invoice_interest_balance=Decimal('0.00'),
        )
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "ID", None, None),
            ("invoice_number", "invoice number", None, None),
            ("elicensing_client_operator", "elicensing client operator", None, None),
            ("due_date", "due date", None, None),
            ("outstanding_balance", "outstanding balance", None, None),
            ("invoice_fee_balance", "invoice fee balance", None, None),
            ("invoice_interest_balance", "invoice interest balance", None, None),
            ("is_void", "is void", None, None),
            ("elicensing_line_items", "elicensing line item", None, None),
            ("elicensing_payments", "elicensing payment", None, None),
            ("elicensing_adjustments", "elicensing adjustment", None, None),
        ]
