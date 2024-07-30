from common.tests.utils.helpers import BaseTestCase
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from reporting.tests.utils.constants import REPORT_DATA_MODELS_COMMON_FIELDS
from reporting.tests.utils.report_data_bakers import report_methodology_baker


class ReportMethodologyModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = report_methodology_baker()
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            *REPORT_DATA_MODELS_COMMON_FIELDS,
            ("report_emission", "report emission", None, None),
        ]
