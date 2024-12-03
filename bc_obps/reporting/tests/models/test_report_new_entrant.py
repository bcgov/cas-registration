from common.tests.utils.helpers import BaseTestCase
from reporting.tests.utils.report_data_bakers import report_new_entrant_baker
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS


class ReportNewEntrantModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = report_new_entrant_baker()
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "ID", None, None),
            ("report_version", "report version", None, None),
            ("authorization_date", "authorization date", None, None),
            ("first_shipment_date", "first shipment date", None, None),
            ("new_entrant_period_start", "new entrant period start", None, None),
            ("assertion_statement", "assertion statement", None, None),
            ("productions", "report new entrant production", None, 0),
            ("report_new_entrant_emissions", "report new entrant emissions", None, None),
        ]
