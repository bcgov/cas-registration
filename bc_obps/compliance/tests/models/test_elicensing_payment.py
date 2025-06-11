from common.tests.utils.helpers import BaseTestCase
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from model_bakery.baker import make_recipe


class ElicensingPaymentTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = make_recipe(
            'compliance.tests.utils.elicensing_payment',
        )
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "ID", None, None),
            ("elicensing_line_item", "elicensing line item", None, None),
            ("payment_object_id", "payment object id", None, None),
            ("amount", "amount", None, None),
            ("received_date", "received date", None, None),
        ]
