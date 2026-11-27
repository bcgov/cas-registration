from common.tests.utils.helpers import BaseTestCase
from model_bakery.baker import make_recipe
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS


class ComplianceChargeRateTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = make_recipe("compliance.tests.utils.compliance_charge_rate")
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "ID", None, None),
            ("reporting_year", "reporting year", None, None),
            ("rate", "rate", None, None),
        ]
