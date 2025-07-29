from common.tests.utils.helpers import BaseTestCase
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from model_bakery.baker import make_recipe


class ElicensingInvoiceTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = make_recipe('compliance.tests.utils.elicensing_invoice')
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
            ("last_refreshed", "last refreshed", None, None),
            ("elicensing_line_items", "elicensing line item", None, None),
            ("compliance_obligation", "compliance obligation", None, None),
            ("compliance_penalty", "compliance penalty", None, None),
        ]
