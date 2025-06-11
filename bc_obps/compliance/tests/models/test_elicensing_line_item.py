from common.tests.utils.helpers import BaseTestCase
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from model_bakery.baker import make_recipe


class ElicensingLineItemTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = make_recipe(
            'compliance.tests.utils.elicensing_line_item',
        )
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "ID", None, None),
            ("elicensing_invoice", "elicensing invoice", None, None),
            ("object_id", "object id", None, None),
            ("guid", "guid", None, None),
            ("line_item_type", "line item type", None, None),
            ("elicensing_payments", "elicensing payment", None, None),
            ("elicensing_adjustments", "elicensing adjustment", None, None),
        ]
