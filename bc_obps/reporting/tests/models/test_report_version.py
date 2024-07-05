from common.tests.utils.helpers import BaseTestCase
from reporting.models.report_version import ReportVersion


class ReportVersionTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = ReportVersion.objects.create()
        cls.field_data = []
