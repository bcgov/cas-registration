from common.tests.utils.helpers import BaseTestCase
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from reporting.models import ReportRawActivityData
from reporting.tests.utils.report_data_bakers import report_raw_activity_data_baker


class ReportRawActivityDataModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = report_raw_activity_data_baker()
        
        cls.field_data = [
            ("id", "ID", None, None), 
            *TIMESTAMP_COMMON_FIELDS,
            ("facility_report", "facility report", None, None),
            ("activity", "activity", None, None),
            ("json_data", "json data", None, None),
        ]