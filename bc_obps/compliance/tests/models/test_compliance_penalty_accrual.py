from common.tests.utils.helpers import BaseTestCase
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from model_bakery.baker import make_recipe


class CompliancePenaltyAccrualTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = make_recipe('compliance.tests.utils.compliance_penalty_accrual')
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "ID", None, None),
            ("compliance_penalty", "compliance penalty", None, None),
            ("date", "date", None, None),
            ("daily_penalty", "daily penalty", None, None),
            ("daily_compounded", "daily compounded", None, None),
            ("accumulated_penalty", "accumulated penalty", None, None),
            ("accumulated_compounded", "accumulated compounded", None, None),
        ]
