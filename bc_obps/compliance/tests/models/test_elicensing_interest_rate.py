from common.tests.utils.helpers import BaseTestCase
from model_bakery.baker import make_recipe


class ElicensingInterestRateTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = make_recipe('compliance.tests.utils.elicensing_interest_rate')
        cls.field_data = [
            ("id", "ID", None, None),
            ("interest_rate", "interest rate", None, None),
            ("start_date", "start date", None, None),
            ("end_date", "end date", None, None),
        ]
