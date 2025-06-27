from common.tests.utils.helpers import BaseTestCase
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from model_bakery.baker import make_recipe


class CompliancePeriodTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = make_recipe('compliance.tests.utils.compliance_period')
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "ID", None, None),
            ("start_date", "start date", None, None),
            ("end_date", "end date", None, None),
            ("compliance_deadline", "compliance deadline", None, None),
            ("reporting_year", "reporting year", None, None),
            ("compliance_reports", "compliance report", None, None),
        ]
