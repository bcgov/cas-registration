from common.tests.utils.helpers import BaseTestCase
from reporting.tests.utils.bakers import report_baker


class ReportTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = report_baker()
        cls.field_data = []
