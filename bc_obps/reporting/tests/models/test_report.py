from common.tests.utils.helpers import BaseTestCase
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from reporting.tests.utils.bakers import report_baker


class ReportTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = report_baker()
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "ID", None, None),
            ("operator", "operator", None, None),
            ("operation", "operation", None, None),
            ("reporting_year", "reporting year", None, None),
            ("report_versions", "report version", None, 0),
            ("compliance_summaries", "compliance summary", None, 0),
        ]
