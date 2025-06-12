from common.tests.utils.helpers import BaseTestCase
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from model_bakery.baker import make_recipe


class ElicensingAdjustmentTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = make_recipe(
            'compliance.tests.utils.elicensing_adjustment',
        )
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "ID", None, None),
            ("elicensing_line_item", "elicensing line item", None, None),
            ("adjustment_object_id", "adjustment object id", None, None),
            ("amount", "amount", None, None),
            ("adjustment_date", "adjustment date", None, None),
            ("reason", "reason", None, None),
            ("type", "type", None, None),
            ("comment", "comment", None, None),
        ]
