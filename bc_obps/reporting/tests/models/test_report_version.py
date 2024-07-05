from common.tests.utils.helpers import BaseTestCase
from reporting.tests.utils.bakers import report_version_baker


class ReportVersionTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = report_version_baker()
        cls.field_data = [
            ("id", "ID", None, None),
            ("report", "report", None, None),
            ("is_latest_submitted", "is latest submitted", None, None),
            ("status", "status", 1000, None),
            ("report_facilities", "report facility", None, 0),
            ("report_operation", "report operation", None, None),
        ]
