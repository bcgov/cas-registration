from common.tests.utils.helpers import BaseTestCase
from reporting.tests.utils.report_data_bakers import report_new_entrant_production_baker
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS


class ReportNewEntrantProductionModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = report_new_entrant_production_baker()
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "ID", None, None),
            ("product", "product", None, None),
            ("report_new_entrant", "report new entrant", None, None),
            ("production_amount", "production amount", None, None),
        ]
